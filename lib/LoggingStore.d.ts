import { ILogSink } from "./Sinks/ILogSink";
import { ILogger } from "./Logger/ILogger";
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
