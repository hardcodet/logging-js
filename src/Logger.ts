import { decamelize, decamelizeKeys } from 'humps';
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
  error_message: string;
  exception_type: string;
  stack_trace: string;
}

/**
 * Basic log message data structure.
 */
export interface ILogMessage {
  timestamp: string;
  message: string;
  app_name: string;
  env: string;
  clientId: string;
  context: string;
  level: string;
  payload_type: string;
  payload: any;
  is_exception: boolean;
  exception: IExceptionInfo;
}

/**
 * Named structured data payload that can be logged
 * along with the standard fields.
 */
interface IPayload {
  name: string;
  data: any;
}

function instanceOfIPayload(object: any): object is IPayload {
  return 'name' in object && typeof object.name === 'string' && 'data' in object;
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
  debug(message: string, context: string): void;
  debug(message: string, exception: Error, payload: IPayload): void;

  info(message: string): void;
  info(message: string, exception: Error): void;
  info(message: string, payload: IPayload): void;
  info(message: string, context: string): void;
  info(message: string, exception: Error, payload: IPayload): void;

  warn(message: string): void;
  warn(message: string, exception: Error): void;
  warn(message: string, payload: IPayload): void;
  warn(message: string, context: string): void;
  warn(message: string, exception: Error, payload: IPayload): void;

  error(message: string): void;
  error(message: string, exception: Error): void;
  error(message: string, payload: IPayload): void;
  error(message: string, context: string): void;
  error(message: string, exception: Error, payload: IPayload): void;

  fatal(message: string): void;
  fatal(message: string, exception: Error): void;
  fatal(message: string, payload: IPayload): void;
  fatal(message: string, context: string): void;
  fatal(message: string, exception: Error, payload: IPayload): void;
}

export class Logger implements ILogger {
  constructor(
    private sinks: ILogSink[],
    private appName: string,
    private environment: string,
    private defaultContext: string
  ) {}

  /* tslint:disable unified-signatures */
  public debug(message: string);
  public debug(message: string, exception: Error);
  public debug(message: string, payload: IPayload);
  public debug(message: string, exception: Error, payload: IPayload);
  public debug(message: string, context: string);
  public debug(message: string, context?: Error | IPayload | string, e?: Error | IPayload, pl?: IPayload) {
    this.log('Debug', message, e, pl, context);
  }

  public info(message: string);
  public info(message: string, exception: Error);
  public info(message: string, payload: IPayload);
  public info(message: string, exception: Error, payload: IPayload);
  public info(message: string, context: string);
  public info(message: string, context?: Error | IPayload | string, e?: Error | IPayload, pl?: IPayload) {
    this.log('Info', message, e, pl, context);
  }

  public warn(message: string);
  public warn(message: string, exception: Error);
  public warn(message: string, payload: IPayload);
  public warn(message: string, exception: Error, payload: IPayload);
  public warn(message: string, context: string);
  public warn(message: string, context?: Error | IPayload | string, e?: Error | IPayload, pl?: IPayload) {
    this.log('Warning', message, e, pl, context);
  }

  public error(message: string);
  public error(message: string, exception: Error);
  public error(message: string, payload: IPayload);
  public error(message: string, exception: Error, payload: IPayload);
  public error(message: string, context: string);
  public error(message: string, context?: Error | IPayload | string, e?: Error | IPayload, pl?: IPayload) {
    this.log('Error', message, e, pl, context);
  }

  public fatal(message: string);
  public fatal(message: string, exception: Error);
  public fatal(message: string, payload: IPayload);
  public fatal(message: string, exception: Error, payload: IPayload);
  public fatal(message: string, context: string);
  public fatal(message: string, e?: Error | IPayload | string, pl?: IPayload, context?: string) {
    this.log('Fatal', message, e, pl, context);
  }

  private log(
    level: string,
    message: string,
    e: Error | IPayload | string,
    pl: IPayload | string,
    context: string
  ) {
    const timestamp = new Date().toISOString();

    let exception: Error;
    let payload: IPayload;
    let messageContext: string;

    // check for each of the possible types
    if (e) {
      if (e instanceof Error) {
        // first optional parameter is an error, second is a payload or context
        exception = e;

        if (typeof pl === 'string') {
          // second optional parameter is context, there is no payload
          messageContext = pl;
        } else {
          // second parameter is a payload, if third parameter provided, use it as context or else use the default context
          payload = pl;
          messageContext = context || this.defaultContext;
        }
      } else if (instanceOfIPayload(e)) {
        // first optional parameter is a payload, we don't have an error
        payload = e;

        if (typeof pl === 'string') {
          // second optional parameter is a context
          messageContext = pl;
        }
      } else if (typeof e === 'string') {
        // first optional parameter is context
        messageContext = e;
      } else {
        // no optional parameters, set context to default context
        messageContext = this.defaultContext;
      }
    }

    // create JSON to be submitted
    const logDto: any = {
      timestamp,
      level,
      message,
      app_name: this.appName,
      env: this.environment,
      clientId: 'n/a',
      context: messageContext,
      is_exception: !!exception,
    };

    // inject payload information, if any
    if (payload) {
      const payloadType = payload.name;
      // convert to snake-case
      const data = decamelizeKeys(payload.data);

      // inject payload information
      const plTypeAttribute = 'payload_type';
      logDto[plTypeAttribute] = payloadType;
      // payload data structure named after context_payload_type to
      // minimize the risk of conflicts
      const payloadAttribute = `${messageContext} ${decamelize(payloadType)}`;
      logDto[payloadAttribute] = data;
    }

    // optionally also inject exception data, if we have one
    if (exception) {
      const exceptionInfo = {
        error_message: exception.message,
        exception_type: exception.name,
        stack_trace: exception.stack,
      };

      const excAttribute = 'error';
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
