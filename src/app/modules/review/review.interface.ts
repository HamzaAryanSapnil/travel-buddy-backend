import { RatingSource } from "@prisma/client";

export type TAuthUser = {
  userId: string;
  email: string;
  role: string;
};

export type TReviewCreatePayload = {
  rating: number;
  comment?: string;
  source: RatingSource;
  reviewedUserId?: string;
  planId?: string;
};

export type TReviewUpdatePayload = {
  rating?: number;
  comment?: string;
};

export type TReviewQuery = {
  rating?: number;
  source?: RatingSource;
  reviewerId?: string;
  reviewedUserId?: string;
  planId?: string;
  isEdited?: string | boolean;
  searchTerm?: string;
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type TReviewResponse = {
  id: string;
  rating: number;
  comment: string | null;
  isEdited: boolean;
  source: RatingSource;
  reviewerId: string;
  reviewedUserId: string | null;
  planId: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewer: {
    id: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
  };
  reviewedUser: {
    id: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
  } | null;
  plan: {
    id: string;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
  } | null;
};

export type TReviewListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: TReviewResponse[];
};

export type TReviewStatisticsResponse = {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  userId?: string;
  planId?: string | null;
};

