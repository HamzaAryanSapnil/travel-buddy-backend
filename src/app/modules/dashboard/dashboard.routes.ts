import express from "express";
import auth from "../../middlewares/auth";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

// User Dashboard Overview
router.get(
  "/overview",
  auth("USER", "ADMIN"),
  DashboardController.getUserOverview
);

// Admin Dashboard Overview
router.get(
  "/admin/overview",
  auth("ADMIN"),
  DashboardController.getAdminOverview
);

export const DashboardRoutes = router;

