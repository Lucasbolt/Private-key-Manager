"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliFeedback = void 0;
var chalk_1 = __importDefault(require("chalk"));
var CliFeedback = /** @class */ (function () {
    function CliFeedback() {
    }
    /**
     * Displays a success message to the user.
     * @param nessage The success message to dislay.
     */
    CliFeedback.prototype.success = function (message) {
        console.log(chalk_1.default.green.bold("\u2705 ".concat(message)));
    };
    /**
     * Displays an informational message to the user.
     * @param message The informatioonal message to display.
     */
    CliFeedback.prototype.info = function (message) {
        console.log(chalk_1.default.cyan("i ".concat(message)));
    };
    /**
     * Displays a warning message to the user.
     * @param message The warning message to display.
     */
    CliFeedback.prototype.warn = function (message) {
        console.log(chalk_1.default.yellow.bold("\u26A0\uFE0F  ".concat(message)));
    };
    /**
     * Displays an error message to the user.
     * @param message The error message to display
     */
    CliFeedback.prototype.error = function (message) {
        console.log(chalk_1.default.red.bold("\u274C ".concat(message)));
    };
    /**
     * Displays a loading meesage to the user.
     * @param message The loading message to display
     */
    CliFeedback.prototype.loading = function (message) {
        console.log(chalk_1.default.blue("\uD83D\uDD04 ".concat(message)));
    };
    return CliFeedback;
}());
exports.cliFeedback = new CliFeedback();
