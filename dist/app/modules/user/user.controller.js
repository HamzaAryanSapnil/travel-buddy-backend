"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const user_service_1 = require("./user.service");
const getMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield user_service_1.UserService.getMyProfile(authUser);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Profile retrieved successfully.",
        data: result
    });
}));
const updateMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield user_service_1.UserService.updateMyProfile(authUser, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Profile updated successfully.",
        data: result
    });
}));
const updateProfilePhoto = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const { profileImage } = req.body;
    const result = yield user_service_1.UserService.updateProfilePhoto(authUser, profileImage);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Profile photo updated successfully.",
        data: result
    });
}));
const getMyTravelPlans = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield user_service_1.UserService.getMyTravelPlans(authUser, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Travel plans retrieved successfully.",
        meta: result.meta,
        data: result.data
    });
}));
const getMyReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield user_service_1.UserService.getMyReviews(authUser, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Reviews retrieved successfully.",
        meta: result.meta,
        data: result.data
    });
}));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.getAllUsers(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Users retrieved successfully.",
        meta: result.meta,
        data: result.data
    });
}));
const updateUserStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const userId = req.params.id;
    // Prevent admin from modifying their own status
    if (authUser.userId === userId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You cannot modify your own status.");
    }
    const result = yield user_service_1.UserService.updateUserStatus(userId, req.body.status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User status updated successfully.",
        data: result
    });
}));
const verifyUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const userId = req.params.id;
    // Prevent admin from modifying their own verification status
    if (authUser.userId === userId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You cannot modify your own verification status.");
    }
    const result = yield user_service_1.UserService.verifyUser(userId, req.body.isVerified);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User verification updated successfully.",
        data: result
    });
}));
const updateUserRole = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const userId = req.params.id;
    // Prevent admin from changing their own role
    if (authUser.userId === userId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You cannot change your own role.");
    }
    const result = yield user_service_1.UserService.updateUserRole(userId, req.body.role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User role updated successfully.",
        data: result
    });
}));
const softDeleteUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const userId = req.params.id;
    // Prevent admin from deleting their own account
    if (authUser.userId === userId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You cannot delete your own account.");
    }
    const result = yield user_service_1.UserService.softDeleteUser(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User deleted successfully.",
        data: result
    });
}));
exports.UserController = {
    getMyProfile,
    updateMyProfile,
    updateProfilePhoto,
    getMyTravelPlans,
    getMyReviews,
    getAllUsers,
    updateUserStatus,
    verifyUser,
    updateUserRole,
    softDeleteUser
};
