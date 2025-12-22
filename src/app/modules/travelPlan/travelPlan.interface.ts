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
  galleryImages?: string[];
  isFeatured?: boolean;
};

export type TTravelPlanUpdatePayload = Partial<
  Omit<TTravelPlanCreatePayload, "startDate" | "endDate" | "travelType">
> & {
  startDate?: string;
  endDate?: string;
  travelType?: TravelType;
  galleryImages?: string[];
  isFeatured?: boolean;
};

export type TTravelPlanQuery = {
  searchTerm?: string;
  visibility?: PlanVisibility;
  travelType?: TravelType;
  isFeatured?: boolean;
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  destination?: string;
  origin?: string;
  startDate?: string;
  endDate?: string;
  budgetMin?: number;
  budgetMax?: number;
};
