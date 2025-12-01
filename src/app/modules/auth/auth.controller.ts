import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import httpStatus from "http-status";

const register = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User registered successfully!",
        data: result
    });
});

const login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    const { accessToken, refreshToken, user } = result;

    // Set cookies
    res.cookie("accessToken", accessToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 90 // 90 days
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully!",
        data: user
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        throw new Error("Refresh token not found!");
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 // 1 hour
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Access token generated successfully!",
        data: {
            accessToken: result.accessToken
        }
    });
});

const getMe = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await AuthService.getMe(user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully!",
        data: result
    });
});

export const AuthController = {
    register,
    login,
    refreshToken,
    getMe
};

