"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyEnum = exports.paymentStatusEnum = exports.paymentSearchableFields = exports.paymentFilterableFields = void 0;
exports.paymentFilterableFields = [
    "status",
    "userId",
    "subscriptionId",
    "currency",
    "startDate",
    "endDate",
];
exports.paymentSearchableFields = []; // No searchable fields
// Payment Status Enum (matching database values)
exports.paymentStatusEnum = [
    "SUCCEEDED",
    "PENDING",
    "REFUNDED",
    "FAILED",
];
// Currency codes (common ones)
exports.currencyEnum = [
    "USD",
    "EUR",
    "GBP",
    "CAD",
    "AUD",
    "JPY",
    "INR",
    "BDT",
];
