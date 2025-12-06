"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pick = (obj, keys) => {
    const result = {};
    keys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
            result[key] = obj[key];
        }
    });
    return result;
};
exports.default = pick;
