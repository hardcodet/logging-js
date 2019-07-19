import { BatchedSinkOptions } from "./BatchedSinkOptions";
import { ILogSink } from "./ILogSink";
import { ILogMessage } from "../Logger/ILogMessage";
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
