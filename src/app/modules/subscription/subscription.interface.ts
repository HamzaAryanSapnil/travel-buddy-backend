import { SubscriptionStatus } from "@prisma/client";

export type TAuthUser = {
  userId: string;
  email: string;
  role: string;
};

export type TSubscriptionCreatePayload = {
  planType: "MONTHLY" | "YEARLY";
};

export type TSubscriptionUpdatePayload = {
  cancelAtPeriodEnd?: boolean;
};

export type TSubscriptionQuery = {
  status?: SubscriptionStatus;
  planType?: "MONTHLY" | "YEARLY";
  planName?: string;
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type TSubscriptionResponse = {
  id: string;
  userId: string;
  planName: string | null;
  planType: string | null;
  status: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  startedAt: Date;
  expiresAt: Date | null;
  cancelAtPeriodEnd: boolean | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
  };
};

export type TSubscriptionListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: TSubscriptionResponse[];
};

export type TSubscriptionStatusResponse = {
  hasSubscription: boolean;
  subscription: {
    id: string;
    planName: string | null;
    planType: string | null;
    status: SubscriptionStatus;
    startedAt: Date;
    expiresAt: Date | null;
    cancelAtPeriodEnd: boolean | null;
    daysRemaining: number | null;
  } | null;
};

export type TStripeWebhookPayload = {
  id: string;
  type: string;
  data: {
    object: any;
  };
};

