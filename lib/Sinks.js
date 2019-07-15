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
class HttpSinkOptions extends BatchedSinkOptions {
    constructor(endpointUri, extraFields) {
        super();
        this.endpointUri = endpointUri;
        this.userAgent = 'logger-js';
        this.extraFields = extraFields;
    }
}
exports.HttpSinkOptions = HttpSinkOptions;
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
/**
 * Logs buffered messages to an HTTP endpoint with built-in retry capabilites.
 */
class HttpSink extends BatchedSink {
    constructor() {
        super(...arguments);
        this.batchId = 1;
    }
    emitLogs(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            // create batch
            const batch = this.createBatch(messages);
            // send logs
            yield this.sendLogs(batch);
        });
    }
    createBatch(msgs) {
        const batch = {};
        // clones the messages and adds an additional @timestamp field
        batch.msgs = msgs.map(m => Object.assign({}, m, { '@timestamp': m.timestamp }));
        batch.attemptNumber = 1;
        batch.sleepUntilNextRetry = 3 * 1000;
        batch.id = this.batchId++;
        return batch;
    }
    sendLogs(batch) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = this.serializeMessages(batch.msgs);
            const options = {
                body,
                method: 'POST',
                headers: {
                    accept: '*/*',
                    'user-agent': this.options.userAgent,
                    'content-type': 'text/plain',
                },
            };
            try {
                const response = yield fetch(this.options.endpointUri, options);
                if (!response.ok) {
                    // handle like any exception error locally
                    const msg = `Posting logs failed with HTTP error: ${response.statusText}`;
                    this.handleSendError(batch, msg);
                }
            }
            catch (ex) {
                this.handleSendError(batch, ex.toString());
            }
        });
    }
    serializeMessages(msgs) {
        let body = '';
        for (const m of msgs) {
            body = `${body}${this.jsonToString(m)}\n`;
        }
        return body;
    }
    handleSendError(batch, errorMessage) {
        if (batch.attemptNumber >= this.options.numberOfRetries) {
            // retry limit exceeded - giving up
            const errorMsg = `Failed after ${batch.attemptNumber} retries and giving up. Error: ${errorMessage}`;
            this.writeErrorToConsole(new Error(errorMsg));
        }
        else {
            // schedule retry
            this.logToConsole(`Log batch #${batch.id} not sent and will retry. Reason: ${errorMessage}`);
            const sleepTimeMs = batch.sleepUntilNextRetry;
            batch.sleepUntilNextRetry = batch.sleepUntilNextRetry * 2;
            batch.attemptNumber++;
            setTimeout(() => {
                this.sendLogs(batch);
            }, sleepTimeMs);
        }
    }
}
exports.HttpSink = HttpSink;
//# sourceMappingURL=Sinks.js.map