import { ILogSink } from './Sinks';
/**
 * Main controller for logging setup and logger creation.
 */
export declare class LoggingStore {
    private appName;
    private environment;
    private sinks;
    constructor(appName: string, environment: string, sinks?: ILogSink[]);
    /**
     * Adds an additional logging that is being used by all loggers.
     */
    addSink(sink: ILogSink): void;
    /**
     * Creates an independent logger that creates log messages in a given
     * context.
     */
    createLogger(context: string): ILogger;
    /**
     * Flushes all underlying sinks in order to makes sure buffered messages
     * are being emitted.
     */
    closeAndFlush(): Promise<void>;
}
/**
 * Encapsulates exception information.
 */
export interface IExceptionInfo {
    errorMessage?: string;
    errorData?: any;
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
 * along with the standard fields. The payload's name
 * will be used as an element key for structured
 * logging in order to avoid indexing conflicts with
 * different payloads that use the same keys.
 */
export interface IPayload {
    name: string;
    [data: string]: any;
}
/**
 * Basic logging API. A logger instance is created through the
 * LoggingStore.
 */
export interface ILogger {
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
export declare class Logger implements ILogger {
    private sinks;
    private appName;
    private environment;
    private context;
    constructor(sinks: ILogSink[], appName: string, environment: string, context: string);
    debug(message: string): any;
    debug(message: string, exception: Error): any;
    debug(message: string, payload: IPayload): any;
    debug(message: string, exception: Error, payload: IPayload): any;
    info(message: string): any;
    info(message: string, exception: Error): any;
    info(message: string, payload: IPayload): any;
    info(message: string, exception: Error, payload: IPayload): any;
    warn(message: string): any;
    warn(message: string, exception: Error): any;
    warn(message: string, payload: IPayload): any;
    warn(message: string, exception: Error, payload: IPayload): any;
    error(message: string): any;
    error(message: string, exception: Error): any;
    error(message: string, payload: IPayload): any;
    error(message: string, exception: Error, payload: IPayload): any;
    fatal(message: string): any;
    fatal(message: string, exception: Error): any;
    fatal(message: string, payload: IPayload): any;
    fatal(message: string, exception: Error, payload: IPayload): any;
    private log;
}
