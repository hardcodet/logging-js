import {IExceptionInfo} from "./IExceptionInfo";
import {ILogMessage} from "./ILogMessage";
import {LogLevel} from "./LogLevel";
import {IPayload} from "./IPayload";
import {ILogger} from "./ILogger";
import {ILogSink} from "..";

export class Logger implements ILogger {

    constructor(
        private sinks: ILogSink[],
        private appName: string,
        private environment: string,
        private context: string,
        private minLevel: LogLevel = LogLevel.Debug
    ) {
    }

    /* tslint:disable unified-signatures */
    public debug(message: string);
    public debug(message: string, exception: Error);
    public debug(message: string, payload: IPayload);
    public debug(message: string, exception: Error, payload: IPayload);
    public debug(message: string, e?: Error | IPayload, pl?: IPayload) {
        this.log(LogLevel.Debug, message, e, pl);
    }

    public info(message: string);
    public info(message: string, exception: Error);
    public info(message: string, payload: IPayload);
    public info(message: string, exception: Error, payload: IPayload);
    public info(message: string, e?: Error | IPayload, pl?: IPayload) {
        this.log(LogLevel.Info, message, e, pl);
    }

    public warn(message: string);
    public warn(message: string, exception: Error);
    public warn(message: string, payload: IPayload);
    public warn(message: string, exception: Error, payload: IPayload);
    public warn(message: string, e?: Error | IPayload, pl?: IPayload) {
        this.log(LogLevel.Warning, message, e, pl);
    }

    public error(message: string);
    public error(message: string, exception: Error);
    public error(message: string, payload: IPayload);
    public error(message: string, exception: Error, payload: IPayload);
    public error(message: string, e?: Error | IPayload, pl?: IPayload) {
        this.log(LogLevel.Error, message, e, pl);
    }

    public fatal(message: string);
    public fatal(message: string, exception: Error);
    public fatal(message: string, payload: IPayload);
    public fatal(message: string, exception: Error, payload: IPayload);
    public fatal(message: string, e?: Error | IPayload, pl?: IPayload) {
        this.log(LogLevel.Fatal, message, e, pl);
    }

    private evaluateMinLevel(level: LogLevel): boolean {
        switch (this.minLevel) {
            case LogLevel.Fatal:
                return level == LogLevel.Fatal;
            case LogLevel.Debug:
                return true;
            case LogLevel.Info:
                return level !== LogLevel.Debug;
            case LogLevel.Warning:
                return level !== LogLevel.Debug && level !== LogLevel.Info;
            case LogLevel.Error:
                return level == LogLevel.Error || level == LogLevel.Fatal;
        }
    }

    private log(
        level: LogLevel,
        message: string,
        e: Error | IPayload,
        pl: IPayload
    ) {
        if (!this.evaluateMinLevel(level)) return;

        const timestamp = new Date().toISOString();

        let exception: Error;
        let payload: IPayload;
        if (e) {
            if (e instanceof Error) {
                // 1st parameter is an error, 2nd is a payload or nothing
                exception = e;
                payload = pl; // may or may not be set
            } else {
                // the first parameter is a payload, we don't have an error
                payload = e;
            }
        }

        // create JSON to be submitted
        const logDto: ILogMessage = {
            timestamp,
            level,
            message,
            appName: this.appName,
            env: this.environment,
            context: this.context,
            isException: !!exception,
        };

        // inject payload information, if any
        if (payload) {
            const payloadType = payload.name || "undefined";

            // extract payload data (everything but the name)
            const payloadData = {...payload};
            delete payloadData.name;

            // inject payload information
            const plTypeAttribute = "payloadType";
            logDto[plTypeAttribute] = payloadType;

            // payload data structure named after payload type to
            // minimize the risk of indexing conflicts
            // note: this used to be [context] + [payloadType] to ensure it's unique.
            // but it sucks with regards to readability, with low risk, so go for type only now.
            // if the name is completely omitted (which would violate Typescript interface),
            // fall back to completely generic payload. As far as Typescript goes, this is
            // not an option due to high risk of index collision in Elasticsearch.
            const payloadAttribute = payload.name || "payload";
            logDto[payloadAttribute] = payloadData;
        }

        // optionally also inject exception data, if we have any
        if (exception) {
            const exceptionInfo: IExceptionInfo = {
                exceptionType: exception.name,
                stackTrace: exception.stack,
            };

            // if the exception.message is not a string but an object (e.g. in NestJS), adjust the data structure. Yay dynamic languages.
            // @ts-ignore
            if (typeof exception.message === "string" || exception.message instanceof String) {
                exceptionInfo.errorMessage = exception.message;
            } else {
                exceptionInfo.errorData = exception.message;
            }

            const excAttribute = "exception";
            logDto[excAttribute] = exceptionInfo;
        }

        // log into sinks
        for (const s of this.sinks) {
            s.log(logDto);
        }
    }
}
