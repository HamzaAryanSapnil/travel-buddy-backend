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
exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
/**
 * Get single payment by ID
 * @param authUser - Authenticated user
 * @param paymentId - Payment ID
 * @returns Payment details
 */
const getPayment = (authUser, paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load payment with relations
    const payment = yield prisma_1.prisma.paymentTransaction.findUnique({
        where: { id: paymentId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            subscription: {
                select: {
                    id: true,
                    planName: true,
                    planType: true,
                    status: true,
                },
            },
        },
    });
    if (!payment) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Payment not found.");
    }
    // Verify user owns payment OR is admin
    if (payment.userId !== authUser.userId && authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to view this payment.");
    }
    const pay = payment;
    return {
        id: pay.id,
        userId: pay.userId,
        subscriptionId: pay.subscriptionId,
        amount: pay.amount,
        currency: pay.currency,
        stripePaymentIntentId: pay.stripePaymentIntentId,
        status: pay.status,
        gatewayData: pay.gatewayData,
        createdAt: pay.createdAt,
        updatedAt: pay.updatedAt,
        user: pay.user,
        subscription: pay.subscription,
    };
});
/**
 * Get user's own payment history
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated payment history
 */
const getMyPayments = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Pagination
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        sortBy: query.sortBy || "createdAt",
        sortOrder: query.sortOrder || "desc",
    });
    // Build where clause
    const andConditions = [
        {
            userId: authUser.userId, // Only user's own payments
        },
    ];
    // Filter by status
    if (query.status) {
        andConditions.push({
            status: query.status,
        });
    }
    // Filter by subscriptionId
    if (query.subscriptionId) {
        andConditions.push({
            subscriptionId: query.subscriptionId,
        });
    }
    // Filter by currency
    if (query.currency) {
        andConditions.push({
            currency: query.currency.toUpperCase(),
        });
    }
    // Filter by date range
    if (query.startDate || query.endDate) {
        const dateFilter = {};
        if (query.startDate) {
            dateFilter.gte = new Date(query.startDate);
        }
        if (query.endDate) {
            dateFilter.lte = new Date(query.endDate);
        }
        andConditions.push({
            createdAt: dateFilter,
        });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    // Get payments and total count
    const [payments, total] = yield Promise.all([
        prisma_1.prisma.paymentTransaction.findMany({
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
                subscription: {
                    select: {
                        id: true,
                        planName: true,
                        planType: true,
                        status: true,
                    },
                },
            },
        }),
        prisma_1.prisma.paymentTransaction.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        data: payments.map((pay) => ({
            id: pay.id,
            userId: pay.userId,
            subscriptionId: pay.subscriptionId,
            amount: pay.amount,
            currency: pay.currency,
            stripePaymentIntentId: pay.stripePaymentIntentId,
            status: pay.status,
            gatewayData: pay.gatewayData,
            createdAt: pay.createdAt,
            updatedAt: pay.updatedAt,
            user: pay.user,
            subscription: pay.subscription,
        })),
    };
});
/**
 * Get all payments (admin only) with pagination and filters
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated payments
 */
const getPayments = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Admin only
    if (authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Only admins can view all payments.");
    }
    // Pagination
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        sortBy: query.sortBy || "createdAt",
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
    // Filter by userId
    if (query.userId) {
        andConditions.push({
            userId: query.userId,
        });
    }
    // Filter by subscriptionId
    if (query.subscriptionId) {
        andConditions.push({
            subscriptionId: query.subscriptionId,
        });
    }
    // Filter by currency
    if (query.currency) {
        andConditions.push({
            currency: query.currency.toUpperCase(),
        });
    }
    // Filter by date range
    if (query.startDate || query.endDate) {
        const dateFilter = {};
        if (query.startDate) {
            dateFilter.gte = new Date(query.startDate);
        }
        if (query.endDate) {
            dateFilter.lte = new Date(query.endDate);
        }
        andConditions.push({
            createdAt: dateFilter,
        });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    // Get payments and total count
    const [payments, total] = yield Promise.all([
        prisma_1.prisma.paymentTransaction.findMany({
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
                subscription: {
                    select: {
                        id: true,
                        planName: true,
                        planType: true,
                        status: true,
                    },
                },
            },
        }),
        prisma_1.prisma.paymentTransaction.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        data: payments.map((pay) => ({
            id: pay.id,
            userId: pay.userId,
            subscriptionId: pay.subscriptionId,
            amount: pay.amount,
            currency: pay.currency,
            stripePaymentIntentId: pay.stripePaymentIntentId,
            status: pay.status,
            gatewayData: pay.gatewayData,
            createdAt: pay.createdAt,
            updatedAt: pay.updatedAt,
            user: pay.user,
            subscription: pay.subscription,
        })),
    };
});
/**
 * Get payment statistics (admin only)
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Payment statistics
 */
