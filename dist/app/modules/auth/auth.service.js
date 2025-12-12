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
exports.AuthService = void 0;
const prisma_1 = require("../../shared/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwtHelper_1 = require("../../helper/jwtHelper");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const register = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user already exists
    const existingUser = yield prisma_1.prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (existingUser) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, "User already exists with this email!");
    }
    // Hash password
    const hashedPassword = yield bcryptjs_1.default.hash(payload.password, Number(config_1.default.salt_round) || 10);
    // Create user
    const user = yield prisma_1.prisma.user.create({
        data: {
            email: payload.email,
            passwordHash: hashedPassword,
            fullName: payload === null || payload === void 0 ? void 0 : payload.fullName,
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isVerified: true,
            status: true,
            createdAt: true,
        },
    });
    return user;
});
const login = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Find user
    const user = yield prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
        },
    });
    // Verify password
    const isCorrectPassword = yield bcryptjs_1.default.compare(payload.password, user.passwordHash);
    if (!isCorrectPassword) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Password is incorrect!");
    }
    // Generate tokens
    const accessToken = jwtHelper_1.jwtHelper.generateToken({ email: user.email, role: user.role, userId: user.id }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in || "1h");
    const refreshToken = jwtHelper_1.jwtHelper.generateToken({ email: user.email, role: user.role, userId: user.id }, config_1.default.jwt.refresh_token_secret, config_1.default.jwt.refresh_token_expires_in || "90d");
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isVerified: user.isVerified,
            status: user.status,
        },
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedData;
    try {
        decodedData = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.refresh_token_secret);
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid refresh token!");
    }
    // Verify user still exists and is active
    const userData = yield prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
        },
    });
    // Generate new access token
    const accessToken = jwtHelper_1.jwtHelper.generateToken({
        email: userData.email,
        role: userData.role,
        userId: userData.id,
    }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in || "1h");
    return {
        accessToken,
    };
});
const getMe = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            profileImage: true,
            bio: true,
            location: true,
            interests: true,
            visitedCountries: true,
            isVerified: true,
            status: true,
            role: true,
            createdAt: true,
        },
    });
    return userData;
});
exports.AuthService = {
    register,
    login,
    refreshToken,
    getMe,
};
