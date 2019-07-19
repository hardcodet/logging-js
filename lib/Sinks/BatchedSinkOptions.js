"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BatchedSinkOptions {
    constructor() {
        this.sendIntervalMs = 5 * 1000;
        this.bufferSize = 100;
        this.internalDebugMessages = false;
        this.numberOfRetries = 3;
        this.suppressErrors = false;
        this.extraFields = undefined;
    }
}
exports.BatchedSinkOptions = BatchedSinkOptions;
//# sourceMappingURL=BatchedSinkOptions.js.map