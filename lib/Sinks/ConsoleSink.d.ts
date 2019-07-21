import { ILogSink } from "./ILogSink";
import { ILogMessage } from "../Logger/ILogMessage";
export declare class ConsoleSink implements ILogSink {
    RESET: string;
    INFO: string;
    WARN: string;
    ERROR: string;
    flush(): Promise<void>;
    log(message: ILogMessage): void;
}