const getPaymentStatistics = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Admin only
    if (authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Only admins can view payment statistics.");
    }
    // Build where clause
    const andConditions = [];
    // Filter by subscriptionId
    if (query.subscriptionId) {
        andConditions.push({
            subscriptionId: query.subscriptionId,
        });
    }
    // Filter by currency
    if (query.currency) {
        andConditions.push({
            currency: query.currency.toUpperCase(),
        });
    }
    // Filter by date range
    if (query.startDate || query.endDate) {
        const dateFilter = {};
        if (query.startDate) {
            dateFilter.gte = new Date(query.startDate);
        }
        if (query.endDate) {
            dateFilter.lte = new Date(query.endDate);
        }
        andConditions.push({
            createdAt: dateFilter,
        });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    // Get all payments for statistics
    const payments = yield prisma_1.prisma.paymentTransaction.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            subscription: {
                select: {
                    id: true,
                    planName: true,
                    planType: true,
                    status: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 10, // Recent payments
    });
    // Calculate statistics
    const successfulPayments = payments.filter((p) => p.status === "SUCCEEDED");
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;
    // Group by status
    const statusMap = new Map();
    payments.forEach((payment) => {
        const existing = statusMap.get(payment.status) || { count: 0, totalAmount: 0 };
        statusMap.set(payment.status, {
            count: existing.count + 1,
            totalAmount: existing.totalAmount + payment.amount,
        });
    });
    const byStatus = Array.from(statusMap.entries()).map(([status, data]) => ({
        status,
        count: data.count,
        totalAmount: data.totalAmount,
    }));
    // Group by currency
    const currencyMap = new Map();
    payments.forEach((payment) => {
        const existing = currencyMap.get(payment.currency) || { count: 0, totalAmount: 0 };
        currencyMap.set(payment.currency, {
            count: existing.count + 1,
            totalAmount: existing.totalAmount + payment.amount,
        });
    });
    const byCurrency = Array.from(currencyMap.entries()).map(([currency, data]) => ({
        currency,
        count: data.count,
        totalAmount: data.totalAmount,
    }));
    // Date range info
    const byDateRange = payments.length > 0
        ? {
            startDate: query.startDate ? new Date(query.startDate) : payments[payments.length - 1].createdAt,
            endDate: query.endDate ? new Date(query.endDate) : payments[0].createdAt,
            count: totalTransactions,
            totalAmount: totalRevenue,
        }
        : undefined;
    return {
        totalRevenue,
        totalTransactions,
        byStatus,
        byCurrency,
        byDateRange,
        recentPayments: payments.map((pay) => ({
            id: pay.id,
            userId: pay.userId,
            subscriptionId: pay.subscriptionId,
            amount: pay.amount,
            currency: pay.currency,
            stripePaymentIntentId: pay.stripePaymentIntentId,
            status: pay.status,
            gatewayData: pay.gatewayData,
            createdAt: pay.createdAt,
            updatedAt: pay.updatedAt,
            user: pay.user,
            subscription: pay.subscription,
        })),
    };
});
/**
 * Get payment summary for user or subscription
 * @param authUser - Authenticated user
 * @param subscriptionId - Optional subscription ID
 * @returns Payment summary
 */
