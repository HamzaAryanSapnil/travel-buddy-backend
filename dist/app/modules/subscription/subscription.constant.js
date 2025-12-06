"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = exports.SUBSCRIPTION_PLANS = exports.subscriptionPlanTypeEnum = exports.subscriptionStatusEnum = exports.subscriptionSearchableFields = exports.subscriptionFilterableFields = void 0;
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "SubscriptionStatus", { enumerable: true, get: function () { return client_1.SubscriptionStatus; } });
exports.subscriptionFilterableFields = [
    "status",
    "planType",
    "planName",
];
exports.subscriptionSearchableFields = []; // No searchable fields
exports.subscriptionStatusEnum = [
    "ACTIVE",
    "PAST_DUE",
    "CANCELLED",
    "EXPIRED",
];
exports.subscriptionPlanTypeEnum = ["MONTHLY", "YEARLY"];
// Subscription Plans Configuration
exports.SUBSCRIPTION_PLANS = {
    MONTHLY: {
        name: "Monthly Plan",
        price: 9.99,
        interval: "month",
        priceId: process.env.STRIPE_MONTHLY_PRICE_ID || "", // Set in .env
    },
    YEARLY: {
        name: "Yearly Plan",
        price: 99.99,
        interval: "year",
        priceId: process.env.STRIPE_YEARLY_PRICE_ID || "", // Set in .env
    },
};
