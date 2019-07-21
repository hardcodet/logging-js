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
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    log(message) {
        let msg = `${message.level.toUpperCase()}: ${message.context} --> ${message.message}`;
        if (message.payload) {
            msg = `${msg}
${JSON.stringify(message.payload)}`;
        }
        switch (message.level) {
            case LogLevel_1.LogLevel.Debug:
            case LogLevel_1.LogLevel.Info:
                console.log(msg);
                break;
            case LogLevel_1.LogLevel.Warning:
                console.warn(msg);
                break;
            case LogLevel_1.LogLevel.Error:
            case LogLevel_1.LogLevel.Fatal:
            default:
                console.error(msg);
                break;
        }
    }
}
exports.ConsoleSink = ConsoleSink;
//# sourceMappingURL=ConsoleSink.js.map