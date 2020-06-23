export class BatchedSinkOptions {
    public sendIntervalMs: number = 5 * 1000;
    public bufferSize: number = 100;
    public internalDebugMessages: boolean = false;
    public numberOfRetries: number = 3;
    public suppressErrors: boolean = false;

    /**
     * Dynamically populates extra-fields for every log message.
     */
    public extraFields: () => any = undefined;
}
