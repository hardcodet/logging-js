import {IPayload} from "./IPayload";

/**
 * Basic logging API. A logger instance is created through the
 * LoggingStore.
 */
export interface ILogger {
    /* tslint:disable unified-signatures*/
    debug(message: string): void;

    debug(message: string, exception: Error): void;

    debug(message: string, payload: IPayload): void;

    debug(message: string, exception: Error, payload: IPayload): void;

    info(message: string): void;

    info(message: string, exception: Error): void;

    info(message: string, payload: IPayload): void;

    info(message: string, exception: Error, payload: IPayload): void;

    warn(message: string): void;

    warn(message: string, exception: Error): void;

    warn(message: string, payload: IPayload): void;

    warn(message: string, exception: Error, payload: IPayload): void;

    error(message: string): void;

    error(message: string, exception: Error): void;

    error(message: string, payload: IPayload): void;

    error(message: string, exception: Error, payload: IPayload): void;

    fatal(message: string): void;

    fatal(message: string, exception: Error): void;

    fatal(message: string, payload: IPayload): void;

    fatal(message: string, exception: Error, payload: IPayload): void;
}
