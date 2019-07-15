import { ILogMessage } from './Logger';
export declare class BatchedSinkOptions {
    sendIntervalMs: number;
    bufferSize: number;
    internalDebugMessages: boolean;
    numberOfRetries: number;
    suppressErrors: boolean;
    extraFields: any;
}
export declare class HttpSinkOptions extends BatchedSinkOptions {
    endpointUri: string;
    userAgent: string;
    constructor(endpointUri: string, extraFields?: any);
}
/**
 * Basic interface for logging endpoints.
 */
export interface ILogSink {
    /**
     * Receives a message to be logged.
     */
    log(msg: ILogMessage): any;
    /**
     * Ensures buffered messages are being logged.
     */
    flush(): Promise<void>;
}
/**
 * Base class for log sinks that process incoming messages in buffered batches.
 */
export declare abstract class BatchedSink<TOptions extends BatchedSinkOptions> implements ILogSink {
    protected options: TOptions;
    private closed;
    private messages;
    private timer;
    constructor(options: TOptions);
    log(msg: ILogMessage): void;
    flush(): Promise<void>;
    /**
     * Overridden by concrete sinks who log the actual messages.
     * @param messages
     */
    protected abstract emitLogs(messages: ILogMessage[]): Promise<void>;
    /**
     * Securely serializes structured data. In case of a serialization
     * error, the error will be returned instead.
     * @param msg
     */
    protected jsonToString(msg: ILogMessage): string;
    protected logToConsole(msg: any): void;
    protected writeErrorToConsole(err: any): void;
    private onSendTimer;
    private processPendingMessages;
}
/**
 * Logs buffered messages to an HTTP endpoint with built-in retry capabilites.
 */
export declare class HttpSink extends BatchedSink<HttpSinkOptions> {
    private batchId;
    protected emitLogs(messages: ILogMessage[]): Promise<void>;
    private createBatch;
    private sendLogs;
    private serializeMessages;
    private handleSendError;
}
