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
const LogLevel_1 = require("../Logger/LogLevel");
class ConsoleSink {
    constructor() {
        this.RESET = "\x1b[0m";
        this.INFO = "\x1b[34m";
        this.WARN = "\x1b[33m";
        this.ERROR = "\x1b[31m";
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    log(message) {
        let msg = `${message.level.toUpperCase()}: ${message.context} --> ${message.message}`;
        // include stack trace
        if (message.exception) {
            msg = `${msg}
${message.exception.errorMessage}
${message.exception.stackTrace}`;
        }
        // include payload
        const payloadType = message.payloadType;
        if (payloadType && message[payloadType]) {
            msg = `${msg}
${JSON.stringify(message[payloadType])}`;
        }
        switch (message.level) {
            case LogLevel_1.LogLevel.Debug:
                console.log(msg);
                break;
            case LogLevel_1.LogLevel.Info:
                console.log(this.INFO + msg, this.RESET);
                break;
            case LogLevel_1.LogLevel.Warning:
                console.warn(this.WARN + msg, this.RESET);
                break;
            case LogLevel_1.LogLevel.Error:
            case LogLevel_1.LogLevel.Fatal:
            default:
                console.error(this.ERROR + msg, this.RESET);
                break;
        }
    }
}
exports.ConsoleSink = ConsoleSink;
//# sourceMappingURL=ConsoleSink.js.map