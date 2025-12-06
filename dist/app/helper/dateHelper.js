"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaysBetween = exports.isSameUTCDay = exports.getUTCDateStart = void 0;
/**
 * Get UTC date start (00:00:00 UTC) for a given date
 * @param date - Optional date, defaults to current date
 * @returns Date object at UTC midnight
 */
const getUTCDateStart = (date = new Date()) => {
    const d = new Date(date);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};
exports.getUTCDateStart = getUTCDateStart;
/**
 * Check if two dates are on the same UTC day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if both dates are on the same UTC day
 */
const isSameUTCDay = (date1, date2) => {
    const day1 = (0, exports.getUTCDateStart)(date1);
    const day2 = (0, exports.getUTCDateStart)(date2);
    return day1.getTime() === day2.getTime();
};
exports.isSameUTCDay = isSameUTCDay;
/**
 * Calculate number of days between two dates (inclusive)
 * @param start - Start date
 * @param end - End date
 * @returns Number of days between start and end (inclusive)
 */
const getDaysBetween = (start, end) => {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const diff = Math.abs(endTime - startTime);
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};
exports.getDaysBetween = getDaysBetween;
