export type TAuthUser = {
  userId: string;
  email: string;
  role: string;
};

export type TPaymentQuery = {
  status?: "SUCCEEDED" | "PENDING" | "REFUNDED" | "FAILED";
  userId?: string;
  subscriptionId?: string;
  currency?: string;
  startDate?: string;
  endDate?: string;
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type TPaymentResponse = {
  id: string;
  userId: string | null;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  status: string;
  gatewayData: any;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
  } | null;
  subscription: {
    id: string;
    planName: string | null;
    planType: string | null;
    status: string;
  } | null;
};

export type TPaymentListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: TPaymentResponse[];
};

export type TPaymentStatisticsResponse = {
  totalRevenue: number;
  totalTransactions: number;
  byStatus: {
    status: string;
    count: number;
    totalAmount: number;
  }[];
  byCurrency: {
    currency: string;
    count: number;
    totalAmount: number;
  }[];
  byDateRange?: {
    startDate: Date;
    endDate: Date;
    count: number;
    totalAmount: number;
  };
  recentPayments: TPaymentResponse[];
};

export type TPaymentSummaryResponse = {
  userId?: string;
  subscriptionId?: string | null;
  totalPayments: number;
  totalAmount: number;
  currency: string;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  pendingPayments: number;
  lastPaymentDate: Date | null;
  payments: TPaymentResponse[];
};

