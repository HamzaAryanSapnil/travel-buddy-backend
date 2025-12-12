import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import ApiError from "../../errors/ApiError";
import { UserService } from "./user.service";
import { TAuthUser } from "./user.interface";

const getMyProfile = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const result = await UserService.getMyProfile(authUser);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile retrieved successfully.",
        data: result
    });
});

const updateMyProfile = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const result = await UserService.updateMyProfile(authUser, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully.",
        data: result
    });
});

const updateProfilePhoto = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const { profileImage } = req.body;
    const result = await UserService.updateProfilePhoto(authUser, profileImage);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile photo updated successfully.",
        data: result
    });
});

const getMyTravelPlans = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const result = await UserService.getMyTravelPlans(authUser, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Travel plans retrieved successfully.",
        meta: result.meta,
        data: result.data
    });
});

const getMyReviews = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const result = await UserService.getMyReviews(authUser, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Reviews retrieved successfully.",
        meta: result.meta,
        data: result.data
    });
});

const getAllUsers = catchAsync(async (req, res) => {
    const result = await UserService.getAllUsers(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully.",
        meta: result.meta,
        data: result.data
    });
});

const updateUserStatus = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const userId = req.params.id;

    // Prevent admin from modifying their own status
    if (authUser.userId === userId) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You cannot modify your own status."
        );
    }

    const result = await UserService.updateUserStatus(userId, req.body.status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User status updated successfully.",
        data: result
    });
});

const verifyUser = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const userId = req.params.id;

    // Prevent admin from modifying their own verification status
    if (authUser.userId === userId) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You cannot modify your own verification status."
        );
    }

    const result = await UserService.verifyUser(userId, req.body.isVerified);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User verification updated successfully.",
        data: result
    });
});

const updateUserRole = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const userId = req.params.id;

    // Prevent admin from changing their own role
    if (authUser.userId === userId) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You cannot change your own role."
        );
    }

    const result = await UserService.updateUserRole(userId, req.body.role);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User role updated successfully.",
        data: result
    });
});

const softDeleteUser = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const userId = req.params.id;

    // Prevent admin from deleting their own account
    if (authUser.userId === userId) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You cannot delete your own account."
        );
    }

    const result = await UserService.softDeleteUser(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User deleted successfully.",
        data: result
    });
});

export const UserController = {
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


