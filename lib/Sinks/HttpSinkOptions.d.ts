import { BatchedSinkOptions } from "./BatchedSinkOptions";
export declare class HttpSinkOptions extends BatchedSinkOptions {
    endpointUri: string;
    userAgent: string;
    constructor(endpointUri: string, extraFields?: any);
}
