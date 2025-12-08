import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { TravelPlanRoutes } from "../modules/travelPlan/travelPlan.routes";
import { TripMemberRoutes } from "../modules/tripMember/tripMember.routes";
import { ItineraryRoutes } from "../modules/itinerary/itinerary.routes";
import { PlannerRoutes } from "../modules/planner/planner.routes";
import { ChatRoutes } from "../modules/chat/chat.routes";
import { NotificationRoutes } from "../modules/notification/notification.routes";
import { MeetupRoutes } from "../modules/meetup/meetup.routes";
import { ExpenseRoutes } from "../modules/expense/expense.routes";
import { SubscriptionRoutes } from "../modules/subscription/subscription.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { MediaRoutes } from "../modules/media/media.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/travel-plans",
    route: TravelPlanRoutes,
  },
  {
    path: "/trip-members",
    route: TripMemberRoutes,
  },
  {
    path: "/itinerary",
    route: ItineraryRoutes,
  },
  {
    path: "/planner",
    route: PlannerRoutes,
  },
  {
    path: "/chat",
    route: ChatRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/meetups",
    route: MeetupRoutes,
  },
  {
    path: "/expenses",
    route: ExpenseRoutes,
  },
  {
    path: "/subscriptions",
    route: SubscriptionRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/media",
    route: MediaRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
