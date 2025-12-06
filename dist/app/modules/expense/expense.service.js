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
exports.ExpenseService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
const tripMember_service_1 = require("../tripMember/tripMember.service");
const notification_service_1 = require("../notification/notification.service");
/**
 * Calculate equal split amount per person
 * @param totalAmount - Total expense amount
 * @param memberCount - Number of members to split among
 * @returns Amount per person (rounded to 2 decimal places)
 */
const calculateEqualSplit = (totalAmount, memberCount) => {
    if (memberCount <= 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Member count must be greater than 0.");
    }
    return Math.round((totalAmount / memberCount) * 100) / 100;
};
/**
 * Validate custom split - sum of participant amounts must equal total amount
 * @param totalAmount - Total expense amount
 * @param participants - Array of participant amounts
 * @returns true if valid, throws error if invalid
 */
const validateCustomSplit = (totalAmount, participants) => {
    if (!participants || participants.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Participants array is required for CUSTOM split type.");
    }
    const totalParticipantAmount = participants.reduce((sum, p) => sum + (p.amount || 0), 0);
    // Allow small floating point differences (0.01)
    if (Math.abs(totalParticipantAmount - totalAmount) > 0.01) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Sum of participant amounts (${totalParticipantAmount.toFixed(2)}) must equal total amount (${totalAmount.toFixed(2)}).`);
    }
    // Check all participants have amount
    const missingAmount = participants.find((p) => p.amount === undefined || p.amount === null);
    if (missingAmount) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "All participants must have an amount for CUSTOM split type.");
    }
    return true;
};
/**
 * Validate percentage split - sum of percentages must equal 100
 * @param participants - Array of participant percentages
 * @returns true if valid, throws error if invalid
 */
const validatePercentageSplit = (participants) => {
    if (!participants || participants.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Participants array is required for PERCENTAGE split type.");
    }
    const totalPercentage = participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
    // Allow small floating point differences (0.01)
    if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Sum of participant percentages (${totalPercentage.toFixed(2)}%) must equal 100%.`);
    }
    // Check all participants have percentage
    const missingPercentage = participants.find((p) => p.percentage === undefined || p.percentage === null);
    if (missingPercentage) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "All participants must have a percentage for PERCENTAGE split type.");
    }
    return true;
};
/**
 * Calculate settlement summary - who owes what to whom
 * @param expenses - Array of expenses with participants
 * @returns Settlement summary with net amounts per user
 */
