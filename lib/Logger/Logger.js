"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LogLevel_1 = require("./LogLevel");
class Logger {
    constructor(sinks, appName, environment, context) {
        this.sinks = sinks;
        this.appName = appName;
        this.environment = environment;
        this.context = context;
    }
    debug(message, e, pl) {
        this.log(LogLevel_1.LogLevel.Debug, message, e, pl);
    }
    info(message, e, pl) {
        this.log(LogLevel_1.LogLevel.Info, message, e, pl);
    }
    warn(message, e, pl) {
        this.log(LogLevel_1.LogLevel.Warning, message, e, pl);
    }
    error(message, e, pl) {
        this.log(LogLevel_1.LogLevel.Error, message, e, pl);
    }
    fatal(message, e, pl) {
        this.log(LogLevel_1.LogLevel.Fatal, message, e, pl);
    }
    log(level, message, e, pl) {
        const timestamp = new Date().toISOString();
        let exception;
        let payload;
        if (e) {
            if (e instanceof Error) {
                // 1st parameter is an error, 2nd is a payload or nothing
                exception = e;
                payload = pl; // may or may not be set
            }
            else {
                // the first parameter is a payload, we don't have an error
                payload = e;
            }
        }
        // create JSON to be submitted
        const logDto = {
            timestamp,
            level,
            message,
            appName: this.appName,
            env: this.environment,
            clientId: 'n/a',
            context: this.context,
            isException: !!exception,
        };
        // inject payload information, if any
        if (payload) {
            const payloadType = payload.name || 'undefined';
            // extract payload data (everything but the name)
            const payloadData = Object.assign({}, payload);
            delete payloadData.name;
            // inject payload information
            const plTypeAttribute = 'payloadType';
            logDto[plTypeAttribute] = payloadType;
            // payload data structure named after payload type to
            // minimize the risk of indexing conflicts
            // note: this used to be [context] + [payloadType] to ensure it's unique.
            // but it sucks with regards to readability, with low risk, so go for type only now.
            // if the name is completely omitted (which would violate Typescript interface),
            // fall back to completely generic payload. As far as Typescript goes, this is
            // not an option due to high risk of index collision.
            const payloadAttribute = payload.name || "payload";
            logDto[payloadAttribute] = payloadData;
        }
        // optionally also inject exception data, if we have any
        if (exception) {
            const exceptionInfo = {
                exceptionType: exception.name,
                stackTrace: exception.stack,
            };
            // if the exception.message is not a string but an object (e.g. in NestJS), adjust the data structure. Yay dynamic languages.
            // @ts-ignore
            if (typeof exception.message === 'string' || exception.message instanceof String) {
                exceptionInfo.errorMessage = exception.message;
            }
            else {
                exceptionInfo.errorData = exception.message;
            }
            const excAttribute = 'exception';
            logDto[excAttribute] = exceptionInfo;
        }
        // TBD additional fields as per configuration? (extraFields can be any data structure)
        // -> may also be configured on sink-level
        // if(this.options.extraFields) {
        //     logDto = Object.assign(logDto, this.options.extraFields);
        // }
        // log into sinks
        for (const s of this.sinks) {
            s.log(logDto);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map