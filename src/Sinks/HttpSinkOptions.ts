import { BatchedSinkOptions } from "./BatchedSinkOptions";

export class HttpSinkOptions extends BatchedSinkOptions {
    public userAgent = "logger-js";
    public headers: any = undefined;

    constructor(public endpointUri: string) {
        super();
    }
}
