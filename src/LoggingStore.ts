import { ILogSink } from "./Sinks/ILogSink";
import { Logger } from "./Logger/Logger";
import { ILogger } from "./Logger/ILogger";

/**
 * Main controller for logging setup and logger creation.
 */
export class LoggingStore {
    private sinks: ILogSink[];

    constructor(
        private appName: string,
        private environment: string,
        sinks?: ILogSink[]
    ) {
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
        return new Logger(
            this.sinks,
            this.appName,
            this.environment.toUpperCase(),
            context
        );
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
