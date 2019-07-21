import {ILogSink} from "./ILogSink";
import {ILogMessage} from "../Logger/ILogMessage";
import {LogLevel} from "../Logger/LogLevel";

export class ConsoleSink implements ILogSink {
    public async flush(): Promise<void> {
        return;
    }

    public log(message: ILogMessage) {
        let msg: string = `${message.level.toUpperCase()}: ${message.context} --> ${message.message}`;
        if (message.payload) {
            msg = `${msg}
${JSON.stringify(message.payload)}`;
        }

        switch (message.level) {
            case LogLevel.Debug:
            case LogLevel.Info:
                console.log(msg);
                break;
            case LogLevel.Warning:
                console.warn(msg);
                break;
            case LogLevel.Error:
            case LogLevel.Fatal:
            default:
                console.error(msg);
                break;
        }
    }
}
