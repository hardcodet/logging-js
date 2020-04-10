import { ILogMessage } from './Logger';

export class BatchedSinkOptions {
  public sendIntervalMs: number = 5 * 1000;
  public bufferSize: number = 100;
  public internalDebugMessages: boolean = false;
  public numberOfRetries: number = 3;
  public suppressErrors: boolean = false;
  public extraFields: any = undefined;
}

export class HttpSinkOptions extends BatchedSinkOptions {
  public userAgent = 'logger-js';

  constructor(public endpointUri: string, extraFields?: any) {
    super();
    this.extraFields = extraFields;
  }
}

/**
 * Basic interface for logging endpoints.
 */
export interface ILogSink {
  /**
   * Receives a message to be logged.
   */
  log(msg: ILogMessage);

  /**
   * Ensures buffered messages are being logged.
   */
  flush(): Promise<void>;
}

/**
 * Base class for log sinks that process incoming messages in buffered batches.
 */
export abstract class BatchedSink<TOptions extends BatchedSinkOptions> implements ILogSink {
  protected options: TOptions;
  private closed: boolean = false;
  private messages = [];
  private timer = null;

  constructor(options: TOptions) {
    if (!options) {
      throw new Error('Options with valid endpoint are required.');
    }

    this.options = options;
    this.onSendTimer();
  }

  public log(msg: ILogMessage) {
    if (this.closed) {
      throw new Error('Logging into a logger that has been closed!');
    }

    if(this.options.extraFields) {
      msg = {...msg, ...this.options.extraFields}
    }

    this.messages.push(msg);
    if (this.messages.length >= this.options.bufferSize) {
      this.logToConsole('Buffer is full - sending batch');
      this.processPendingMessages();
    }
  }

  public async flush(): Promise<void> {
    // clearing the timer allows the node event loop to quit when needed
    clearTimeout(this.timer);

    // send pending messages, if any
    if (this.messages.length > 0) {
      this.logToConsole('Closing, flushing messages.');
      await this.processPendingMessages();
    }

    // no more logging allowed
    this.closed = true;
  }

  /**
   * Overridden by concrete sinks who log the actual messages.
   * @param messages
   */
  protected abstract async emitLogs(messages: ILogMessage[]): Promise<void>;

  /**
   * Securely serializes structured data. In case of a serialization
   * error, the error will be returned instead.
   * @param msg
   */
  protected jsonToString(msg: ILogMessage) {
    try {
      return JSON.stringify(msg);
    } catch (ex) {
      return JSON.stringify(`Unexpected error serializing log data: ${ex.toString()}`);
    }
  }

  protected logToConsole(msg) {
    /* tslint:disable-next-line */
    if (this.options.internalDebugMessages) console.log('js-logger: ' + msg);
  }

  protected writeErrorToConsole(err) {
    if (err && !this.options.suppressErrors) {
      /* tslint:disable-next-line */
      console.error('js-logger error: ' + err, err);
    }
  }

  private onSendTimer() {
    if (this.messages.length > 0) {
      this.logToConsole(`Got ${this.messages.length} messages to send upon timer trigger. Sending now...`);
      this.processPendingMessages();
    }

    this.timer = setTimeout(() => {
      this.onSendTimer();
    }, this.options.sendIntervalMs);
  }

  private async processPendingMessages() {
    // reset the cache
    const msgs = this.messages;
    this.messages = [];
    try {
      await this.emitLogs(msgs);
    } catch (error) {
      // restore messages by simply pushing them back into the current collection
      this.logToConsole(`Processing pending logs failed with unexpected error: ${error}`);
      this.messages.push(...msgs);
    }
  }
}

/**
 * Logs buffered messages to an HTTP endpoint with built-in retry capabilites.
 */
export class HttpSink extends BatchedSink<HttpSinkOptions> {
  private batchId = 1;

  protected async emitLogs(messages: ILogMessage[]): Promise<void> {
    // create batch
    const batch = this.createBatch(messages);

    // send logs
    await this.sendLogs(batch);
  }

  private createBatch(msgs: ILogMessage[]) {
    const batch: any = {};

    // clones the messages and adds an additional @timestamp field
    batch.msgs = msgs.map(m => Object.assign({}, m, { '@timestamp': m.timestamp }));

    batch.attemptNumber = 1;
    batch.sleepUntilNextRetry = 3 * 1000;
    batch.id = this.batchId++;

    return batch;
  }

  private async sendLogs(batch): Promise<void> {
    const body = this.serializeMessages(batch.msgs);
    const options = {
      body,
      method: 'POST',
      headers: {
        accept: '*/*',
        'user-agent': this.options.userAgent,
        'content-type': 'text/plain',
      },
    };

    try {
      const response = await fetch(this.options.endpointUri, options);
      if (!response.ok) {
        // handle like any exception error locally
        const msg = `Posting logs failed with HTTP error: ${response.statusText}`;
        this.handleSendError(batch, msg);
      }
    } catch (ex) {
      this.handleSendError(batch, ex.toString());
    }
  }

  private serializeMessages(msgs) {
    let body = '';

    for (const m of msgs) {
      body = `${body}${this.jsonToString(m)}\n`;
    }

    return body;
  }

  private handleSendError(batch, errorMessage: string) {
    if (batch.attemptNumber >= this.options.numberOfRetries) {
      // retry limit exceeded - giving up
      const errorMsg = `Failed after ${batch.attemptNumber} retries and giving up. Error: ${errorMessage}`;
      this.writeErrorToConsole(new Error(errorMsg));
    } else {
      // schedule retry
      this.logToConsole(`Log batch #${batch.id} not sent and will retry. Reason: ${errorMessage}`);
      const sleepTimeMs = batch.sleepUntilNextRetry;
      batch.sleepUntilNextRetry = batch.sleepUntilNextRetry * 2;
      batch.attemptNumber++;

      setTimeout(() => {
        this.sendLogs(batch);
      }, sleepTimeMs);
    }
  }
}
