import { TravelType, PlanVisibility } from "@prisma/client";

export type TAuthUser = {
    userId: string;
    email: string;
    role: string;
};

export type TTravelPlanCreatePayload = {
    title: string;
    destination: string;
    origin?: string;
    startDate: string;
    endDate: string;
    budgetMin?: number;
    budgetMax?: number;
    travelType: TravelType;
    visibility?: PlanVisibility;
    description?: string;
    coverPhoto?: string;
};

export type TTravelPlanUpdatePayload = Partial<Omit<TTravelPlanCreatePayload,
    "startDate" | "endDate" | "travelType">> & {
    startDate?: string;
    endDate?: string;
    travelType?: TravelType;
};

export type TTravelPlanQuery = {
    searchTerm?: string;
    visibility?: PlanVisibility;
    travelType?: TravelType;
    isFeatured?: string;
    page?: string | number;
    limit?: string | number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};


