import { ILogSink } from './Sinks';

/**
 * Main controller for logging setup and logger creation.
 */
export class LoggingStore {
  private sinks: ILogSink[];

  constructor(private appName: string, private environment: string, sinks?: ILogSink[]) {
    this.sinks = sinks || [];
  }

  /**
   * Adds an additional logging that is being used by all loggers.
   */
  public addSink(sink: ILogSink) {
    this.sinks.push(sink);
  }

  /**
   * Creates an independent logger that creates log messages in a given
   * context.
   */
  public createLogger(context: string): ILogger {
    return new Logger(this.sinks, this.appName, this.environment.toUpperCase(), context);
  }

  /**
   * Flushes all underlying sinks in order to makes sure buffered messages
   * are being emitted.
   */
  public async closeAndFlush() {
    for (const s of this.sinks) {
      await s.flush();
    }
  }
}

/**
 * Encapsulates exception information.
 */
export interface IExceptionInfo {
  errorMessage: string;
  exceptionType: string;
  stackTrace: string;
}

/**
 * Basic log message data structure.
 */
export interface ILogMessage {
  timestamp: string;
  message: string;
  appName: string;
  env: string;
  clientId: string;
  context: string;
  level: string;
  payloadType?: string;
  payload?: any;
  isException: boolean;
  exception?: IExceptionInfo;
}

/**
 * Named structured data payload that can be logged
 * along with the standard fields.
 */
export interface IPayload {
  name: string;
  data: any;
}

/**
 * Basic logging API. A logger instance is created through the
 * LoggingStore.
 */
export interface ILogger {
  /* tslint:disable unified-signatures*/
  debug(message: string): void;
  debug(message: string, exception: Error): void;
  debug(message: string, payload: IPayload): void;
  debug(message: string, exception: Error, payload: IPayload): void;

  info(message: string): void;
  info(message: string, exception: Error): void;
  info(message: string, payload: IPayload): void;
  info(message: string, exception: Error, payload: IPayload): void;

  warn(message: string): void;
  warn(message: string, exception: Error): void;
  warn(message: string, payload: IPayload): void;
  warn(message: string, exception: Error, payload: IPayload): void;

  error(message: string): void;
  error(message: string, exception: Error): void;
  error(message: string, payload: IPayload): void;
  error(message: string, exception: Error, payload: IPayload): void;

  fatal(message: string): void;
  fatal(message: string, exception: Error): void;
  fatal(message: string, payload: IPayload): void;
  fatal(message: string, exception: Error, payload: IPayload): void;
}

export class Logger implements ILogger {
  constructor(
    private sinks: ILogSink[],
    private appName: string,
    private environment: string,
    private context: string
  ) {}

  /* tslint:disable unified-signatures */
  public debug(message: string);
  public debug(message: string, exception: Error);
  public debug(message: string, payload: IPayload);
  public debug(message: string, exception: Error, payload: IPayload);
  public debug(message: string, e?: Error | IPayload, pl?: IPayload) {
    this.log('Debug', message, e, pl);
  }

  public info(message: string);
  public info(message: string, exception: Error);
  public info(message: string, payload: IPayload);
  public info(message: string, exception: Error, payload: IPayload);
  public info(message: string, e?: Error | IPayload, pl?: IPayload) {
    this.log('Info', message, e, pl);
  }

  public warn(message: string);
  public warn(message: string, exception: Error);
  public warn(message: string, payload: IPayload);
  public warn(message: string, exception: Error, payload: IPayload);
  public warn(message: string, e?: Error | IPayload, pl?: IPayload) {
    this.log('Warning', message, e, pl);
  }

  public error(message: string);
  public error(message: string, exception: Error);
  public error(message: string, payload: IPayload);
  public error(message: string, exception: Error, payload: IPayload);
  public error(message: string, e?: Error | IPayload, pl?: IPayload) {
    this.log('Error', message, e, pl);
  }

  public fatal(message: string);
  public fatal(message: string, exception: Error);
  public fatal(message: string, payload: IPayload);
  public fatal(message: string, exception: Error, payload: IPayload);
  public fatal(message: string, e?: Error | IPayload, pl?: IPayload) {
    this.log('Fatal', message, e, pl);
  }

  private log(level: string, message: string, e: Error | IPayload, pl: IPayload) {
    const timestamp = new Date().toISOString();

    let exception: Error;
    let payload: IPayload;
    if (e) {
      if (e instanceof Error) {
        // 1st parameter is an error, 2nd is a payload or nothing
        exception = e;
        payload = pl; // may or may not be set
      } else {
        // the first parameter is a payload, we don't have an error
        payload = e;
      }
    }

    // create JSON to be submitted
    const logDto: ILogMessage = {
      timestamp,
      level,
      message,
      appName: this.appName,
      env: this.environment,
      clientId: 'n/a',
      context: this.context,
      isException: !!exception,
    };

    // inject payload information, if any
    if (payload) {
      const payloadType = payload.name;
      const payloadData = payload.data;

      //TODO HACK?
      const data2 = {...payload};
      delete data2.name;

      // inject payload information
      const plTypeAttribute = 'payloadType';
      logDto[plTypeAttribute] = payloadType;

      // payload data structure named after context_payload_type to
      // minimize the risk of indexing conflicts
      const payloadAttribute = `${this.context} ${payloadType}`;
      logDto[payloadAttribute] = payloadData;
    }

    // optionally also inject exception data, if we have any
    if (exception) {
      const exceptionInfo: IExceptionInfo = {
        errorMessage: exception.message,
        exceptionType: exception.name,
        stackTrace: exception.stack,
      };

      const excAttribute = 'exception';
      logDto[excAttribute] = exceptionInfo;
    }

    // TBD additional fields as per configuration? (extraFields can be any data structure)
    // -> may also be configured on sink-level
    // if(this.options.extraFields) {
    //     logDto = Object.assign(logDto, this.options.extraFields);
    // }

    // log into sinks
    for (const s of this.sinks) {
      s.log(logDto);
    }
  }
}
