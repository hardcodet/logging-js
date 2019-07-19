"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BatchedSinkOptions_1 = require("./BatchedSinkOptions");
class HttpSinkOptions extends BatchedSinkOptions_1.BatchedSinkOptions {
    constructor(endpointUri, extraFields) {
        super();
        this.endpointUri = endpointUri;
        this.userAgent = 'logger-js';
        this.extraFields = extraFields;
    }
}
exports.HttpSinkOptions = HttpSinkOptions;
//# sourceMappingURL=HttpSinkOptions.js.map