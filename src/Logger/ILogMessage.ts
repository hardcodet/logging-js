import { IExceptionInfo } from "./IExceptionInfo";
import { LogLevel } from "./LogLevel";

/**
 * Basic log message data structure.
 */
export interface ILogMessage {
    timestamp: string;
    message: string;
    appName: string;
    env: string;
    context: string;
    level: LogLevel;
    payloadType?: string;
    isException: boolean;
    exception?: IExceptionInfo;
}
