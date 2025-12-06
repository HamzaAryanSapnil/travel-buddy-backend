"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const user_routes_1 = require("../modules/user/user.routes");
const travelPlan_routes_1 = require("../modules/travelPlan/travelPlan.routes");
const tripMember_routes_1 = require("../modules/tripMember/tripMember.routes");
const itinerary_routes_1 = require("../modules/itinerary/itinerary.routes");
const planner_routes_1 = require("../modules/planner/planner.routes");
const chat_routes_1 = require("../modules/chat/chat.routes");
const notification_routes_1 = require("../modules/notification/notification.routes");
const meetup_routes_1 = require("../modules/meetup/meetup.routes");
const expense_routes_1 = require("../modules/expense/expense.routes");
const subscription_routes_1 = require("../modules/subscription/subscription.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const media_routes_1 = require("../modules/media/media.routes");
const review_routes_1 = require("../modules/review/review.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.authRoutes,
    },
    {
        path: "/users",
        route: user_routes_1.userRoutes,
    },
    {
        path: "/travel-plans",
        route: travelPlan_routes_1.TravelPlanRoutes,
    },
    {
        path: "/trip-members",
        route: tripMember_routes_1.TripMemberRoutes,
    },
    {
        path: "/itinerary",
        route: itinerary_routes_1.ItineraryRoutes,
    },
    {
        path: "/planner",
        route: planner_routes_1.PlannerRoutes,
    },
    {
        path: "/chat",
        route: chat_routes_1.ChatRoutes,
    },
    {
        path: "/notifications",
        route: notification_routes_1.NotificationRoutes,
    },
    {
        path: "/meetups",
        route: meetup_routes_1.MeetupRoutes,
    },
    {
        path: "/expenses",
        route: expense_routes_1.ExpenseRoutes,
    },
    {
        path: "/subscriptions",
        route: subscription_routes_1.SubscriptionRoutes,
    },
    {
        path: "/payments",
        route: payment_routes_1.PaymentRoutes,
    },
    {
        path: "/media",
        route: media_routes_1.MediaRoutes,
    },
    {
        path: "/reviews",
        route: review_routes_1.ReviewRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
