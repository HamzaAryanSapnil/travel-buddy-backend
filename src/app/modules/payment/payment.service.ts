import { Prisma, Role } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import {
  paginationHelper,
  IPaginationOptions,
} from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import {
  paymentFilterableFields,
} from "./payment.constant";
import {
  TAuthUser,
  TPaymentQuery,
  TPaymentResponse,
  TPaymentListResponse,
  TPaymentStatisticsResponse,
  TPaymentSummaryResponse,
} from "./payment.interface";

/**
 * Get single payment by ID
 * @param authUser - Authenticated user
 * @param paymentId - Payment ID
 * @returns Payment details
 */
const getPayment = async (
  authUser: TAuthUser,
  paymentId: string
): Promise<TPaymentResponse> => {
  // Load payment with relations
  const payment = await prisma.paymentTransaction.findUnique({
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
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Payment not found."
    );
  }

  // Verify user owns payment OR is admin
  if (payment.userId !== authUser.userId && authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this payment."
    );
  }

  const pay = payment as any;
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
};

/**
 * Get user's own payment history
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated payment history
 */
const getMyPayments = async (
  authUser: TAuthUser,
  query: TPaymentQuery
): Promise<TPaymentListResponse> => {
  // Pagination
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy || "createdAt",
      sortOrder: query.sortOrder || "desc",
    } as IPaginationOptions);

  // Build where clause
  const andConditions: Prisma.PaymentTransactionWhereInput[] = [
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
    const dateFilter: Prisma.DateTimeFilter = {};
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

  const where: Prisma.PaymentTransactionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Get payments and total count
  const [payments, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
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
    prisma.paymentTransaction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: payments.map((pay: any) => ({
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
};

/**
 * Get all payments (admin only) with pagination and filters
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated payments
 */
const getPayments = async (
  authUser: TAuthUser,
  query: TPaymentQuery
): Promise<TPaymentListResponse> => {
  // Admin only
  if (authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only admins can view all payments."
    );
  }

  // Pagination
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy || "createdAt",
      sortOrder: query.sortOrder || "desc",
    } as IPaginationOptions);

  // Build where clause
  const andConditions: Prisma.PaymentTransactionWhereInput[] = [];

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
    const dateFilter: Prisma.DateTimeFilter = {};
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

  const where: Prisma.PaymentTransactionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Get payments and total count
  const [payments, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
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
    prisma.paymentTransaction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: payments.map((pay: any) => ({
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
};

/**
 * Get payment statistics (admin only)
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Payment statistics
 */
const getPaymentStatistics = async (
  authUser: TAuthUser,
  query: TPaymentQuery
): Promise<TPaymentStatisticsResponse> => {
  // Admin only
  if (authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only admins can view payment statistics."
    );
  }

  // Build where clause
  const andConditions: Prisma.PaymentTransactionWhereInput[] = [];

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
    const dateFilter: Prisma.DateTimeFilter = {};
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

  const where: Prisma.PaymentTransactionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Get all payments for statistics
  const payments = await prisma.paymentTransaction.findMany({
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
  const statusMap = new Map<string, { count: number; totalAmount: number }>();
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
  const currencyMap = new Map<string, { count: number; totalAmount: number }>();
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
    recentPayments: payments.map((pay: any) => ({
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
};

/**
 * Get payment summary for user or subscription
 * @param authUser - Authenticated user
 * @param subscriptionId - Optional subscription ID
 * @returns Payment summary
 */
const getPaymentSummary = async (
  authUser: TAuthUser,
  subscriptionId?: string
): Promise<TPaymentSummaryResponse> => {
  // Build where clause
  const andConditions: Prisma.PaymentTransactionWhereInput[] = [
    {
      userId: authUser.userId, // Only user's own payments
    },
  ];

  // Filter by subscriptionId if provided
  if (subscriptionId) {
    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: { userId: true },
    });

    if (!subscription) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Subscription not found."
      );
    }

    if (subscription.userId !== authUser.userId && authUser.role !== Role.ADMIN) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You don't have permission to view payments for this subscription."
      );
    }

    andConditions.push({
      subscriptionId,
    });
  }

  const where: Prisma.PaymentTransactionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Get all payments for summary
  const payments = await prisma.paymentTransaction.findMany({
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
  const currency = payments[0]?.currency || "USD";
  const lastPaymentDate = payments[0]?.createdAt || null;

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
    payments: payments.map((pay: any) => ({
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
};

/**
 * Helper: Prepare refund data (for future Stripe refund integration)
 * @param paymentId - Payment ID
 * @returns Payment details for refund
 */
const prepareRefundData = async (
  paymentId: string
): Promise<{
  payment: TPaymentResponse;
  canRefund: boolean;
  reason: string;
}> => {
  const payment = await prisma.paymentTransaction.findUnique({
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
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Payment not found."
    );
  }

  let canRefund = false;
  let reason = "";

  if (payment.status !== "SUCCEEDED") {
    canRefund = false;
    reason = `Payment status is ${payment.status}. Only SUCCEEDED payments can be refunded.`;
  } else if (!payment.stripePaymentIntentId) {
    canRefund = false;
    reason = "Payment does not have a Stripe payment intent ID. Cannot process refund.";
  } else {
    canRefund = true;
    reason = "Payment is eligible for refund.";
  }

  const pay = payment as any;
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
};

export const PaymentService = {
  getPayment,
  getMyPayments,
  getPayments,
  getPaymentStatistics,
  getPaymentSummary,
  prepareRefundData,
};

