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
exports.SubscriptionService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
const stripe_1 = require("../../../config/stripe");
const notification_service_1 = require("../notification/notification.service");
const subscription_constant_1 = require("./subscription.constant");
const config_1 = __importDefault(require("../../../config"));
/**
 * Helper: Get or create Stripe customer
 * @param userId - User ID
 * @param email - User email
 * @returns Stripe customer ID
 */
const getOrCreateStripeCustomer = (userId, email) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user already has a Stripe customer ID stored in metadata or subscription
    const existingSubscription = yield prisma_1.prisma.subscription.findFirst({
        where: {
            userId,
        },
        select: {
            metadata: true,
        },
    });
    // Try to extract customer ID from metadata
    if (existingSubscription === null || existingSubscription === void 0 ? void 0 : existingSubscription.metadata) {
        const metadata = existingSubscription.metadata;
        if (metadata.stripeCustomerId) {
            // Verify customer still exists in Stripe
            try {
                yield stripe_1.stripe.customers.retrieve(metadata.stripeCustomerId);
                return metadata.stripeCustomerId;
            }
            catch (error) {
                // Customer doesn't exist, create new one
            }
        }
    }
    // Create new Stripe customer
    const customer = yield stripe_1.stripe.customers.create({
        email,
        metadata: {
            userId,
        },
    });
    return customer.id;
});
/**
 * Calculate expiration date based on plan type
 * @param planType - MONTHLY or YEARLY
 * @param startDate - Start date
 * @returns Expiration date
 */
const calculateExpirationDate = (planType, startDate) => {
    const expiration = new Date(startDate);
    if (planType === "MONTHLY") {
        expiration.setMonth(expiration.getMonth() + 1);
    }
    else {
        expiration.setFullYear(expiration.getFullYear() + 1);
    }
    return expiration;
};
/**
 * Calculate days remaining until expiration
 * @param expiresAt - Expiration date
 * @returns Days remaining or null if no expiration
 */
const calculateDaysRemaining = (expiresAt) => {
    if (!expiresAt)
        return null;
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
};
/**
 * Get current subscription status for authenticated user
 * @param authUser - Authenticated user
 * @returns Subscription status with details
 */
const getSubscriptionStatus = (authUser) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    // Get active subscription
    const subscription = yield prisma_1.prisma.subscription.findFirst({
        where: {
            userId: authUser.userId,
            status: client_1.SubscriptionStatus.ACTIVE,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: now } },
            ],
        },
        select: {
            id: true,
            planName: true,
            planType: true,
            status: true,
            startedAt: true,
            expiresAt: true,
            cancelAtPeriodEnd: true,
        },
        orderBy: {
            startedAt: "desc",
        },
    });
    if (!subscription) {
        return {
            hasSubscription: false,
            subscription: null,
        };
    }
    return {
        hasSubscription: true,
        subscription: {
            id: subscription.id,
            planName: subscription.planName,
            planType: subscription.planType,
            status: subscription.status,
            startedAt: subscription.startedAt,
            expiresAt: subscription.expiresAt,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            daysRemaining: calculateDaysRemaining(subscription.expiresAt),
        },
    };
});
/**
 * Get single subscription by ID
 * @param authUser - Authenticated user
 * @param subscriptionId - Subscription ID
 * @returns Subscription details
 */
const getSubscription = (authUser, subscriptionId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load subscription with user
    const subscription = yield prisma_1.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
        },
    });
    if (!subscription) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Subscription not found.");
    }
    // Verify user owns subscription OR is admin
    if (subscription.userId !== authUser.userId && authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to view this subscription.");
    }
    return {
        id: subscription.id,
        userId: subscription.userId,
        planName: subscription.planName,
        planType: subscription.planType,
        status: subscription.status,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        startedAt: subscription.startedAt,
        expiresAt: subscription.expiresAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        metadata: subscription.metadata,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        user: subscription.user,
    };
});
/**
 * Get all subscriptions (admin only) with pagination and filters
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated subscriptions
 */
const getSubscriptions = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Admin only
    if (authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Only admins can view all subscriptions.");
    }
    // Pagination
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        sortBy: query.sortBy || "startedAt",
        sortOrder: query.sortOrder || "desc",
    });
    // Build where clause
    const andConditions = [];
    // Filter by status
    if (query.status) {
        andConditions.push({
            status: query.status,
        });
    }
    // Filter by planType
    if (query.planType) {
        andConditions.push({
            planType: query.planType,
        });
    }
    // Filter by planName
    if (query.planName) {
        andConditions.push({
            planName: {
                contains: query.planName,
                mode: "insensitive",
            },
        });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    // Get subscriptions and total count
    const [subscriptions, total] = yield Promise.all([
        prisma_1.prisma.subscription.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profileImage: true,
                    },
                },
            },
        }),
        prisma_1.prisma.subscription.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        data: subscriptions.map((sub) => ({
            id: sub.id,
            userId: sub.userId,
            planName: sub.planName,
            planType: sub.planType,
            status: sub.status,
            stripeSubscriptionId: sub.stripeSubscriptionId,
            startedAt: sub.startedAt,
            expiresAt: sub.expiresAt,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            metadata: sub.metadata,
            createdAt: sub.createdAt,
            updatedAt: sub.updatedAt,
            user: sub.user,
        })),
    };
});
/**
 * Create a new subscription checkout session
 * @param authUser - Authenticated user
 * @param payload - Subscription creation payload
 * @returns Checkout session URL
 */