const calculateSettlementSummary = (planId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all expenses for the plan with participants
    const expenses = yield prisma_1.prisma.expense.findMany({
        where: { planId },
        include: {
            payer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
    // Track totals per user
    const userTotals = new Map();
    // Process each expense
    expenses.forEach((expense) => {
        const payerId = expense.payerId;
        const payerName = expense.payer.fullName || expense.payer.email;
        // Initialize payer if not exists
        if (!userTotals.has(payerId)) {
            userTotals.set(payerId, {
                name: payerName,
                paid: 0,
                owed: 0,
            });
        }
        // Add to payer's paid amount
        const payerTotal = userTotals.get(payerId);
        payerTotal.paid += expense.amount;
        // Process participants
        expense.participants.forEach((participant) => {
            const userId = participant.userId;
            const userName = participant.user.fullName || participant.user.email;
            // Initialize participant if not exists
            if (!userTotals.has(userId)) {
                userTotals.set(userId, {
                    name: userName,
                    paid: 0,
                    owed: 0,
                });
            }
            // Add to participant's owed amount
            const userTotal = userTotals.get(userId);
            userTotal.owed += participant.amount;
        });
    });
    // Convert to array and calculate net amounts
    return Array.from(userTotals.entries()).map(([userId, totals]) => ({
        userId,
        userName: totals.name,
        totalPaid: Math.round(totals.paid * 100) / 100,
        totalOwed: Math.round(totals.owed * 100) / 100,
        netAmount: Math.round((totals.owed - totals.paid) * 100) / 100, // Positive = they owe, Negative = they're owed
    }));
});
const assertCanViewPlan = (authUser, planId) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
        select: {
            id: true,
            visibility: true,
            startDate: true,
            endDate: true,
        },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check if plan is PUBLIC - anyone can view
    if (plan.visibility === client_1.PlanVisibility.PUBLIC) {
        return plan;
    }
    // For PRIVATE/UNLISTED plans, check if user is a member
    const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, planId);
    if (!member) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to view this plan.");
    }
    return plan;
});
const createExpense = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify plan exists and user is a member
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: payload.planId },
        select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            visibility: true,
        },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check if user is a plan member
    const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, payload.planId);
    if (!member && plan.visibility !== client_1.PlanVisibility.PUBLIC) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You must be a member of this plan to create expenses.");
    }
    // Verify payer is a plan member
    const payerMember = yield prisma_1.prisma.tripMember.findFirst({
        where: {
            planId: payload.planId,
            userId: payload.payerId,
            status: client_1.TripStatus.JOINED,
        },
    });
    if (!payerMember) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Payer must be a member of this plan.");
    }
    // Validate amount > 0
    if (payload.amount <= 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Amount must be greater than 0.");
    }
    // Validate expenseDate is within plan date range
    const expenseDate = new Date(payload.expenseDate);
    if (isNaN(expenseDate.getTime())) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid expense date format.");
    }
    if (expenseDate < plan.startDate || expenseDate > plan.endDate) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Expense date must be within the plan's date range.");
    }
    // Prepare participants based on splitType
    let participantsToCreate = [];
    if (payload.splitType === client_1.ExpenseSplitType.EQUAL) {
        // Get all plan members
        const planMembers = yield prisma_1.prisma.tripMember.findMany({
            where: {
                planId: payload.planId,
                status: client_1.TripStatus.JOINED,
            },
            select: {
                userId: true,
            },
        });
        if (planMembers.length === 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot create expense: plan has no members.");
        }
        const amountPerPerson = calculateEqualSplit(payload.amount, planMembers.length);
        participantsToCreate = planMembers.map((member) => ({
            userId: member.userId,
            amount: amountPerPerson,
        }));
    }
    else if (payload.splitType === client_1.ExpenseSplitType.CUSTOM) {
        // Validate custom split
        validateCustomSplit(payload.amount, payload.participants || []);
        // Verify all participants are plan members
        const participantUserIds = (payload.participants || []).map((p) => p.userId);
        const participantMembers = yield prisma_1.prisma.tripMember.findMany({
            where: {
                planId: payload.planId,
                userId: { in: participantUserIds },
                status: client_1.TripStatus.JOINED,
            },
        });
        if (participantMembers.length !== participantUserIds.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "All participants must be members of this plan.");
        }
        participantsToCreate = (payload.participants || []).map((p) => ({
            userId: p.userId,
            amount: p.amount,
        }));
    }
    else if (payload.splitType === client_1.ExpenseSplitType.PERCENTAGE) {
        // Validate percentage split
        validatePercentageSplit(payload.participants || []);
        // Verify all participants are plan members
        const participantUserIds = (payload.participants || []).map((p) => p.userId);
        const participantMembers = yield prisma_1.prisma.tripMember.findMany({
            where: {
                planId: payload.planId,
                userId: { in: participantUserIds },
                status: client_1.TripStatus.JOINED,
            },
        });
        if (participantMembers.length !== participantUserIds.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "All participants must be members of this plan.");
        }
        // Calculate amounts from percentages
        participantsToCreate = (payload.participants || []).map((p) => ({
            userId: p.userId,
            amount: Math.round((payload.amount * (p.percentage / 100)) * 100) / 100,
        }));
    }
    // Create expense and participants in transaction
    const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Create expense
        const expense = yield tx.expense.create({
            data: {
                planId: payload.planId,
                payerId: payload.payerId,
                amount: payload.amount,
                currency: payload.currency || "USD",
                category: payload.category,
                description: payload.description || null,
                expenseDate,
                splitType: payload.splitType,
                locationId: payload.locationId || null,
            },
        });
        // Create participants
        yield tx.expenseParticipant.createMany({
            data: participantsToCreate.map((p) => ({
                expenseId: expense.id,
                userId: p.userId,
                amount: p.amount,
                isPaid: false,
            })),
        });
        return expense;
    }));
    // Notify plan members (EXPENSE_ADDED)
    notification_service_1.NotificationService.notifyPlanMembers(payload.planId, authUser.userId, {
        type: client_1.NotificationType.EXPENSE_ADDED,
        title: "New expense added",
        message: `A new expense of ${payload.currency || "USD"} ${payload.amount} has been added to ${plan.title}`,
        data: {
            planId: payload.planId,
            expenseId: result.id,
        },
    }).catch((error) => {
        console.error("Failed to send notification for expense creation:", error);
    });
    // Fetch created expense with relations
    const expense = yield prisma_1.prisma.expense.findUniqueOrThrow({
        where: { id: result.id },
        include: {
            payer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                },
            },
            locationRel: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    latitude: true,
                    longitude: true,
                },
            },
            participants: {
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
            },
        },
    });
    const settledCount = expense.participants.filter((p) => p.isPaid).length;
    return {
        id: expense.id,
        planId: expense.planId,
        payerId: expense.payerId,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        description: expense.description,
        expenseDate: expense.expenseDate,
        splitType: expense.splitType,
        locationId: expense.locationId,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
        payer: expense.payer,
        plan: {
            id: expense.plan.id,
            title: expense.plan.title,
            destination: expense.plan.destination,
        },
        locationRel: expense.locationRel,
        participants: expense.participants.map((p) => ({
            id: p.id,
            expenseId: p.expenseId,
            userId: p.userId,
            amount: p.amount,
            isPaid: p.isPaid,
            paidAt: p.paidAt,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            user: p.user,
        })),
        summary: {
            totalAmount: expense.amount,
            participantCount: expense.participants.length,
            settledCount,
            isFullySettled: settledCount === expense.participants.length,
        },
    };
});
const getExpense = (authUser, expenseId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load expense with relations
    const expense = yield prisma_1.prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
            payer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                    visibility: true,
                },
            },
            locationRel: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    latitude: true,
                    longitude: true,
                },
            },
            participants: {
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
            },
        },
    });
    if (!expense) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Expense not found.");
    }
    // Check read permission (plan visibility + membership)
    yield assertCanViewPlan(authUser, expense.planId);
    const settledCount = expense.participants.filter((p) => p.isPaid).length;
    return {
        id: expense.id,
        planId: expense.planId,
        payerId: expense.payerId,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        description: expense.description,
        expenseDate: expense.expenseDate,
        splitType: expense.splitType,
        locationId: expense.locationId,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
        payer: expense.payer,
        plan: {
            id: expense.plan.id,
            title: expense.plan.title,
            destination: expense.plan.destination,
        },
        locationRel: expense.locationRel,
        participants: expense.participants.map((p) => ({
            id: p.id,
            expenseId: p.expenseId,
            userId: p.userId,
            amount: p.amount,
            isPaid: p.isPaid,
            paidAt: p.paidAt,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            user: p.user,
        })),
        summary: {
            totalAmount: expense.amount,
            participantCount: expense.participants.length,
            settledCount,
            isFullySettled: settledCount === expense.participants.length,
        },
    };
});
const getExpenses = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Pagination
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        sortBy: query.sortBy || "expenseDate",
        sortOrder: query.sortOrder || "desc",
    });
    // Build where clause
    const andConditions = [];
    // Search in description
    if (query.searchTerm) {
        andConditions.push({
            description: {
                contains: query.searchTerm,
                mode: "insensitive",
            },
        });
    }
    // Filter by category
    if (query.category) {
        andConditions.push({
            category: query.category,
        });
    }
    // Filter by planId
    if (query.planId) {
        // Verify user can view this plan
        yield assertCanViewPlan(authUser, query.planId);
        andConditions.push({
            planId: query.planId,
        });
    }
    // Filter by payerId
    if (query.payerId) {
        andConditions.push({
            payerId: query.payerId,
        });
    }
    // Filter by splitType
    if (query.splitType) {
        andConditions.push({
            splitType: query.splitType,
        });
    }
    // Filter by dateRange
    if (query.startDate || query.endDate) {
        const dateFilter = {};
        if (query.startDate) {
            dateFilter.gte = new Date(query.startDate);
        }
        if (query.endDate) {
            dateFilter.lte = new Date(query.endDate);
        }
        andConditions.push({
            expenseDate: dateFilter,
        });
    }
    // If no planId filter, only show expenses from plans user can view
    if (!query.planId) {
        // Get all plan IDs user can view
        const userPlans = yield prisma_1.prisma.travelPlan.findMany({
            where: {
                OR: [
                    { visibility: client_1.PlanVisibility.PUBLIC },
                    {
                        tripMembers: {
                            some: {
                                userId: authUser.userId,
                                status: client_1.TripStatus.JOINED,
                            },
                        },
                    },
                    { ownerId: authUser.userId },
                ],
            },
            select: { id: true },
        });
        const planIds = userPlans.map((p) => p.id);
        if (planIds.length > 0) {
            andConditions.push({
                planId: { in: planIds },
            });
        }
        else {
            // User has no accessible plans, return empty result
            return {
                meta: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
                data: [],
            };
        }
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    // Build orderBy
    const orderBy = {};
    if (sortBy === "expenseDate") {
        orderBy.expenseDate = sortOrder;
    }
    else if (sortBy === "amount") {
        orderBy.amount = sortOrder;
    }
    else if (sortBy === "createdAt") {
        orderBy.createdAt = sortOrder;
    }
    else {
        orderBy.expenseDate = "desc"; // Default
    }
    // Fetch expenses with pagination
    const expenses = yield prisma_1.prisma.expense.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy,
        include: {
            payer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                },
            },
            locationRel: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    latitude: true,
                    longitude: true,
                },
            },
            participants: {
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
            },
        },
    });
    // Get total count
    const total = yield prisma_1.prisma.expense.count({
        where: whereConditions,
    });
    // Format response
    const formattedExpenses = expenses.map((expense) => {
        const settledCount = expense.participants.filter((p) => p.isPaid).length;
        return {
            id: expense.id,
            planId: expense.planId,
            payerId: expense.payerId,
            amount: expense.amount,
            currency: expense.currency,
            category: expense.category,
            description: expense.description,
            expenseDate: expense.expenseDate,
            splitType: expense.splitType,
            locationId: expense.locationId,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,
            payer: expense.payer,
            plan: {
                id: expense.plan.id,
                title: expense.plan.title,
                destination: expense.plan.destination,
            },
            locationRel: expense.locationRel,
            participants: expense.participants.map((p) => ({
                id: p.id,
                expenseId: p.expenseId,
                userId: p.userId,
                amount: p.amount,
                isPaid: p.isPaid,
                paidAt: p.paidAt,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                user: p.user,
            })),
            summary: {
                totalAmount: expense.amount,
                participantCount: expense.participants.length,
                settledCount,
                isFullySettled: settledCount === expense.participants.length,
            },
        };
    });
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: formattedExpenses,
    };
});
const assertExpensePermission = (authUser, expenseId, action) => __awaiter(void 0, void 0, void 0, function* () {
    const expense = yield prisma_1.prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
            plan: {
                select: {
                    id: true,
                    ownerId: true,
                },
            },
        },
    });
    if (!expense) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Expense not found.");
    }
    // Check if user is payer
    if (expense.payerId === authUser.userId) {
        return expense;
    }
    // Check if user is plan owner/admin
    if (expense.plan.ownerId === authUser.userId || authUser.role === "ADMIN") {
        return expense;
    }
    // Check if user is plan admin via TripMember
    const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, expense.plan.id);
    if (member && (member.role === "OWNER" || member.role === "ADMIN")) {
        return expense;
    }
    throw new ApiError_1.default(http_status_1.default.FORBIDDEN, `You are not allowed to ${action} this expense. Only the payer or plan owner/admin can ${action} it.`);
});
const updateExpense = (authUser, expenseId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Load expense and check permission
    const expense = yield assertExpensePermission(authUser, expenseId, "update");
    // Get plan for date validation
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: expense.planId },
        select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
        },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    const updateData = {};
    // Update payerId
    if (payload.payerId !== undefined) {
        // Verify new payer is a plan member
        const payerMember = yield prisma_1.prisma.tripMember.findFirst({
            where: {
                planId: expense.planId,
                userId: payload.payerId,
                status: client_1.TripStatus.JOINED,
            },
        });
        if (!payerMember) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Payer must be a member of this plan.");
        }
        updateData.payer = { connect: { id: payload.payerId } };
    }
    // Update amount
    if (payload.amount !== undefined) {
        if (payload.amount <= 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Amount must be greater than 0.");
        }
        updateData.amount = payload.amount;
    }
    // Update currency
    if (payload.currency !== undefined) {
        updateData.currency = payload.currency;
    }
    // Update category
    if (payload.category !== undefined) {
        updateData.category = payload.category;
    }
    // Update description
    if (payload.description !== undefined) {
        updateData.description = payload.description || null;
    }
    // Update expenseDate
    if (payload.expenseDate !== undefined) {
        const expenseDate = new Date(payload.expenseDate);
        if (isNaN(expenseDate.getTime())) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid expense date format.");
        }
        if (expenseDate < plan.startDate || expenseDate > plan.endDate) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Expense date must be within the plan's date range.");
        }
        updateData.expenseDate = expenseDate;
    }
    // Update locationId
    if (payload.locationId !== undefined) {
        if (payload.locationId) {
            updateData.locationRel = { connect: { id: payload.locationId } };
        }
        else {
            updateData.locationRel = { disconnect: true };
        }
    }
    // If amount changed, recalculate participant amounts based on existing splitType
    let shouldRecalculateParticipants = false;
    if (payload.amount !== undefined && payload.amount !== expense.amount) {
        shouldRecalculateParticipants = true;
    }
    // Update expense and recalculate participants if needed
    const updated = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedExpense = yield tx.expense.update({
            where: { id: expenseId },
            data: updateData,
        });
        // Recalculate participant amounts if amount changed
        if (shouldRecalculateParticipants) {
            const participants = yield tx.expenseParticipant.findMany({
                where: { expenseId },
            });
            if (expense.splitType === client_1.ExpenseSplitType.EQUAL) {
                // Recalculate equal split
                const amountPerPerson = calculateEqualSplit(updatedExpense.amount, participants.length);
                yield Promise.all(participants.map((p) => tx.expenseParticipant.update({
                    where: { id: p.id },
                    data: { amount: amountPerPerson },
                })));
            }
            else if (expense.splitType === client_1.ExpenseSplitType.PERCENTAGE) {
                // Recalculate percentage-based amounts
                const totalPercentage = participants.reduce((sum, p) => sum + (p.amount / expense.amount) * 100, 0);
                yield Promise.all(participants.map((p) => {
                    const percentage = (p.amount / expense.amount) * 100;
                    const newAmount = Math.round((updatedExpense.amount * (percentage / 100)) * 100) /
                        100;
                    return tx.expenseParticipant.update({
                        where: { id: p.id },
                        data: { amount: newAmount },
                    });
                }));
            }
            // For CUSTOM split, we don't recalculate - amounts are fixed
        }
        return updatedExpense;
    }));
    // Notify plan members if significant changes (EXPENSE_UPDATED)
    notification_service_1.NotificationService.notifyPlanMembers(expense.planId, authUser.userId, {
        type: client_1.NotificationType.EXPENSE_UPDATED,
        title: "Expense updated",
        message: `An expense has been updated in ${plan.title}`,
        data: {
            planId: expense.planId,
            expenseId: updated.id,
        },
    }).catch((error) => {
        console.error("Failed to send notification for expense update:", error);
    });
    // Fetch updated expense with relations
    return getExpense(authUser, expenseId);
});
const deleteExpense = (authUser, expenseId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load expense and check permission
    const expense = yield assertExpensePermission(authUser, expenseId, "delete");
    // Get plan for notification
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: expense.planId },
        select: {
            id: true,
            title: true,
        },
    });
    // Delete expense (cascade deletes participants)
    yield prisma_1.prisma.expense.delete({
        where: { id: expenseId },
    });
    // Notify plan members (EXPENSE_DELETED)
    if (plan) {
        notification_service_1.NotificationService.notifyPlanMembers(expense.planId, authUser.userId, {
            type: client_1.NotificationType.EXPENSE_DELETED,
            title: "Expense deleted",
            message: `An expense has been deleted from ${plan.title}`,
            data: {
                planId: expense.planId,
                expenseId,
            },
        }).catch((error) => {
            console.error("Failed to send notification for expense deletion:", error);
        });
    }
});
const settleExpense = (authUser, expenseId, participantId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load expense and participant
    const expense = yield prisma_1.prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
            plan: {
                select: {
                    id: true,
                    title: true,
                    ownerId: true,
                },
            },
            payer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            participants: {
                where: { id: participantId },
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
            },
        },
    });
    if (!expense) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Expense not found.");
    }
    if (expense.participants.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Participant not found in this expense.");
    }
    const participant = expense.participants[0];
    // Verify user is the participant OR plan owner/admin
    const isParticipant = participant.userId === authUser.userId;
    const isPlanOwner = expense.plan.ownerId === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";
    // Check if user is plan admin via TripMember
    let isPlanAdmin = false;
    if (!isPlanOwner && !isAdmin) {
        const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, expense.plan.id);
        isPlanAdmin = member ? (member.role === "OWNER" || member.role === "ADMIN") : false;
    }
    if (!isParticipant && !isPlanOwner && !isAdmin && !isPlanAdmin) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to settle this expense. Only the participant themselves or plan owner/admin can settle it.");
    }
    // Check if already paid
    if (participant.isPaid) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "This expense participant is already marked as paid.");
    }
    // Mark participant as paid
    const updated = yield prisma_1.prisma.expenseParticipant.update({
        where: { id: participantId },
        data: {
            isPaid: true,
            paidAt: new Date(),
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
    // Check if all participants are paid
    const allParticipants = yield prisma_1.prisma.expenseParticipant.findMany({
        where: { expenseId },
    });
    const allPaid = allParticipants.every((p) => p.isPaid);
    // Notify payer when someone settles (if not the payer themselves)
    if (participant.userId !== expense.payerId) {
        notification_service_1.NotificationService.notifyUser(expense.payerId, {
            type: client_1.NotificationType.EXPENSE_UPDATED,
            title: "Expense settled",
            message: `${updated.user.fullName || updated.user.email} has marked their share as paid for an expense in ${expense.plan.title}`,
            data: {
                planId: expense.plan.id,
                expenseId,
                participantId,
            },
        }).catch((error) => {
            console.error("Failed to send notification for expense settlement:", error);
        });
    }
    return {
        id: updated.id,
        expenseId: updated.expenseId,
        userId: updated.userId,
        amount: updated.amount,
        isPaid: updated.isPaid,
        paidAt: updated.paidAt,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        user: updated.user,
    };
});
const getExpenseSummary = (authUser, planId) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify plan access
    const plan = yield assertCanViewPlan(authUser, planId);
    // Get plan with budget info
    const planWithBudget = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
        select: {
            id: true,
            budgetMin: true,
            budgetMax: true,
        },
    });
    // Get all expenses for the plan
    const expenses = yield prisma_1.prisma.expense.findMany({
        where: { planId },
        include: {
            payer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
    if (expenses.length === 0) {
        // Return empty summary
        return {
            planId,
            totalExpenses: 0,
            currency: "USD",
            byCategory: [],
            byPayer: [],
            settlement: [],
            budgetComparison: planWithBudget
                ? {
                    budgetMin: planWithBudget.budgetMin,
                    budgetMax: planWithBudget.budgetMax,
                    actualSpent: 0,
                    percentageUsed: null,
                    isOverBudget: false,
                }
                : undefined,
        };
    }
    // Get currency (use first expense's currency, assume all same)
    const currency = expenses[0].currency;
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    // Calculate by category
    const categoryMap = new Map();
    expenses.forEach((expense) => {
        const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
        categoryMap.set(expense.category, {
            total: existing.total + expense.amount,
            count: existing.count + 1,
        });
    });
    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        total: Math.round(data.total * 100) / 100,
        count: data.count,
    }));
    // Calculate by payer
    const payerMap = new Map();
    expenses.forEach((expense) => {
        const payerId = expense.payerId;
        const payerName = expense.payer.fullName || expense.payer.email;
        const existing = payerMap.get(payerId) || { name: payerName, total: 0, count: 0 };
        payerMap.set(payerId, {
            name: existing.name,
            total: existing.total + expense.amount,
            count: existing.count + 1,
        });
    });
    const byPayer = Array.from(payerMap.entries()).map(([payerId, data]) => ({
        payerId,
        payerName: data.name,
        total: Math.round(data.total * 100) / 100,
        count: data.count,
    }));
    // Calculate settlement summary
    const settlement = yield calculateSettlementSummary(planId);
    // Calculate budget comparison
    let budgetComparison;
    if (planWithBudget) {
        const actualSpent = Math.round(totalExpenses * 100) / 100;
        const percentageUsed = planWithBudget.budgetMax !== null
            ? Math.round((actualSpent / planWithBudget.budgetMax) * 100 * 100) / 100
            : null;
        const isOverBudget = planWithBudget.budgetMax !== null
            ? actualSpent > planWithBudget.budgetMax
            : false;
        budgetComparison = {
            budgetMin: planWithBudget.budgetMin,
            budgetMax: planWithBudget.budgetMax,
            actualSpent,
            percentageUsed,
            isOverBudget,
        };
    }
    return {
        planId,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        currency,
        byCategory,
        byPayer,
        settlement,
        budgetComparison,
    };
});
exports.ExpenseService = {
    calculateEqualSplit,
    validateCustomSplit,
    validatePercentageSplit,
    calculateSettlementSummary,
    createExpense,
    getExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    settleExpense,
    getExpenseSummary,
};
