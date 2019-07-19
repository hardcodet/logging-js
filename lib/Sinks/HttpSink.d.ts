import { BatchedSink } from "./BatchedSink";
import { HttpSinkOptions } from "./HttpSinkOptions";
import { ILogMessage } from "../Logger/ILogMessage";
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
