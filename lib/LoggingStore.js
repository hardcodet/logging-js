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
const Logger_1 = require("./Logger/Logger");
/**
 * Main controller for logging setup and logger creation.
 */
class LoggingStore {
    constructor(appName, environment, sinks) {
        this.appName = appName;
        this.environment = environment;
        this.sinks = sinks || [];
    }
    /**
     * Adds an additional logging that is being used by all loggers.
     */
    addSink(sink) {
        this.sinks.push(sink);
    }
    /**
     * Creates an independent logger that creates log messages in a given
     * context.
     */
    createLogger(context) {
        return new Logger_1.Logger(this.sinks, this.appName, this.environment.toUpperCase(), context);
    }
    /**
     * Flushes all underlying sinks in order to makes sure buffered messages
     * are being emitted.
     */
    closeAndFlush() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const s of this.sinks) {
                yield s.flush();
            }
        });
    }
}
exports.LoggingStore = LoggingStore;
//# sourceMappingURL=LoggingStore.js.map