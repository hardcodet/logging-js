import { ILogSink } from "./ILogSink";
import { ILogMessage } from "../Logger/ILogMessage";
export declare class ConsoleSink implements ILogSink {
    flush(): Promise<void>;
    log(msg: ILogMessage): void;
}
