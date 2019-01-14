var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var BatchedSinkOptions = /** @class */ (function () {
    function BatchedSinkOptions() {
        this.sendIntervalMs = 5 * 1000;
        this.bufferSize = 100;
        this.internalDebugMessages = false;
        this.numberOfRetries = 3;
        this.suppressErrors = false;
        this.extraFields = undefined;
    }
    return BatchedSinkOptions;
}());
export { BatchedSinkOptions };
var HttpSinkOptions = /** @class */ (function (_super) {
    __extends(HttpSinkOptions, _super);
    function HttpSinkOptions(endpointUri, extraFields) {
        var _this = _super.call(this) || this;
        _this.endpointUri = endpointUri;
        _this.userAgent = 'logger-js';
        _this.extraFields = extraFields;
        return _this;
    }
    return HttpSinkOptions;
}(BatchedSinkOptions));
export { HttpSinkOptions };
/**
 * Base class for log sinks that process incoming messages in buffered batches.
 */
var BatchedSink = /** @class */ (function () {
    function BatchedSink(options) {
        this.closed = false;
        this.messages = [];
        this.timer = null;
        if (!options) {
            throw new Error('Options with valid endpoint are required.');
        }
        this.options = options;
        this.onSendTimer();
    }
    BatchedSink.prototype.log = function (msg) {
        if (this.closed) {
            throw new Error('Logging into a logger that has been closed!');
        }
        this.messages.push(msg);
        if (this.messages.length >= this.options.bufferSize) {
            this.logToConsole('Buffer is full - sending batch');
            this.processPendingMessages();
        }
    };
    BatchedSink.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // clearing the timer allows the node event loop to quit when needed
                        clearTimeout(this.timer);
                        if (!(this.messages.length > 0)) return [3 /*break*/, 2];
                        this.logToConsole('Closing, flushing messages.');
                        return [4 /*yield*/, this.processPendingMessages()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // no more logging allowed
                        this.closed = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Securely serializes structured data. In case of a serialization
     * error, the error will be returned instead.
     * @param msg
     */
    BatchedSink.prototype.jsonToString = function (msg) {
        try {
            return JSON.stringify(msg);
        }
        catch (ex) {
            return JSON.stringify("Unexpected error serializing log data: " + ex.toString());
        }
    };
    BatchedSink.prototype.logToConsole = function (msg) {
        /* tslint:disable-next-line */
        if (this.options.internalDebugMessages)
            console.log('js-logger: ' + msg);
    };
    BatchedSink.prototype.writeErrorToConsole = function (err) {
        if (err && !this.options.suppressErrors) {
            /* tslint:disable-next-line */
            console.error('js-logger error: ' + err, err);
        }
    };
    BatchedSink.prototype.onSendTimer = function () {
        var _this = this;
        if (this.messages.length > 0) {
            this.logToConsole("Got " + this.messages.length + " messages to send upon timer trigger. Sending now...");
            this.processPendingMessages();
        }
        this.timer = setTimeout(function () {
            _this.onSendTimer();
        }, this.options.sendIntervalMs);
    };
    BatchedSink.prototype.processPendingMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, msgs, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        msgs = this.messages;
                        this.messages = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.emitLogs(msgs)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        // restore messages by simply pushing them back into the current collection
                        this.logToConsole("Processing pending logs failed with unexpected error: " + error_1);
                        (_a = this.messages).push.apply(_a, msgs);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return BatchedSink;
}());
export { BatchedSink };
/**
 * Logs buffered messages to an HTTP endpoint with built-in retry capabilites.
 */
var HttpSink = /** @class */ (function (_super) {
    __extends(HttpSink, _super);
    function HttpSink() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.batchId = 1;
        return _this;
    }
    HttpSink.prototype.emitLogs = function (messages) {
        return __awaiter(this, void 0, void 0, function () {
            var batch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batch = this.createBatch(messages);
                        // send logs
                        return [4 /*yield*/, this.sendLogs(batch)];
                    case 1:
                        // send logs
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    HttpSink.prototype.createBatch = function (msgs) {
        var batch = {};
        // clones the messages and adds an additional @timestamp field
        batch.msgs = msgs.map(function (m) { return Object.assign({}, m, { '@timestamp': m.timestamp }); });
        batch.attemptNumber = 1;
        batch.sleepUntilNextRetry = 3 * 1000;
        batch.id = this.batchId++;
        return batch;
    };
    HttpSink.prototype.sendLogs = function (batch) {
        return __awaiter(this, void 0, void 0, function () {
            var body, options, response, msg, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = this.serializeMessages(batch.msgs);
                        options = {
                            body: body,
                            method: 'POST',
                            headers: {
                                accept: '*/*',
                                'user-agent': this.options.userAgent,
                                'content-type': 'text/plain',
                            },
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(this.options.endpointUri, options)];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            msg = "Posting logs failed with HTTP error: " + response.statusText;
                            this.handleSendError(batch, msg);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        ex_1 = _a.sent();
                        this.handleSendError(batch, ex_1.toString());
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    HttpSink.prototype.serializeMessages = function (msgs) {
        var body = '';
        for (var _i = 0, msgs_1 = msgs; _i < msgs_1.length; _i++) {
            var m = msgs_1[_i];
            body = "" + body + this.jsonToString(m) + "\n";
        }
        return body;
    };
    HttpSink.prototype.handleSendError = function (batch, errorMessage) {
        var _this = this;
        if (batch.attemptNumber >= this.options.numberOfRetries) {
            // retry limit exceeded - giving up
            var errorMsg = "Failed after " + batch.attemptNumber + " retries and giving up. Error: " + errorMessage;
            this.writeErrorToConsole(new Error(errorMsg));
        }
        else {
            // schedule retry
            this.logToConsole("Log batch #" + batch.id + " not sent and will retry. Reason: " + errorMessage);
            var sleepTimeMs = batch.sleepUntilNextRetry;
            batch.sleepUntilNextRetry = batch.sleepUntilNextRetry * 2;
            batch.attemptNumber++;
            setTimeout(function () {
                _this.sendLogs(batch);
            }, sleepTimeMs);
        }
    };
    return HttpSink;
}(BatchedSink));
export { HttpSink };
//# sourceMappingURL=Sinks.js.map