const createSubscription = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user already has an active subscription
    const existingSubscription = yield prisma_1.prisma.subscription.findFirst({
        where: {
            userId: authUser.userId,
            status: client_1.SubscriptionStatus.ACTIVE,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
            ],
        },
    });
    if (existingSubscription) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You already have an active subscription. Please cancel your current subscription before creating a new one.");
    }
    // Validate planType
    if (!["MONTHLY", "YEARLY"].includes(payload.planType)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid plan type. Must be MONTHLY or YEARLY.");
    }
    // Get plan configuration
    const planConfig = subscription_constant_1.SUBSCRIPTION_PLANS[payload.planType];
    if (!planConfig.priceId) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Stripe price ID not configured for ${payload.planType} plan. Please contact support.`);
    }
    // Get or create Stripe customer
    const stripeCustomerId = yield getOrCreateStripeCustomer(authUser.userId, authUser.email);
    // Get frontend URL for success/cancel redirects
    const frontendUrl = config_1.default.frontend_url || "http://localhost:3000";
    const successUrl = `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/subscription/cancel`;
    // Create Stripe Checkout Session
    let checkoutSession;
    try {
        checkoutSession = yield stripe_1.stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: "subscription",
            line_items: [
                {
                    price: planConfig.priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: authUser.userId,
                planType: payload.planType,
            },
            subscription_data: {
                metadata: {
                    userId: authUser.userId,
                    planType: payload.planType,
                },
            },
            allow_promotion_codes: true,
        });
    }
    catch (error) {
        console.error("Stripe checkout session creation error:", error);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Failed to create checkout session: ${error.message || "Unknown error"}`);
    }
    if (!checkoutSession.url) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to generate checkout session URL");
    }
    return {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
        customerId: stripeCustomerId,
    };
});
/**
 * Update subscription (mainly for cancelAtPeriodEnd flag)
 * @param authUser - Authenticated user
 * @param subscriptionId - Subscription ID
 * @param payload - Update payload
 * @returns Updated subscription
 */
