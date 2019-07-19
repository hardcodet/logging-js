import {ILogMessage} from "../Logger/ILogMessage";

/**
 * Basic interface for logging endpoints.
 */
export interface ILogSink {
    /**
     * Receives a message to be logged.
     */
    log(msg: ILogMessage);

    /**
     * Ensures buffered messages are being logged.
     */
    flush(): Promise<void>;
}
