"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.get("/me", (0, auth_1.default)("USER", "ADMIN"), user_controller_1.UserController.getMyProfile);
router.get("/me/travel-plans", (0, auth_1.default)("USER", "ADMIN"), user_controller_1.UserController.getMyTravelPlans);
router.get("/me/reviews", (0, auth_1.default)("USER", "ADMIN"), user_controller_1.UserController.getMyReviews);
// Admin routes
router.get("/admin", (0, auth_1.default)("ADMIN"), user_controller_1.UserController.getAllUsers);
router.patch("/me", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(user_validation_1.UserValidation.updateProfile), user_controller_1.UserController.updateMyProfile);
router.patch("/me/profile-image", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(user_validation_1.UserValidation.updateProfilePhoto), user_controller_1.UserController.updateProfilePhoto);
router.patch("/admin/:id/status", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(user_validation_1.UserValidation.adminUpdateStatus), user_controller_1.UserController.updateUserStatus);
router.patch("/admin/:id/verify", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(user_validation_1.UserValidation.adminVerifyUser), user_controller_1.UserController.verifyUser);
router.patch("/admin/:id/role", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(user_validation_1.UserValidation.adminUpdateRole), user_controller_1.UserController.updateUserRole);
router.delete("/admin/:id", (0, auth_1.default)("ADMIN"), user_controller_1.UserController.softDeleteUser);
exports.userRoutes = router;
