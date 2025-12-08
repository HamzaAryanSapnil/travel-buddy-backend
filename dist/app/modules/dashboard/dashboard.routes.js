"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const dashboard_controller_1 = require("./dashboard.controller");
const router = express_1.default.Router();
// User Dashboard Overview
router.get("/overview", (0, auth_1.default)("USER", "ADMIN"), dashboard_controller_1.DashboardController.getUserOverview);
// Admin Dashboard Overview
router.get("/admin/overview", (0, auth_1.default)("ADMIN"), dashboard_controller_1.DashboardController.getAdminOverview);
exports.DashboardRoutes = router;
