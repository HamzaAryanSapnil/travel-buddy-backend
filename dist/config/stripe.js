"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishableKey = exports.getWebhookSecret = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const index_1 = __importDefault(require("./index"));
if (!index_1.default.stripe.secret_key) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}
// Initialize Stripe client
exports.stripe = new stripe_1.default(index_1.default.stripe.secret_key, {
    apiVersion: "2025-11-17.clover", // Latest Stripe API version
    typescript: true,
});
// Helper to get webhook secret
const getWebhookSecret = () => {
    if (!index_1.default.stripe.webhook_secret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not defined in environment variables");
    }
    return index_1.default.stripe.webhook_secret;
};
exports.getWebhookSecret = getWebhookSecret;
// Helper to get publishable key (for frontend reference)
const getPublishableKey = () => {
    if (!index_1.default.stripe.publishable_key) {
        throw new Error("STRIPE_PUBLISHABLE_KEY is not defined in environment variables");
    }
    return index_1.default.stripe.publishable_key;
};
exports.getPublishableKey = getPublishableKey;