const getPaymentSummary = (authUser, subscriptionId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Build where clause
    const andConditions = [
        {
            userId: authUser.userId, // Only user's own payments
        },
    ];
    // Filter by subscriptionId if provided
    if (subscriptionId) {
        // Verify subscription belongs to user
        const subscription = yield prisma_1.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            select: { userId: true },
        });
        if (!subscription) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Subscription not found.");
        }
        if (subscription.userId !== authUser.userId && authUser.role !== client_1.Role.ADMIN) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to view payments for this subscription.");
        }
        andConditions.push({
            subscriptionId,
        });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    // Get all payments for summary
    const payments = yield prisma_1.prisma.paymentTransaction.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            subscription: {
                select: {
                    id: true,
                    planName: true,
                    planType: true,
                    status: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    if (payments.length === 0) {
        return {
            userId: authUser.userId,
            subscriptionId: subscriptionId || null,
            totalPayments: 0,
            totalAmount: 0,
            currency: "USD",
            successfulPayments: 0,
            failedPayments: 0,
            refundedPayments: 0,
            pendingPayments: 0,
            lastPaymentDate: null,
            payments: [],
        };
    }
    // Calculate summary statistics
    const successfulPayments = payments.filter((p) => p.status === "SUCCEEDED");
    const failedPayments = payments.filter((p) => p.status === "FAILED");
    const refundedPayments = payments.filter((p) => p.status === "REFUNDED");
    const pendingPayments = payments.filter((p) => p.status === "PENDING");
    const totalAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const currency = ((_a = payments[0]) === null || _a === void 0 ? void 0 : _a.currency) || "USD";
    const lastPaymentDate = ((_b = payments[0]) === null || _b === void 0 ? void 0 : _b.createdAt) || null;
    return {
        userId: authUser.userId,
        subscriptionId: subscriptionId || null,
        totalPayments: payments.length,
        totalAmount,
        currency,
        successfulPayments: successfulPayments.length,
        failedPayments: failedPayments.length,
        refundedPayments: refundedPayments.length,
        pendingPayments: pendingPayments.length,
        lastPaymentDate,
        payments: payments.map((pay) => ({
            id: pay.id,
            userId: pay.userId,
            subscriptionId: pay.subscriptionId,
            amount: pay.amount,
            currency: pay.currency,
            stripePaymentIntentId: pay.stripePaymentIntentId,
            status: pay.status,
            gatewayData: pay.gatewayData,
            createdAt: pay.createdAt,
            updatedAt: pay.updatedAt,
            user: pay.user,
            subscription: pay.subscription,
        })),
    };
});
/**
 * Helper: Prepare refund data (for future Stripe refund integration)
 * @param paymentId - Payment ID
 * @returns Payment details for refund
 */
const prepareRefundData = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield prisma_1.prisma.paymentTransaction.findUnique({
        where: { id: paymentId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            subscription: {
                select: {
                    id: true,
                    planName: true,
                    planType: true,
                    status: true,
                },
            },
        },
    });
    if (!payment) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Payment not found.");
    }
    let canRefund = false;
    let reason = "";
    if (payment.status !== "SUCCEEDED") {
        canRefund = false;
        reason = `Payment status is ${payment.status}. Only SUCCEEDED payments can be refunded.`;
    }
    else if (!payment.stripePaymentIntentId) {
        canRefund = false;
        reason = "Payment does not have a Stripe payment intent ID. Cannot process refund.";
    }
    else {
        canRefund = true;
        reason = "Payment is eligible for refund.";
    }
    const pay = payment;
    return {
        payment: {
            id: pay.id,
            userId: pay.userId,
            subscriptionId: pay.subscriptionId,
            amount: pay.amount,
            currency: pay.currency,
            stripePaymentIntentId: pay.stripePaymentIntentId,
            status: pay.status,
            gatewayData: pay.gatewayData,
            createdAt: pay.createdAt,
            updatedAt: pay.updatedAt,
            user: pay.user,
            subscription: pay.subscription,
        },
        canRefund,
        reason,
    };
});
exports.PaymentService = {
    getPayment,
    getMyPayments,
    getPayments,
    getPaymentStatistics,
    getPaymentSummary,
    prepareRefundData,
};
