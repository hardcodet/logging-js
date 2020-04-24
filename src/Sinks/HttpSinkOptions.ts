import { BatchedSinkOptions } from "./BatchedSinkOptions";

export class HttpSinkOptions extends BatchedSinkOptions {
    public userAgent = "logger-js";

    constructor(public endpointUri: string, extraFields?: any) {
        super();
        this.extraFields = extraFields;
    }
}
