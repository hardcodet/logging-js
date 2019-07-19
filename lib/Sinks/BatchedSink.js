"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base class for log sinks that process incoming messages in buffered batches.
 */
class BatchedSink {
    constructor(options) {
        this.closed = false;
        this.messages = [];
        this.timer = null;
        if (!options) {
            throw new Error('Options with valid endpoint are required.');
        }
        this.options = options;
        this.onSendTimer();
    }
    log(msg) {
        if (this.closed) {
            throw new Error('Logging into a logger that has been closed!');
        }
        this.messages.push(msg);
        if (this.messages.length >= this.options.bufferSize) {
            this.logToConsole('Buffer is full - sending batch');
            this.processPendingMessages();
        }
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            // clearing the timer allows the node event loop to quit when needed
            clearTimeout(this.timer);
            // send pending messages, if any
            if (this.messages.length > 0) {
                this.logToConsole('Closing, flushing messages.');
                yield this.processPendingMessages();
            }
            // no more logging allowed
            this.closed = true;
        });
    }
    /**
     * Securely serializes structured data. In case of a serialization
     * error, the error will be returned instead.
     * @param msg
     */
    jsonToString(msg) {
        try {
            return JSON.stringify(msg);
        }
        catch (ex) {
            return JSON.stringify(`Unexpected error serializing log data: ${ex.toString()}`);
        }
    }
    logToConsole(msg) {
        /* tslint:disable-next-line */
        if (this.options.internalDebugMessages)
            console.log('js-logger: ' + msg);
    }
    writeErrorToConsole(err) {
        if (err && !this.options.suppressErrors) {
            /* tslint:disable-next-line */
            console.error('js-logger error: ' + err, err);
        }
    }
    onSendTimer() {
        if (this.messages.length > 0) {
            this.logToConsole(`Got ${this.messages.length} messages to send upon timer trigger. Sending now...`);
            this.processPendingMessages();
        }
        this.timer = setTimeout(() => {
            this.onSendTimer();
        }, this.options.sendIntervalMs);
    }
    processPendingMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            // reset the cache
            const msgs = this.messages;
            this.messages = [];
            try {
                yield this.emitLogs(msgs);
            }
            catch (error) {
                // restore messages by simply pushing them back into the current collection
                this.logToConsole(`Processing pending logs failed with unexpected error: ${error}`);
                this.messages.push(...msgs);
            }
        });
    }
}
exports.BatchedSink = BatchedSink;
//# sourceMappingURL=BatchedSink.js.map