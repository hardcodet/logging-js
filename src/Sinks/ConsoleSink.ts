import {ILogSink} from "./ILogSink";
import {ILogMessage} from "../Logger/ILogMessage";
import {LogLevel} from "../Logger/LogLevel";

export class ConsoleSink implements ILogSink {
    public async flush(): Promise<void> {
        return;
    }

    log(msg: ILogMessage) {
        switch (msg.level) {
            case LogLevel.Debug:
            case LogLevel.Info:
                console.log(msg);
                break;
            case LogLevel.Warning:
                console.warn(msg);
                break;
            case LogLevel.Error:
            case LogLevel.Fatal:
                console.error(msg);
                break;
        }
    }
}
