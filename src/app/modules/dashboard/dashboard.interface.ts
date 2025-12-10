import { ExpenseCategory, TravelType, SubscriptionStatus } from "@prisma/client";

export type TAuthUser = {
  userId: string;
  email: string;
  role: string;
};

export type TUserDashboardOverview = {
  stats: {
    totalPlans: number;
    upcomingTrips: number;
    totalExpenses: number;
    activeSubscription: boolean;
  };
  charts: {
    expensesByCategory: Array<{
      category: ExpenseCategory;
      amount: number;
      percentage: number;
    }>;
    plansTimeline: Array<{
      month: string;
      count: number;
    }>;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
    link?: string;
  }>;
  upcomingMeetups: Array<{
    id: string;
    planTitle: string;
    location: string;
    scheduledAt: Date;
    rsvpStatus: string;
  }>;
  recentNotifications: Array<{
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    timestamp: Date;
    link?: string;
  }>;
};

export type TAdminDashboardOverview = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalPlans: number;
    publicPlans: number;
    totalRevenue: number;
    activeSubscriptions: number;
    totalMeetups: number;
    totalExpenses: number;
    pendingBookingRequests: number;
  };
  charts: {
    revenueOverTime: Array<{
      month: string;
      revenue: number;
    }>;
    plansByTravelType: Array<{
      type: TravelType;
      count: number;
    }>;
    userGrowth: Array<{
      month: string;
      newUsers: number;
    }>;
    subscriptionStatus: Array<{
      status: SubscriptionStatus;
      count: number;
      percentage: number;
    }>;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
    link?: string;
  }>;
  topPlans: Array<{
    id: string;
    title: string;
    memberCount: number;
    expenseCount: number;
    isFeatured: boolean;
  }>;
};

