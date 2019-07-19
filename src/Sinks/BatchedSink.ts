import {BatchedSinkOptions} from "./BatchedSinkOptions";
import {ILogSink} from "./ILogSink";
import {ILogMessage} from "../Logger/ILogMessage";

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
