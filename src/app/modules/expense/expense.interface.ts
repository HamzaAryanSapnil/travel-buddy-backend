import { ExpenseCategory, ExpenseSplitType } from "@prisma/client";

export type TAuthUser = {
    userId: string;
    email: string;
    role: string;
};

export type TExpenseParticipantPayload = {
    userId: string;
    amount?: number; // For CUSTOM split
    percentage?: number; // For PERCENTAGE split
};

export type TExpenseCreatePayload = {
    planId: string;
    payerId: string;
    amount: number;
    currency?: string;
    category: ExpenseCategory;
    description?: string;
    expenseDate: string;
    splitType: ExpenseSplitType;
    locationId?: string;
    participants?: TExpenseParticipantPayload[]; // Required for CUSTOM and PERCENTAGE, optional for EQUAL
};

export type TExpenseUpdatePayload = Partial<Omit<TExpenseCreatePayload, "planId" | "splitType">>;

export type TExpenseQuery = {
    searchTerm?: string;
    category?: ExpenseCategory;
    planId?: string;
    payerId?: string;
    splitType?: ExpenseSplitType;
    startDate?: string;
    endDate?: string;
    page?: string | number;
    limit?: string | number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

export type TExpenseParticipantResponse = {
    id: string;
    expenseId: string;
    userId: string;
    amount: number;
    isPaid: boolean;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        fullName: string | null;
        email: string;
        profileImage: string | null;
    };
};

export type TExpenseResponse = {
    id: string;
    planId: string;
    payerId: string;
    amount: number;
    currency: string;
    category: ExpenseCategory;
    description: string | null;
    expenseDate: Date;
    splitType: ExpenseSplitType;
    locationId: string | null;
    createdAt: Date;
    updatedAt: Date;
    payer: {
        id: string;
        fullName: string | null;
        email: string;
        profileImage: string | null;
    };
    plan: {
        id: string;
        title: string;
        destination: string;
    };
    locationRel?: {
        id: string;
        name: string;
        address: string | null;
        city: string | null;
        country: string | null;
        latitude: number | null;
        longitude: number | null;
    } | null;
    participants: TExpenseParticipantResponse[];
    summary?: {
        totalAmount: number;
        participantCount: number;
        settledCount: number;
        isFullySettled: boolean;
    };
};

export type TExpenseListResponse = {
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data: TExpenseResponse[];
};

export type TExpenseSummaryResponse = {
    planId: string;
    totalExpenses: number;
    currency: string;
    byCategory: {
        category: ExpenseCategory;
        total: number;
        count: number;
    }[];
    byPayer: {
        payerId: string;
        payerName: string;
        total: number;
        count: number;
    }[];
    settlement: {
        userId: string;
        userName: string;
        totalPaid: number;
        totalOwed: number;
        netAmount: number; // Positive = they owe, Negative = they're owed
    }[];
    budgetComparison?: {
        budgetMin: number | null;
        budgetMax: number | null;
        actualSpent: number;
        percentageUsed: number | null; // If budgetMax exists
        isOverBudget: boolean;
    };
};

