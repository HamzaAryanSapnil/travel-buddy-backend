"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const subscription_service_1 = require("./subscription.service");
const getSubscriptionStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield subscription_service_1.SubscriptionService.getSubscriptionStatus(authUser);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription status retrieved successfully.",
        data: result,
    });
}));
const createSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield subscription_service_1.SubscriptionService.createSubscription(authUser, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Checkout session created successfully. Redirect user to the provided URL.",
        data: result,
    });
}));
const getSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield subscription_service_1.SubscriptionService.getSubscription(authUser, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription retrieved successfully.",
        data: result,
    });
}));
const getSubscriptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield subscription_service_1.SubscriptionService.getSubscriptions(authUser, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscriptions retrieved successfully.",
        meta: result.meta,
        data: result.data,
    });
}));
const updateSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield subscription_service_1.SubscriptionService.updateSubscription(authUser, req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription updated successfully.",
        data: result,
    });
}));
const cancelSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield subscription_service_1.SubscriptionService.cancelSubscription(authUser, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
}));
// Webhook handler - special case: needs raw body and signature
const handleWebhook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get raw body (should be Buffer from express.raw() middleware)
    // Check if body is already a Buffer (from express.raw())
    let rawBody;
    if (Buffer.isBuffer(req.body)) {
        // Body is already a Buffer (from express.raw())
        rawBody = req.body;
    }
    else if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
        // Raw body stored in req.rawBody
        rawBody = req.rawBody;
    }
    else {
        // Fallback: try to get from request
        console.error("⚠️ Raw body not found as Buffer. Body type:", typeof req.body);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Webhook payload must be provided as raw Buffer. Check middleware configuration.");
    }
    // Get signature from headers
    const signature = req.headers["stripe-signature"];
    if (!signature) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Missing Stripe signature.",
            data: null,
        });
    }
    console.log(`🔔 Webhook received - Body length: ${rawBody.length}, Signature: ${signature.substring(0, 20)}...`);
    const result = yield subscription_service_1.SubscriptionService.handleStripeWebhook(rawBody, signature);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Webhook processed successfully.",
        data: result,
    });
}));
// Sync subscription from Stripe (manual sync)
const syncSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const stripeSubscriptionId = req.params.stripeSubscriptionId;
    const result = yield subscription_service_1.SubscriptionService.syncSubscriptionFromStripe(authUser, stripeSubscriptionId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: result,
    });
}));
exports.SubscriptionController = {
    getSubscriptionStatus,
    createSubscription,
    getSubscription,
    getSubscriptions,
    updateSubscription,
    cancelSubscription,
    handleWebhook,
    syncSubscription,
};