const updateSubscription = (authUser, subscriptionId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Load subscription
    const subscription = yield prisma_1.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
        },
    });
    if (!subscription) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Subscription not found.");
    }
    // Verify user owns subscription OR is admin
    if (subscription.userId !== authUser.userId && authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to update this subscription.");
    }
    // Only allow updating cancelAtPeriodEnd for now
    if (payload.cancelAtPeriodEnd === undefined) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Only cancelAtPeriodEnd can be updated.");
    }
    // Update Stripe subscription if stripeSubscriptionId exists
    if (subscription.stripeSubscriptionId) {
        try {
            if (payload.cancelAtPeriodEnd) {
                // Cancel at period end
                yield stripe_1.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                    cancel_at_period_end: true,
                });
            }
            else {
                // Reactivate subscription (remove cancel_at_period_end)
                yield stripe_1.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                    cancel_at_period_end: false,
                });
            }
        }
        catch (error) {
            console.error("Stripe subscription update error:", error);
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Failed to update subscription: ${error.message || "Unknown error"}`);
        }
    }
    // Update database
    const updated = yield prisma_1.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
            cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
        },
    });
    // Notify user (SUBSCRIPTION_UPDATED)
    notification_service_1.NotificationService.notifyUser(subscription.userId, {
        type: client_1.NotificationType.SUBSCRIPTION_UPDATED,
        title: "Subscription updated",
        message: payload.cancelAtPeriodEnd
            ? "Your subscription will be cancelled at the end of the current period."
            : "Your subscription has been reactivated.",
        data: {
            subscriptionId: updated.id,
            cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
        },
    }).catch((error) => {
        console.error("Failed to send notification for subscription update:", error);
    });
    const sub = updated;
    return {
        id: sub.id,
        userId: sub.userId,
        planName: sub.planName,
        planType: sub.planType,
        status: sub.status,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        startedAt: sub.startedAt,
        expiresAt: sub.expiresAt,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        metadata: sub.metadata,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        user: sub.user,
    };
});
/**
 * Cancel subscription immediately
 * @param authUser - Authenticated user
 * @param subscriptionId - Subscription ID
 * @returns Success message
 */
const cancelSubscription = (authUser, subscriptionId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load subscription
    const subscription = yield prisma_1.prisma.subscription.findUnique({
        where: { id: subscriptionId },
    });
    if (!subscription) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Subscription not found.");
    }
    // Verify user owns subscription OR is admin
    if (subscription.userId !== authUser.userId && authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to cancel this subscription.");
    }
    // Check if already cancelled
    if (subscription.status === client_1.SubscriptionStatus.CANCELLED) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Subscription is already cancelled.");
    }
    // Cancel in Stripe if stripeSubscriptionId exists
    if (subscription.stripeSubscriptionId) {
        try {
            yield stripe_1.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        }
        catch (error) {
            console.error("Stripe subscription cancellation error:", error);
            // Continue with database update even if Stripe fails
            // (webhook will sync later)
        }
    }
    // Update database - mark as CANCELLED
    const now = new Date();
    yield prisma_1.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
            status: client_1.SubscriptionStatus.CANCELLED,
            expiresAt: subscription.expiresAt && subscription.expiresAt > now
                ? subscription.expiresAt
                : now, // Keep current period end or set to now
            cancelAtPeriodEnd: false, // Already cancelled
        },
    });
    // Notify user (SUBSCRIPTION_CANCELLED)
    notification_service_1.NotificationService.notifyUser(subscription.userId, {
        type: client_1.NotificationType.SUBSCRIPTION_CANCELLED,
        title: "Subscription cancelled",
        message: "Your subscription has been cancelled. You will continue to have access until the end of your current billing period.",
        data: {
            subscriptionId,
        },
    }).catch((error) => {
        console.error("Failed to send notification for subscription cancellation:", error);
    });
    return {
        message: "Subscription cancelled successfully.",
    };
});
/**
 * Handle Stripe webhook events
 * @param rawBody - Raw request body (Buffer)
 * @param signature - Stripe signature from headers
 * @returns Success message
 */
const handleStripeWebhook = (rawBody, signature) => __awaiter(void 0, void 0, void 0, function* () {
    const webhookSecret = (0, stripe_1.getWebhookSecret)();
    let event;
    console.log("🔔 Webhook received - Verifying signature...");
    try {
        // Verify webhook signature
        event = stripe_1.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        console.log(`✅ Webhook verified - Event Type: ${event.type}, Event ID: ${event.id}`);
    }
    catch (error) {
        console.error("❌ Webhook signature verification failed:", error.message);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Webhook signature verification failed: ${error.message}`);
    }
    // Handle different event types
    try {
        console.log(`📥 Processing webhook event: ${event.type}`);
        const startTime = Date.now();
        switch (event.type) {
            case "customer.subscription.created":
                console.log("🆕 Handling subscription.created event...");
                yield handleSubscriptionCreated(event.data.object);
                console.log("✅ Subscription created successfully");
                break;
            case "customer.subscription.updated":
                console.log("🔄 Handling subscription.updated event...");
                yield handleSubscriptionUpdated(event.data.object);
                console.log("✅ Subscription updated successfully");
                break;
            case "customer.subscription.deleted":
                console.log("🗑️ Handling subscription.deleted event...");
                yield handleSubscriptionDeleted(event.data.object);
                console.log("✅ Subscription deleted successfully");
                break;
            case "invoice.payment_succeeded":
                console.log("💳 Handling invoice.payment_succeeded event...");
                yield handlePaymentSucceeded(event.data.object);
                console.log("✅ Payment processed successfully");
                break;
            case "invoice.payment_failed":
                console.log("❌ Handling invoice.payment_failed event...");
                yield handlePaymentFailed(event.data.object);
                console.log("✅ Payment failure processed successfully");
                break;
            case "checkout.session.completed":
                console.log("✅ Handling checkout.session.completed event...");
                yield handleCheckoutCompleted(event.data.object);
                console.log("✅ Checkout completed processed successfully");
                break;
            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }
        const duration = Date.now() - startTime;
        console.log(`✅ Webhook event ${event.type} processed in ${duration}ms`);
        return { received: true };
    }
    catch (error) {
        console.error(`❌ Error handling webhook event ${event.type}:`, {
            error: error.message,
            stack: error.stack,
            eventId: event.id,
            eventType: event.type,
        });
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Failed to process webhook: ${error.message}`);
    }
});
/**
 * Handle customer.subscription.created event
 */
const handleSubscriptionCreated = (stripeSubscription) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log(`🆕 Processing subscription.created for: ${stripeSubscription.id}`);
    const userId = (_a = stripeSubscription.metadata) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        console.warn("⚠️ Subscription created without userId in metadata:", stripeSubscription.id);
        return;
    }
    console.log(`👤 User ID: ${userId}`);
    // Check if subscription already exists
    const existing = yield prisma_1.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: stripeSubscription.id },
    });
    if (existing) {
        console.log(`✅ Subscription already exists in database: ${stripeSubscription.id}`);
        return;
    }
    // Get plan type from metadata or determine from price
    const planType = ((_b = stripeSubscription.metadata) === null || _b === void 0 ? void 0 : _b.planType) || "MONTHLY";
    const planConfig = subscription_constant_1.SUBSCRIPTION_PLANS[planType] || subscription_constant_1.SUBSCRIPTION_PLANS.MONTHLY;
    // Calculate dates
    const startedAt = new Date(stripeSubscription.current_period_start * 1000);
    const expiresAt = new Date(stripeSubscription.current_period_end * 1000);
    // Create subscription in database
    console.log(`💾 Creating subscription in database...`);
    const subscription = yield prisma_1.prisma.subscription.create({
        data: {
            userId,
            planName: planConfig.name,
            planType: planType,
            status: stripeSubscription.status === "active" ? client_1.SubscriptionStatus.ACTIVE : client_1.SubscriptionStatus.PAST_DUE,
            stripeSubscriptionId: stripeSubscription.id,
            startedAt,
            expiresAt,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
            metadata: {
                stripeCustomerId: stripeSubscription.customer,
                planType,
            },
        },
    });
    console.log(`✅ Subscription created in database: ${subscription.id}`);
    // Update any payments that were created without subscriptionId
    // This handles the case when invoice.payment_succeeded arrives before customer.subscription.created
    try {
        // First, try to update payments with userId and pendingSubscriptionId
        const pendingPayments = yield prisma_1.prisma.paymentTransaction.findMany({
            where: {
                OR: [
                    { userId, subscriptionId: null },
                    { userId: null, subscriptionId: null }, // Also check null userId payments
                ],
            },
        });
        let updatedCount = 0;
        for (const payment of pendingPayments) {
            const gatewayData = payment.gatewayData;
            if ((gatewayData === null || gatewayData === void 0 ? void 0 : gatewayData.pendingSubscriptionId) === stripeSubscription.id) {
                yield prisma_1.prisma.paymentTransaction.update({
                    where: { id: payment.id },
                    data: {
                        subscriptionId: subscription.id,
                        userId: payment.userId || userId, // Update userId if it was null
                    },
                });
                updatedCount++;
                console.log(`Updated payment ${payment.id} with subscription ID:`, subscription.id);
            }
        }
        if (updatedCount > 0) {
            console.log(`Updated ${updatedCount} payment(s) with subscription ID:`, subscription.id);
        }
    }
    catch (error) {
        console.error("Error updating pending payments:", error);
    }
    // Notify user (SUBSCRIPTION_CREATED)
    notification_service_1.NotificationService.notifyUser(userId, {
        type: client_1.NotificationType.SUBSCRIPTION_CREATED,
        title: "Subscription created successfully",
        message: `Your ${planConfig.name} subscription has been activated. You now have unlimited AI access!`,
        data: {
            subscriptionId: subscription.id,
            planType: planType,
            expiresAt: expiresAt.toISOString(),
        },
    }).catch((error) => {
        console.error("Failed to send notification for subscription creation:", error);
    });
});
/**
 * Handle customer.subscription.updated event
 */
const handleSubscriptionUpdated = (stripeSubscription) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield prisma_1.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: stripeSubscription.id },
    });
    if (!subscription) {
        console.warn("Subscription not found for update:", stripeSubscription.id);
        return;
    }
    // Map Stripe status to our status
    let status = client_1.SubscriptionStatus.ACTIVE;
    if (stripeSubscription.status === "past_due") {
        status = client_1.SubscriptionStatus.PAST_DUE;
    }
    else if (stripeSubscription.status === "canceled" || stripeSubscription.status === "unpaid") {
        status = client_1.SubscriptionStatus.CANCELLED;
    }
    else if (stripeSubscription.status === "incomplete_expired") {
        status = client_1.SubscriptionStatus.EXPIRED;
    }
    // Update subscription
    yield prisma_1.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
            status,
            expiresAt: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
        },
    });
});
/**
 * Handle customer.subscription.deleted event
 */
const handleSubscriptionDeleted = (stripeSubscription) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield prisma_1.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: stripeSubscription.id },
    });
    if (!subscription) {
        console.warn("Subscription not found for deletion:", stripeSubscription.id);
        return;
    }
    // Mark as cancelled
    yield prisma_1.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
            status: client_1.SubscriptionStatus.CANCELLED,
            expiresAt: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: false,
        },
    });
});
/**
 * Handle invoice.payment_succeeded event
 */
const handlePaymentSucceeded = (invoice) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.log(`💳 Processing payment succeeded for invoice: ${invoice.id}`);
    const inv = invoice;
    const subscriptionId = typeof inv.subscription === 'string'
        ? inv.subscription
        : (_a = inv.subscription) === null || _a === void 0 ? void 0 : _a.id;
    if (!subscriptionId) {
        console.log("⚠️ Invoice is not a subscription invoice, skipping...");
        return;
    }
    console.log(`📋 Subscription ID: ${subscriptionId}, Invoice ID: ${invoice.id}`);
    // Get payment intent ID
    const paymentIntentId = typeof inv.payment_intent === 'string'
        ? inv.payment_intent
        : ((_b = inv.payment_intent) === null || _b === void 0 ? void 0 : _b.id) || null;
    console.log(`💳 Payment Intent ID: ${paymentIntentId || 'N/A'}`);
    // Check if payment already exists (avoid duplicates)
    if (paymentIntentId) {
        const existingPayment = yield prisma_1.prisma.paymentTransaction.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
        });
        if (existingPayment) {
            console.log(`✅ Payment already exists in database: ${paymentIntentId}`);
            return; // Already processed
        }
    }
    // Try to find subscription - with retry logic (webhook events might arrive out of order)
    let subscription = yield prisma_1.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
    });
    // If subscription doesn't exist yet, wait a bit and retry
    if (!subscription) {
        console.log("Subscription not found, waiting for subscription creation...", subscriptionId);
        // Retry up to 3 times with 2 second delay
        for (let i = 0; i < 3; i++) {
            yield new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            subscription = yield prisma_1.prisma.subscription.findUnique({
                where: { stripeSubscriptionId: subscriptionId },
            });
            if (subscription) {
                console.log("Subscription found after retry:", subscription.id);
                break;
            }
        }
    }
    // If still not found, try to get userId from invoice/customer metadata
    if (!subscription) {
        console.warn("Subscription not found after retries, attempting to create payment with metadata:", subscriptionId);
        let userId = null;
        try {
            // Try to get from invoice metadata
            if ((_c = invoice.metadata) === null || _c === void 0 ? void 0 : _c.userId) {
                userId = invoice.metadata.userId;
            }
            else if (invoice.customer) {
                // Try to get from customer
                const customer = yield stripe_1.stripe.customers.retrieve(invoice.customer);
                // Check if customer is deleted or has metadata
                if (!customer.deleted && 'metadata' in customer && ((_d = customer.metadata) === null || _d === void 0 ? void 0 : _d.userId)) {
                    userId = customer.metadata.userId;
                }
            }
        }
        catch (error) {
            console.error("Error retrieving customer for payment:", error);
        }
        if (!userId) {
            console.error("Cannot create payment: userId not found in invoice or customer metadata");
            // Store in gatewayData for later processing
            yield prisma_1.prisma.paymentTransaction.create({
                data: {
                    userId: null, // Will be updated later
                    subscriptionId: null,
                    amount: invoice.amount_paid / 100,
                    currency: invoice.currency.toUpperCase(),
                    stripePaymentIntentId: paymentIntentId,
                    status: "SUCCEEDED",
                    gatewayData: Object.assign(Object.assign({}, invoice), { pendingSubscriptionId: subscriptionId, needsUpdate: true }),
                },
            });
            return;
        }
        // Create payment with subscriptionId as null (will be updated when subscription is created)
        yield prisma_1.prisma.paymentTransaction.create({
            data: {
                userId,
                subscriptionId: null, // Will be updated when subscription is created
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                stripePaymentIntentId: paymentIntentId,
                status: "SUCCEEDED",
                gatewayData: Object.assign(Object.assign({}, invoice), { pendingSubscriptionId: subscriptionId }),
            },
        });
        // Try to notify user if we have userId
        notification_service_1.NotificationService.notifyUser(userId, {
            type: client_1.NotificationType.PAYMENT_SUCCEEDED,
            title: "Payment successful",
            message: `Your subscription payment of ${invoice.currency.toUpperCase()} ${(invoice.amount_paid / 100).toFixed(2)} was processed successfully.`,
            data: {
                invoiceId: invoice.id,
            },
        }).catch((error) => {
            console.error("Failed to send payment notification:", error);
        });
        return;
    }
    // Create payment transaction record
    console.log(`💾 Creating payment transaction for subscription: ${subscription.id}`);
    const payment = yield prisma_1.prisma.paymentTransaction.create({
        data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency.toUpperCase(),
            stripePaymentIntentId: paymentIntentId,
            status: "SUCCEEDED",
            gatewayData: invoice,
        },
    });
    console.log(`✅ Payment transaction created successfully: ${payment.id}, Amount: ${payment.amount} ${payment.currency}`);
    // Notify user (PAYMENT_SUCCEEDED)
    notification_service_1.NotificationService.notifyUser(subscription.userId, {
        type: client_1.NotificationType.PAYMENT_SUCCEEDED,
        title: "Payment successful",
        message: `Your subscription payment of ${invoice.currency.toUpperCase()} ${(invoice.amount_paid / 100).toFixed(2)} was processed successfully.`,
        data: {
            subscriptionId: subscription.id,
            invoiceId: invoice.id,
        },
    }).catch((error) => {
        console.error("❌ Failed to send payment notification:", error);
    });
});
/**
 * Handle invoice.payment_failed event
 */
const handlePaymentFailed = (invoice) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const inv = invoice;
    const subscriptionId = typeof inv.subscription === 'string'
        ? inv.subscription
        : (_a = inv.subscription) === null || _a === void 0 ? void 0 : _a.id;
    if (!subscriptionId) {
        return;
    }
    const subscription = yield prisma_1.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
    });
    if (!subscription) {
        console.warn("Subscription not found for failed payment:", subscriptionId);
        return;
    }
    // Update subscription status to PAST_DUE
    yield prisma_1.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
            status: client_1.SubscriptionStatus.PAST_DUE,
        },
    });
    // Create payment transaction record with FAILED status
    yield prisma_1.prisma.paymentTransaction.create({
        data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            amount: invoice.amount_due / 100, // Convert from cents
            currency: invoice.currency.toUpperCase(),
            stripePaymentIntentId: typeof inv.payment_intent === 'string'
                ? inv.payment_intent
                : ((_b = inv.payment_intent) === null || _b === void 0 ? void 0 : _b.id) || null,
            status: "FAILED",
            gatewayData: invoice,
        },
    });
    // Notify user (PAYMENT_FAILED)
    notification_service_1.NotificationService.notifyUser(subscription.userId, {
        type: client_1.NotificationType.PAYMENT_FAILED,
        title: "Payment failed",
        message: `Your subscription payment of ${invoice.currency.toUpperCase()} ${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`,
        data: {
            subscriptionId: subscription.id,
            invoiceId: invoice.id,
        },
    }).catch((error) => {
        console.error("Failed to send payment failure notification:", error);
    });
});
/**
 * Handle checkout.session.completed event
 */
const handleCheckoutCompleted = (session) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.log(`✅ Processing checkout.session.completed for session: ${session.id}`);
    // Get userId from metadata
    const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        console.warn("⚠️ Checkout session completed without userId in metadata:", session.id);
        return;
    }
    // If payment is paid and we have an invoice, create payment record
    if (session.payment_status === "paid" && session.invoice) {
        const invoiceId = typeof session.invoice === 'string'
            ? session.invoice
            : (_b = session.invoice) === null || _b === void 0 ? void 0 : _b.id;
        if (invoiceId) {
            console.log(`📄 Retrieving invoice: ${invoiceId}`);
            try {
                // Retrieve invoice from Stripe
                const invoice = yield stripe_1.stripe.invoices.retrieve(invoiceId);
                // Get subscription ID
                const subscriptionId = typeof invoice.subscription === 'string'
                    ? invoice.subscription
                    : (_c = invoice.subscription) === null || _c === void 0 ? void 0 : _c.id;
                if (subscriptionId) {
                    console.log(`🔍 Looking for subscription: ${subscriptionId}`);
                    // Find subscription in database (might not exist yet if events are out of order)
                    let subscription = yield prisma_1.prisma.subscription.findUnique({
                        where: { stripeSubscriptionId: subscriptionId },
                    });
                    // If not found, wait a bit and retry (subscription.created might be processing)
                    if (!subscription) {
                        console.log("⏳ Subscription not found, waiting for creation...");
                        for (let i = 0; i < 3; i++) {
                            yield new Promise(resolve => setTimeout(resolve, 2000));
                            subscription = yield prisma_1.prisma.subscription.findUnique({
                                where: { stripeSubscriptionId: subscriptionId },
                            });
                            if (subscription) {
                                console.log("✅ Subscription found after retry:", subscription.id);
                                break;
                            }
                        }
                    }
                    // Get payment intent ID
                    const paymentIntentId = typeof invoice.payment_intent === 'string'
                        ? invoice.payment_intent
                        : ((_d = invoice.payment_intent) === null || _d === void 0 ? void 0 : _d.id) || null;
                    // Check if payment already exists
                    if (paymentIntentId) {
                        const existingPayment = yield prisma_1.prisma.paymentTransaction.findUnique({
                            where: { stripePaymentIntentId: paymentIntentId },
                        });
                        if (existingPayment) {
                            console.log("✅ Payment already exists:", paymentIntentId);
                            return;
                        }
                    }
                    // Create payment record
                    const paymentData = {
                        userId,
                        amount: invoice.amount_paid / 100, // Convert from cents
                        currency: invoice.currency.toUpperCase(),
                        stripePaymentIntentId: paymentIntentId,
                        status: "SUCCEEDED",
                        gatewayData: {
                            invoiceId: invoice.id,
                            invoice: invoice,
                        },
                    };
                    // Add subscriptionId if found
                    if (subscription) {
                        paymentData.subscriptionId = subscription.id;
                    }
                    console.log(`💳 Creating payment record for invoice: ${invoiceId}`);
                    yield prisma_1.prisma.paymentTransaction.create({
                        data: paymentData,
                    });
                    console.log(`✅ Payment record created successfully for invoice: ${invoiceId}`);
                }
            }
            catch (error) {
                console.error("❌ Error processing invoice from checkout session:", error);
                // Don't throw - let other webhooks handle it
            }
        }
    }
    // Also verify subscription exists (will be created by customer.subscription.created if not)
    if (session.subscription) {
        const subscriptionId = session.subscription;
        try {
            const existing = yield prisma_1.prisma.subscription.findUnique({
                where: { stripeSubscriptionId: subscriptionId },
            });
            if (!existing) {
                console.log("ℹ️ Subscription will be created via customer.subscription.created webhook:", subscriptionId);
            }
            else {
                console.log("✅ Subscription already exists:", existing.id);
            }
        }
        catch (error) {
            console.error("Error checking subscription:", error);
        }
    }
});
/**
 * Manually sync subscription and payment data from Stripe
 * Useful when webhook events are missed or failed
 * @param authUser - Authenticated user (must be admin or subscription owner)
 * @param stripeSubscriptionId - Stripe subscription ID
 * @returns Sync result with counts
 */
const syncSubscriptionFromStripe = (authUser, stripeSubscriptionId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.log(`🔄 Starting manual sync for subscription: ${stripeSubscriptionId}`);
    // Validate and sanitize Stripe subscription ID
    // Stripe subscription IDs start with "sub_" and contain only alphanumeric characters and underscores
    // Decode URL encoding if present
    let sanitizedId = decodeURIComponent(stripeSubscriptionId).trim();
    // Remove any whitespace or control characters
    sanitizedId = sanitizedId.replace(/[\s\r\n\t]/g, '');
    if (!sanitizedId || !sanitizedId.startsWith('sub_')) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Stripe subscription ID format. Must start with 'sub_'. Received: ${stripeSubscriptionId}`);
    }
    // Validate format: sub_ followed by alphanumeric and underscores only
    if (!/^sub_[a-zA-Z0-9_]+$/.test(sanitizedId)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Stripe subscription ID format. Contains invalid characters. Received: ${stripeSubscriptionId}`);
    }
    console.log(`🔍 Sanitized subscription ID: ${sanitizedId} (original: ${stripeSubscriptionId})`);
    try {
        // Fetch subscription from Stripe
        console.log(`📡 Calling Stripe API to retrieve subscription: ${sanitizedId}`);
        const stripeSubscription = yield stripe_1.stripe.subscriptions.retrieve(sanitizedId);
        console.log(`✅ Fetched subscription from Stripe: ${stripeSubscription.id}`);
        const userId = (_a = stripeSubscription.metadata) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Subscription does not have userId in metadata. Cannot sync.");
        }
        // Verify user has permission (admin or subscription owner)
        if (authUser.role !== "ADMIN" && authUser.userId !== userId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to sync this subscription.");
        }
        // Check if subscription exists in database
        let subscription = yield prisma_1.prisma.subscription.findUnique({
            where: { stripeSubscriptionId: stripeSubscription.id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profileImage: true,
                    },
                },
            },
        });
        const planType = ((_b = stripeSubscription.metadata) === null || _b === void 0 ? void 0 : _b.planType) || "MONTHLY";
        const planConfig = subscription_constant_1.SUBSCRIPTION_PLANS[planType] || subscription_constant_1.SUBSCRIPTION_PLANS.MONTHLY;
        // Safely convert Stripe timestamps to Date objects
        const periodStart = stripeSubscription.current_period_start;
        const periodEnd = stripeSubscription.current_period_end;
        const created = stripeSubscription.created;
        console.log(`📅 Stripe subscription dates:`, {
            current_period_start: periodStart,
            current_period_end: periodEnd,
            created: created,
            status: stripeSubscription.status,
        });
        // Handle dates - use created date as fallback if period dates are not available
        let startedAt;
        let expiresAt = null;
        if (periodStart) {
            startedAt = new Date(periodStart * 1000);
        }
        else if (created) {
            // Fallback to created date if period_start is not available
            startedAt = new Date(created * 1000);
            console.log(`⚠️ Using created date as startedAt: ${startedAt.toISOString()}`);
        }
        else {
            // Last resort: use current date
            startedAt = new Date();
            console.log(`⚠️ Using current date as startedAt: ${startedAt.toISOString()}`);
        }
        if (periodEnd) {
            expiresAt = new Date(periodEnd * 1000);
        }
        else if (periodStart) {
            // Calculate expiration from period start if period_end is missing
            expiresAt = calculateExpirationDate(planType, startedAt);
            console.log(`⚠️ Calculated expiresAt from planType: ${expiresAt.toISOString()}`);
        }
        else {
            // Calculate from startedAt
            expiresAt = calculateExpirationDate(planType, startedAt);
            console.log(`⚠️ Calculated expiresAt from startedAt: ${expiresAt.toISOString()}`);
        }
        // Validate dates
        if (isNaN(startedAt.getTime())) {
            console.error("Invalid startedAt date conversion:", {
                periodStart,
                created,
                startedAt: startedAt.toString(),
            });
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to convert subscription start date. Invalid timestamp values.");
        }
        if (expiresAt && isNaN(expiresAt.getTime())) {
            console.error("Invalid expiresAt date conversion:", {
                periodEnd,
                expiresAt: expiresAt.toString(),
            });
            // If expiresAt is invalid, calculate it
            expiresAt = calculateExpirationDate(planType, startedAt);
            console.log(`⚠️ Recalculated expiresAt: ${expiresAt.toISOString()}`);
        }
        console.log(`📅 Subscription dates - Started: ${startedAt.toISOString()}, Expires: ${(expiresAt === null || expiresAt === void 0 ? void 0 : expiresAt.toISOString()) || 'null'}`);
        // Create or update subscription
        if (!subscription) {
            console.log("📝 Creating new subscription in database...");
            subscription = yield prisma_1.prisma.subscription.create({
                data: {
                    userId,
                    planName: planConfig.name,
                    planType: planType,
                    status: stripeSubscription.status === "active" ? client_1.SubscriptionStatus.ACTIVE : client_1.SubscriptionStatus.PAST_DUE,
                    stripeSubscriptionId: stripeSubscription.id,
                    startedAt,
                    expiresAt,
                    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
                    metadata: {
                        stripeCustomerId: stripeSubscription.customer,
                        planType,
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            profileImage: true,
                        },
                    },
                },
            });
            console.log(`✅ Subscription created: ${subscription.id}`);
        }
        else {
            console.log("🔄 Updating existing subscription...");
            subscription = yield prisma_1.prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: stripeSubscription.status === "active" ? client_1.SubscriptionStatus.ACTIVE : client_1.SubscriptionStatus.PAST_DUE,
                    expiresAt,
                    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            profileImage: true,
                        },
                    },
                },
            });
            console.log(`✅ Subscription updated: ${subscription.id}`);
        }
        // Fetch invoices from Stripe
        console.log(`📋 Fetching invoices from Stripe for subscription: ${stripeSubscription.id}`);
        // Check if subscription has latest_invoice
        const latestInvoiceId = stripeSubscription.latest_invoice;
        if (latestInvoiceId) {
            console.log(`📋 Subscription has latest_invoice: ${latestInvoiceId}`);
        }
        // Try multiple approaches to find invoices
        let invoices;
        try {
            // First, try by subscription
            invoices = yield stripe_1.stripe.invoices.list({
                subscription: stripeSubscription.id,
                limit: 100,
            });
            console.log(`📋 Found ${invoices.data.length} invoice(s) by subscription`);
            // If no invoices found, try by customer
            if (invoices.data.length === 0 && stripeSubscription.customer) {
                console.log(`📋 Trying to fetch invoices by customer: ${stripeSubscription.customer}`);
                invoices = yield stripe_1.stripe.invoices.list({
                    customer: stripeSubscription.customer,
                    limit: 100,
                });
                console.log(`📋 Found ${invoices.data.length} invoice(s) by customer`);
            }
            // If still no invoices and we have latest_invoice, fetch it directly
            if (invoices.data.length === 0 && latestInvoiceId) {
                console.log(`📋 Fetching latest_invoice directly: ${latestInvoiceId}`);
                try {
                    const latestInvoice = yield stripe_1.stripe.invoices.retrieve(latestInvoiceId);
                    invoices = { data: [latestInvoice] };
                    console.log(`📋 Retrieved latest_invoice: ${latestInvoice.id}, Status: ${latestInvoice.status}`);
                }
                catch (error) {
                    console.error(`❌ Error retrieving latest_invoice:`, error.message);
                }
            }
        }
        catch (error) {
            console.error(`❌ Error fetching invoices:`, error.message);
            invoices = { data: [] };
        }
        console.log(`📋 Total invoices found: ${invoices.data.length}`);
        // Log all invoice statuses for debugging
        if (invoices.data.length > 0) {
            console.log(`📊 Invoice statuses:`, invoices.data.map(inv => ({
                id: inv.id,
                status: inv.status,
                amount_paid: inv.amount_paid,
                payment_intent: inv.payment_intent,
            })));
        }
        let paymentsCreated = 0;
        let paymentsUpdated = 0;
        // Process each invoice
        for (const invoice of invoices.data) {
            const inv = invoice;
            // Try to get payment intent or charge
            let paymentIntentId = typeof inv.payment_intent === 'string'
                ? inv.payment_intent
                : ((_c = inv.payment_intent) === null || _c === void 0 ? void 0 : _c.id) || null;
            // Fallback to charge if payment_intent is not available (for older Stripe accounts)
            if (!paymentIntentId && inv.charge) {
                paymentIntentId = typeof inv.charge === 'string' ? inv.charge : ((_d = inv.charge) === null || _d === void 0 ? void 0 : _d.id) || null;
                console.log(`📄 Using charge instead of payment_intent for invoice: ${invoice.id}`);
            }
            console.log(`📄 Processing invoice: ${invoice.id}, Status: ${invoice.status}, Payment Intent/Charge: ${paymentIntentId || 'N/A'}, Amount: ${invoice.amount_paid || 0}`);
            // Check if invoice is paid (status can be "paid" or "void" with amount_paid > 0)
            const isPaid = invoice.status === "paid" || (invoice.amount_paid && invoice.amount_paid > 0);
            if (!isPaid) {
                console.log(`⏭️ Skipping invoice ${invoice.id} - Status: ${invoice.status}, Amount Paid: ${invoice.amount_paid || 0}`);
                continue; // Skip unpaid invoices
            }
            if (!paymentIntentId) {
                console.log(`⚠️ Invoice ${invoice.id} is paid but has no payment_intent or charge. Trying to find payment intent from charge...`);
                // Try to retrieve charge and get payment_intent from it
                if (inv.charge) {
                    try {
                        const chargeId = typeof inv.charge === 'string' ? inv.charge : inv.charge;
                        const charge = yield stripe_1.stripe.charges.retrieve(chargeId);
                        if (charge.payment_intent) {
                            paymentIntentId = typeof charge.payment_intent === 'string'
                                ? charge.payment_intent
                                : charge.payment_intent;
                            console.log(`✅ Found payment_intent from charge: ${paymentIntentId}`);
                        }
                    }
                    catch (error) {
                        console.log(`⚠️ Could not retrieve charge: ${error}`);
                    }
                }
                // If still no payment_intent, skip this invoice (can't create payment without identifier)
                if (!paymentIntentId) {
                    console.log(`⏭️ Skipping invoice ${invoice.id} - No payment_intent or charge found`);
                    continue;
                }
            }
            // Check if payment already exists
            const existingPayment = yield prisma_1.prisma.paymentTransaction.findUnique({
                where: { stripePaymentIntentId: paymentIntentId },
            });
            if (existingPayment) {
                // Update if needed
                if (existingPayment.subscriptionId !== subscription.id || existingPayment.userId !== userId) {
                    yield prisma_1.prisma.paymentTransaction.update({
                        where: { id: existingPayment.id },
                        data: {
                            subscriptionId: subscription.id,
                            userId: userId,
                        },
                    });
                    paymentsUpdated++;
                    console.log(`🔄 Updated payment: ${existingPayment.id}`);
                }
                continue;
            }
            // Create new payment
            try {
                yield prisma_1.prisma.paymentTransaction.create({
                    data: {
                        userId,
                        subscriptionId: subscription.id,
                        amount: invoice.amount_paid / 100,
                        currency: invoice.currency.toUpperCase(),
                        stripePaymentIntentId: paymentIntentId,
                        status: "SUCCEEDED",
                        gatewayData: invoice,
                    },
                });
                paymentsCreated++;
                console.log(`✅ Created payment for invoice: ${invoice.id}, Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`);
            }
            catch (error) {
                console.error(`❌ Failed to create payment for invoice ${invoice.id}:`, error.message);
                // Continue with next invoice
            }
        }
        const sub = subscription;
        const subscriptionResponse = {
            id: sub.id,
            userId: sub.userId,
            planName: sub.planName,
            planType: sub.planType,
            status: sub.status,
            stripeSubscriptionId: sub.stripeSubscriptionId,
            startedAt: sub.startedAt,
            expiresAt: sub.expiresAt,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            metadata: sub.metadata,
            createdAt: sub.createdAt,
            updatedAt: sub.updatedAt,
            user: sub.user,
        };
        console.log(`✅ Sync completed - Created: ${paymentsCreated}, Updated: ${paymentsUpdated}`);
        return {
            subscription: subscriptionResponse,
            paymentsCreated,
            paymentsUpdated,
            message: `Sync completed successfully. Created ${paymentsCreated} payment(s), updated ${paymentsUpdated} payment(s).`,
        };
    }
    catch (error) {
        console.error(`❌ Sync failed for subscription ${stripeSubscriptionId}:`, {
            error: error.message,
            type: error.type,
            code: error.code,
            stack: error.stack,
        });
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        // Handle Stripe-specific errors
        if (error.type === 'StripeInvalidRequestError' || error.type === 'StripeAPIError') {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Stripe API error: ${error.message}`);
        }
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Failed to sync subscription: ${error.message}`);
    }
});
exports.SubscriptionService = {
    getSubscriptionStatus,
    getSubscription,
    getSubscriptions,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    handleStripeWebhook,
    syncSubscriptionFromStripe,
    getOrCreateStripeCustomer,
    calculateExpirationDate,
    calculateDaysRemaining,
};
