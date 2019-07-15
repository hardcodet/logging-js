var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
/**
 * Main controller for logging setup and logger creation.
 */
var LoggingStore = /** @class */ (function () {
    function LoggingStore(appName, environment, sinks) {
        this.appName = appName;
        this.environment = environment;
        this.sinks = sinks || [];
    }
    /**
     * Adds an additional logging that is being used by all loggers.
     */
    LoggingStore.prototype.addSink = function (sink) {
        this.sinks.push(sink);
    };
    /**
     * Creates an independent logger that creates log messages in a given
     * context.
     */
    LoggingStore.prototype.createLogger = function (context) {
        return new Logger(this.sinks, this.appName, this.environment.toUpperCase(), context);
    };
    /**
     * Flushes all underlying sinks in order to makes sure buffered messages
     * are being emitted.
     */
    LoggingStore.prototype.closeAndFlush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, s;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.sinks;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        s = _a[_i];
                        return [4 /*yield*/, s.flush()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return LoggingStore;
}());
export { LoggingStore };
var Logger = /** @class */ (function () {
    function Logger(sinks, appName, environment, context) {
        this.sinks = sinks;
        this.appName = appName;
        this.environment = environment;
        this.context = context;
    }
    Logger.prototype.debug = function (message, e, pl) {
        this.log('Debug', message, e, pl);
    };
    Logger.prototype.info = function (message, e, pl) {
        this.log('Info', message, e, pl);
    };
    Logger.prototype.warn = function (message, e, pl) {
        this.log('Warning', message, e, pl);
    };
    Logger.prototype.error = function (message, e, pl) {
        this.log('Error', message, e, pl);
    };
    Logger.prototype.fatal = function (message, e, pl) {
        this.log('Fatal', message, e, pl);
    };
    Logger.prototype.log = function (level, message, e, pl) {
        var timestamp = new Date().toISOString();
        var exception;
        var payload;
        if (e) {
            if (e instanceof Error) {
                // 1st parameter is an error, 2nd is a payload or nothing
                exception = e;
                payload = pl; // may or may not be set
            }
            else {
                // the first parameter is a payload, we don't have an error
                payload = e;
            }
        }
        // create JSON to be submitted
        var logDto = {
            timestamp: timestamp,
            level: level,
            message: message,
            appName: this.appName,
            env: this.environment,
            clientId: 'n/a',
            context: this.context,
            isException: !!exception,
        };
        // inject payload information, if any
        if (payload) {
            var payloadType = payload.name || "undefined";
            // extract payload data (everything but the name)
            var payloadData = __assign({}, payload);
            delete payloadData.name;
            // inject payload information
            var plTypeAttribute = 'payloadType';
            logDto[plTypeAttribute] = payloadType;
            // payload data structure named after context_payload_type to
            // minimize the risk of indexing conflicts
            var payloadAttribute = this.context + " " + payloadType;
            logDto[payloadAttribute] = payloadData;
        }
        // optionally also inject exception data, if we have any
        if (exception) {
            var exceptionInfo = {
                errorMessage: exception.message,
                exceptionType: exception.name,
                stackTrace: exception.stack,
            };
            var excAttribute = 'exception';
            logDto[excAttribute] = exceptionInfo;
        }
        // TBD additional fields as per configuration? (extraFields can be any data structure)
        // -> may also be configured on sink-level
        // if(this.options.extraFields) {
        //     logDto = Object.assign(logDto, this.options.extraFields);
        // }
        // log into sinks
        for (var _i = 0, _a = this.sinks; _i < _a.length; _i++) {
            var s = _a[_i];
            s.log(logDto);
        }
    };
    return Logger;
}());
export { Logger };
//# sourceMappingURL=Logger.js.map