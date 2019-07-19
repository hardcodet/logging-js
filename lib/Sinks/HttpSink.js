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
const BatchedSink_1 = require("./BatchedSink");
/**
 * Logs buffered messages to an HTTP endpoint with built-in retry capabilites.
 */
class HttpSink extends BatchedSink_1.BatchedSink {
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
//# sourceMappingURL=HttpSink.js.map