import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { TravelPlanRoutes } from "../modules/travelPlan/travelPlan.routes";
import { TripMemberRoutes } from "../modules/tripMember/tripMember.routes";
import { ItineraryRoutes } from "../modules/itinerary/itinerary.routes";
import { PlannerRoutes } from "../modules/planner/planner.routes";
import { ChatRoutes } from "../modules/chat/chat.routes";
import { NotificationRoutes } from "../modules/notification/notification.routes";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
