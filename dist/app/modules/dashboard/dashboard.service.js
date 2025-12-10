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
exports.DashboardService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = require("../../shared/prisma");
/**
 * Get user dashboard overview
 */
const getUserOverview = (authUser) => __awaiter(void 0, void 0, void 0, function* () {
    // Ensure user is not ADMIN (should use admin endpoint)
    if (authUser.role === client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Admins should use /dashboard/admin/overview endpoint.");
    }
    const userId = authUser.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Get user's plan IDs where user is a member
    const userPlans = yield prisma_1.prisma.travelPlan.findMany({
        where: {
            tripMembers: {
                some: {
                    userId,
                    status: client_1.TripStatus.JOINED,
                },
            },
        },
        select: {
            id: true,
            startDate: true,
            createdAt: true,
        },
    });
    const planIds = userPlans.map((p) => p.id);
    // Calculate stats
    const totalPlans = userPlans.length;
    const upcomingTrips = userPlans.filter((p) => new Date(p.startDate) >= today).length;
    // Get total expenses across all user's plans
    const expensesResult = yield prisma_1.prisma.expense.aggregate({
        where: {
            planId: {
                in: planIds,
            },
        },
        _sum: {
            amount: true,
        },
    });
    const totalExpenses = expensesResult._sum.amount || 0;
    // Check active subscription
    const activeSubscription = yield prisma_1.prisma.subscription.findFirst({
        where: {
            userId,
            status: client_1.SubscriptionStatus.ACTIVE,
        },
    });
    // Expenses by category (Pie chart)
    const expensesByCategoryRaw = yield prisma_1.prisma.expense.groupBy({
        by: ["category"],
        where: {
            planId: {
                in: planIds,
            },
        },
        _sum: {
            amount: true,
        },
    });
    const expensesByCategory = expensesByCategoryRaw.map((item) => {
        const percentage = totalExpenses > 0
            ? Math.round((item._sum.amount / totalExpenses) * 100 * 100) / 100
            : 0;
        return {
            category: item.category,
            amount: Math.round(item._sum.amount * 100) / 100,
            percentage,
        };
    });
    // Plans timeline (Line chart) - Last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const plansInRange = userPlans.filter((p) => new Date(p.createdAt) >= sixMonthsAgo);
    // Group by month
    const monthMap = new Map();
    plansInRange.forEach((plan) => {
        const date = new Date(plan.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });
    // Fill missing months with 0
    const plansTimeline = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        plansTimeline.push({
            month: monthKey,
            count: monthMap.get(monthKey) || 0,
        });
    }
    // Recent Activity - Get from notifications (last 10)
    const recentNotifications = yield prisma_1.prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
        select: {
            id: true,
            type: true,
            title: true,
            message: true,
            isRead: true,
            createdAt: true,
            data: true,
        },
    });
    const recentActivity = recentNotifications.map((notif) => {
        const data = notif.data;
        let link;
        if (data === null || data === void 0 ? void 0 : data.planId) {
            link = `/dashboard/travel-plans/${data.planId}`;
        }
        else if (data === null || data === void 0 ? void 0 : data.meetupId) {
            link = `/dashboard/meetups/${data.meetupId}`;
        }
        return {
            type: notif.type,
            message: notif.message || notif.title,
            timestamp: notif.createdAt,
            link,
        };
    });
    // Upcoming Meetups (next 3-5)
    const upcomingMeetupsRaw = yield prisma_1.prisma.meetup.findMany({
        where: {
            plan: {
                tripMembers: {
                    some: {
                        userId,
                        status: client_1.TripStatus.JOINED,
                    },
                },
            },
            scheduledAt: {
                gte: today,
            },
            status: {
                not: "CANCELLED",
            },
        },
        include: {
            plan: {
                select: {
                    title: true,
                },
            },
            invitations: {
                where: {
                    toUserId: userId,
                },
                select: {
                    status: true,
                },
                take: 1,
            },
        },
        orderBy: {
            scheduledAt: "asc",
        },
        take: 5,
    });
    const upcomingMeetups = upcomingMeetupsRaw.map((meetup) => {
        const invitation = meetup.invitations[0];
        return {
            id: meetup.id,
            planTitle: meetup.plan.title,
            location: meetup.location || "TBD",
            scheduledAt: meetup.scheduledAt,
            rsvpStatus: (invitation === null || invitation === void 0 ? void 0 : invitation.status) || "PENDING",
        };
    });
    // Recent Notifications (last 5 unread)
    const recentNotificationsList = yield prisma_1.prisma.notification.findMany({
        where: {
            userId,
            isRead: false,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
        select: {
            id: true,
            type: true,
            title: true,
            message: true,
            isRead: true,
            createdAt: true,
            data: true,
        },
    });
    const notifications = recentNotificationsList.map((notif) => {
        const data = notif.data;
        let link;
        if (data === null || data === void 0 ? void 0 : data.planId) {
            link = `/dashboard/travel-plans/${data.planId}`;
        }
        else if (data === null || data === void 0 ? void 0 : data.meetupId) {
            link = `/dashboard/meetups/${data.meetupId}`;
        }
        return {
            id: notif.id,
            type: notif.type,
            message: notif.message || notif.title || "",
            isRead: notif.isRead,
            timestamp: notif.createdAt,
            link,
        };
    });
    return {
        stats: {
            totalPlans,
            upcomingTrips,
            totalExpenses: Math.round(totalExpenses * 100) / 100,
            activeSubscription: !!activeSubscription,
        },
        charts: {
            expensesByCategory,
            plansTimeline,
        },
        recentActivity,
        upcomingMeetups,
        recentNotifications: notifications,
    };
});
/**
 * Get admin dashboard overview
 */
