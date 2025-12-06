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
 * Create a new subscription
 * @param authUser - Authenticated user
 * @param payload - Subscription creation payload
 * @returns Created subscription
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
    // Create Stripe subscription
    let stripeSubscription;
    try {
        stripeSubscription = yield stripe_1.stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [
                {
                    price: planConfig.priceId,
                },
            ],
            metadata: {
                userId: authUser.userId,
                planType: payload.planType,
            },
        });
    }
    catch (error) {
        console.error("Stripe subscription creation error:", error);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Failed to create subscription: ${error.message || "Unknown error"}`);
    }
    // Calculate expiration date
    const startedAt = new Date();
    const expiresAt = calculateExpirationDate(payload.planType, startedAt);
    // Create subscription in database (transaction)
    const subscription = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Store customer ID in metadata for future reference
        const metadata = {
            stripeCustomerId,
            planType: payload.planType,
        };
        const newSubscription = yield tx.subscription.create({
            data: {
                userId: authUser.userId,
                planName: planConfig.name,
                planType: payload.planType,
                status: client_1.SubscriptionStatus.ACTIVE,
                stripeSubscriptionId: stripeSubscription.id,
                startedAt,
                expiresAt,
                cancelAtPeriodEnd: false,
                metadata: metadata,
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
        return newSubscription;
    }));
    // Notify user (SUBSCRIPTION_CREATED)
    notification_service_1.NotificationService.notifyUser(authUser.userId, {
        type: client_1.NotificationType.SUBSCRIPTION_CREATED,
        title: "Subscription created successfully",
        message: `Your ${planConfig.name} subscription has been activated. You now have unlimited AI access!`,
        data: {
            subscriptionId: subscription.id,
            planType: payload.planType,
            expiresAt: expiresAt.toISOString(),
        },
    }).catch((error) => {
        console.error("Failed to send notification for subscription creation:", error);
    });
    const sub = subscription;
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
    try {
        // Verify webhook signature
        event = stripe_1.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    }
    catch (error) {
        console.error("Webhook signature verification failed:", error.message);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Webhook signature verification failed: ${error.message}`);
    }
    // Handle different event types
    try {
        switch (event.type) {
            case "customer.subscription.created":
                yield handleSubscriptionCreated(event.data.object);
                break;
            case "customer.subscription.updated":
                yield handleSubscriptionUpdated(event.data.object);
                break;
            case "customer.subscription.deleted":
                yield handleSubscriptionDeleted(event.data.object);
                break;
            case "invoice.payment_succeeded":
                yield handlePaymentSucceeded(event.data.object);
                break;
            case "invoice.payment_failed":
                yield handlePaymentFailed(event.data.object);
                break;
            case "checkout.session.completed":
                yield handleCheckoutCompleted(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }
    catch (error) {
        console.error(`Error handling webhook event ${event.type}:`, error);
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Failed to process webhook: ${error.message}`);
    }
});
/**
 * Handle customer.subscription.created event
 */
const handleSubscriptionCreated = (stripeSubscription) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = stripeSubscription.metadata) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        console.warn("Subscription created without userId in metadata:", stripeSubscription.id);
        return;
    }
    // Check if subscription already exists
    const existing = yield prisma_1.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: stripeSubscription.id },
    });
    if (existing) {
        console.log("Subscription already exists:", stripeSubscription.id);
        return;
    }
    // Get plan type from metadata or determine from price
    const planType = ((_b = stripeSubscription.metadata) === null || _b === void 0 ? void 0 : _b.planType) || "MONTHLY";
    const planConfig = subscription_constant_1.SUBSCRIPTION_PLANS[planType] || subscription_constant_1.SUBSCRIPTION_PLANS.MONTHLY;
    // Calculate dates
    const startedAt = new Date(stripeSubscription.current_period_start * 1000);
    const expiresAt = new Date(stripeSubscription.current_period_end * 1000);
    // Create subscription in database
    yield prisma_1.prisma.subscription.create({
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
    var _a, _b;
    const inv = invoice;
    const subscriptionId = typeof inv.subscription === 'string'
        ? inv.subscription
        : (_a = inv.subscription) === null || _a === void 0 ? void 0 : _a.id;
    if (!subscriptionId) {
        // Not a subscription invoice
        return;
    }
    const subscription = yield prisma_1.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
    });
    if (!subscription) {
        console.warn("Subscription not found for payment:", subscriptionId);
        return;
    }
    // Create payment transaction record
    yield prisma_1.prisma.paymentTransaction.create({
        data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency.toUpperCase(),
            stripePaymentIntentId: typeof inv.payment_intent === 'string'
                ? inv.payment_intent
                : ((_b = inv.payment_intent) === null || _b === void 0 ? void 0 : _b.id) || null,
            status: "SUCCEEDED",
            gatewayData: invoice,
        },
    });
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
        console.error("Failed to send payment notification:", error);
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
    // This event is typically handled by subscription.created/updated
    // But we can use it to verify subscription was created
    if (session.subscription) {
        const subscription = yield prisma_1.prisma.subscription.findUnique({
            where: { stripeSubscriptionId: session.subscription },
        });
        if (subscription) {
            console.log("Checkout completed for subscription:", subscription.id);
        }
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
    getOrCreateStripeCustomer,
    calculateExpirationDate,
    calculateDaysRemaining,
};
