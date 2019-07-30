import {ILogSink} from "./ILogSink";
import {ILogMessage} from "../Logger/ILogMessage";
import {LogLevel} from "../Logger/LogLevel";

export class ConsoleSink implements ILogSink {

    RESET = "\x1b[0m";
    INFO = "\x1b[34m";
    WARN = "\x1b[33m";
    ERROR = "\x1b[31m";


    public async flush(): Promise<void> {
        return;
    }

    public log(message: ILogMessage) {
        let msg: string = `${message.level.toUpperCase()}: ${message.context} --> ${message.message}`;
        let hasException: boolean;
        let hasPayload: boolean;

        // include stack trace
        hasException = !!message.exception;
        if (hasException) {
            msg = `${msg}
${message.exception.errorMessage}
${message.exception.stackTrace}`;
        }

        // include payload
        const payloadType = message.payloadType;
        hasPayload = payloadType && message[payloadType];
        if (hasPayload) {
            msg = `${msg}
${payloadType}: ${JSON.stringify(message[payloadType])}`;
        }

        if(hasException || hasPayload) {
            //add an additional line break if we had multi-line content
            msg = msg + "\n";
        }

        switch (message.level) {
            case LogLevel.Debug:
                console.log(msg);
                break;
            case LogLevel.Info:
                console.log(this.INFO + msg, this.RESET);
                break;
            case LogLevel.Warning:
                console.warn(this.WARN + msg, this.RESET);
                break;
            case LogLevel.Error:
            case LogLevel.Fatal:
            default:
                console.error(this.ERROR + msg, this.RESET);
                break;
        }
    }
}