const getAdminOverview = (authUser) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify user is ADMIN
    if (authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Only admins can access this endpoint.");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    // Calculate stats
    const totalUsers = yield prisma_1.prisma.user.count();
    const activeUsers = yield prisma_1.prisma.user.count({
        where: {
            OR: [
                {
                    lastLoginAt: {
                        gte: thirtyDaysAgo,
                    },
                },
                {
                    AND: [
                        {
                            lastLoginAt: null,
                        },
                        {
                            createdAt: {
                                gte: thirtyDaysAgo,
                            },
                        },
                    ],
                },
            ],
        },
    });
    const totalPlans = yield prisma_1.prisma.travelPlan.count();
    const publicPlans = yield prisma_1.prisma.travelPlan.count({
        where: {
            visibility: "PUBLIC",
        },
    });
    const revenueResult = yield prisma_1.prisma.paymentTransaction.aggregate({
        where: {
            status: "SUCCEEDED",
        },
        _sum: {
            amount: true,
        },
    });
    const totalRevenue = revenueResult._sum.amount || 0;
    const activeSubscriptions = yield prisma_1.prisma.subscription.count({
        where: {
            status: client_1.SubscriptionStatus.ACTIVE,
        },
    });
    const totalMeetups = yield prisma_1.prisma.meetup.count();
    const expensesResult = yield prisma_1.prisma.expense.aggregate({
        _sum: {
            amount: true,
        },
    });
    const totalExpenses = expensesResult._sum.amount || 0;
    const pendingBookingRequests = yield prisma_1.prisma.tripBooking.count({
        where: {
            status: "PENDING",
        },
    });
    // Charts
    // 1. Revenue Over Time (Area chart) - Last 6 months
    const paymentsInRange = yield prisma_1.prisma.paymentTransaction.findMany({
        where: {
            status: "SUCCEEDED",
            createdAt: {
                gte: sixMonthsAgo,
            },
        },
        select: {
            amount: true,
            createdAt: true,
        },
    });
    const revenueMonthMap = new Map();
    paymentsInRange.forEach((payment) => {
        const date = new Date(payment.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        revenueMonthMap.set(monthKey, (revenueMonthMap.get(monthKey) || 0) + payment.amount);
    });
    const revenueOverTime = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        revenueOverTime.push({
            month: monthKey,
            revenue: Math.round((revenueMonthMap.get(monthKey) || 0) * 100) / 100,
        });
    }
    // 2. Plans by Travel Type (Bar chart)
    const plansByTypeRaw = yield prisma_1.prisma.travelPlan.groupBy({
        by: ["travelType"],
        _count: {
            id: true,
        },
    });
    const plansByTravelType = plansByTypeRaw.map((item) => ({
        type: item.travelType,
        count: item._count.id,
    }));
    // 3. User Growth (Line chart) - Last 6 months
    const usersInRange = yield prisma_1.prisma.user.findMany({
        where: {
            createdAt: {
                gte: sixMonthsAgo,
            },
        },
        select: {
            createdAt: true,
        },
    });
    const userMonthMap = new Map();
    usersInRange.forEach((user) => {
        const date = new Date(user.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        userMonthMap.set(monthKey, (userMonthMap.get(monthKey) || 0) + 1);
    });
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        userGrowth.push({
            month: monthKey,
            newUsers: userMonthMap.get(monthKey) || 0,
        });
    }
    // 4. Subscription Status (Pie chart)
    const subscriptionsByStatusRaw = yield prisma_1.prisma.subscription.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
    });
    const totalSubscriptions = subscriptionsByStatusRaw.reduce((sum, item) => sum + item._count.id, 0);
    const subscriptionStatus = subscriptionsByStatusRaw.map((item) => {
        const percentage = totalSubscriptions > 0
            ? Math.round((item._count.id / totalSubscriptions) * 100 * 100) / 100
            : 0;
        return {
            status: item.status,
            count: item._count.id,
            percentage,
        };
    });
    // Recent Activity - System-wide events
    const recentUsers = yield prisma_1.prisma.user.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
        select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
        },
    });
    const recentPlans = yield prisma_1.prisma.travelPlan.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
        select: {
            id: true,
            title: true,
            createdAt: true,
        },
    });
    const recentPayments = yield prisma_1.prisma.paymentTransaction.findMany({
        where: {
            status: "SUCCEEDED",
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
        select: {
            id: true,
            amount: true,
            createdAt: true,
            user: {
                select: {
                    email: true,
                },
            },
        },
    });
    const recentActivity = [];
    recentUsers.forEach((user) => {
        recentActivity.push({
            type: "USER_REGISTERED",
            message: `New user registered: ${user.email}`,
            timestamp: user.createdAt,
            link: `/admin/users/${user.id}`,
        });
    });
    recentPlans.forEach((plan) => {
        recentActivity.push({
            type: "PLAN_CREATED",
            message: `New plan created: ${plan.title}`,
            timestamp: plan.createdAt,
            link: `/dashboard/travel-plans/${plan.id}`,
        });
    });
    recentPayments.forEach((payment) => {
        var _a;
        recentActivity.push({
            type: "PAYMENT_RECEIVED",
            message: `Payment received: $${payment.amount} from ${((_a = payment.user) === null || _a === void 0 ? void 0 : _a.email) || "Unknown"}`,
            timestamp: payment.createdAt,
            link: `/dashboard/payments/${payment.id}`,
        });
    });
    // Sort by timestamp and take last 10
    recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    recentActivity.splice(10);
    // Top Performing Plans (by member count)
    const topPlansRaw = yield prisma_1.prisma.travelPlan.findMany({
        include: {
            _count: {
                select: {
                    tripMembers: true,
                    expenses: true,
                },
            },
        },
        orderBy: {
            tripMembers: {
                _count: "desc",
            },
        },
        take: 5,
    });
    const topPlans = topPlansRaw.map((plan) => ({
        id: plan.id,
        title: plan.title,
        memberCount: plan._count.tripMembers,
        expenseCount: plan._count.expenses,
        isFeatured: plan.isFeatured,
    }));
    return {
        stats: {
            totalUsers,
            activeUsers,
            totalPlans,
            publicPlans,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            activeSubscriptions,
            totalMeetups,
            totalExpenses: Math.round(totalExpenses * 100) / 100,
            pendingBookingRequests,
        },
        charts: {
            revenueOverTime,
            plansByTravelType,
            userGrowth,
            subscriptionStatus,
        },
        recentActivity,
        topPlans,
    };
});
exports.DashboardService = {
    getUserOverview,
    getAdminOverview,
};
