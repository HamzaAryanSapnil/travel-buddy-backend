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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
const pick_1 = __importDefault(require("../../shared/pick"));
const user_constant_1 = require("./user.constant");
const defaultUserSelect = {
    id: true,
    email: true,
    fullName: true,
    profileImage: true,
    bio: true,
    role: true,
    location: true,
    interests: true,
    visitedCountries: true,
    isVerified: true,
    status: true,
    avgRating: true,
    createdAt: true,
};
const getMyProfile = (authUser) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            id: authUser.userId,
        },
        select: defaultUserSelect,
    });
});
const updateMyProfile = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const data = {};
    if (payload.fullName !== undefined) {
        data.fullName = payload.fullName;
    }
    if (payload.bio !== undefined) {
        data.bio = payload.bio;
    }
    if (payload.location !== undefined) {
        data.location = payload.location;
    }
    if (payload.interests !== undefined) {
        data.interests = payload.interests;
    }
    if (payload.visitedCountries !== undefined) {
        data.visitedCountries = payload.visitedCountries;
    }
    if (payload.profileImage !== undefined) {
        data.profileImage = payload.profileImage;
    }
    return prisma_1.prisma.user.update({
        where: {
            id: authUser.userId,
        },
        data,
        select: defaultUserSelect,
    });
});
const updateProfilePhoto = (authUser, profileImageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (!profileImageUrl) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Profile image URL is required.");
    }
    const user = yield prisma_1.prisma.user.update({
        where: {
            id: authUser.userId,
        },
        data: {
            profileImage: profileImageUrl,
        },
        select: {
            id: true,
            profileImage: true,
        },
    });
    return user;
});
const normalizeOrder = (sortOrder) => sortOrder === "asc" ? "asc" : "desc";
const buildOrderBy = (sortBy, sortOrder) => ({
    [sortBy]: normalizeOrder(sortOrder),
});
const getMyTravelPlans = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy || "startDate",
        sortOrder: query.sortOrder || "asc",
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const now = new Date();
    const where = {
        ownerId: authUser.userId,
    };
    if (query.type === "future") {
        where.startDate = { gte: now };
    }
    else if (query.type === "past") {
        where.endDate = { lt: now };
    }
    const plans = yield prisma_1.prisma.travelPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
            itineraryItems: true,
            tripMembers: true,
        },
    });
    const total = yield prisma_1.prisma.travelPlan.count({
        where,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: plans,
    };
});
const getMyReviews = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy || "createdAt",
        sortOrder: query.sortOrder || "desc",
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const reviewType = query.reviewType || "received";
    const where = reviewType === "given"
        ? { reviewerId: authUser.userId }
        : { reviewedUserId: authUser.userId };
    const reviews = yield prisma_1.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: buildOrderBy(sortBy, sortOrder),
        include: {
            reviewer: {
                select: {
                    id: true,
                    fullName: true,
                    profileImage: true,
                },
            },
            reviewedUser: {
                select: {
                    id: true,
                    fullName: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                    startDate: true,
                    endDate: true,
                },
            },
        },
    });
    const total = yield prisma_1.prisma.review.count({
        where,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: reviews,
    };
});
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(query, user_constant_1.userFilterableFields);
    const options = {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy || "createdAt",
        sortOrder: query.sortOrder || "desc",
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const _a = filters, { searchTerm } = _a, restFilters = __rest(_a, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (restFilters.status) {
        andConditions.push({
            status: restFilters.status,
        });
    }
    if (restFilters.role) {
        andConditions.push({
            role: restFilters.role,
        });
    }
    if (restFilters.isVerified) {
        const isVerified = restFilters.isVerified === "true";
        andConditions.push({
            isVerified,
        });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const users = yield prisma_1.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: buildOrderBy(sortBy, sortOrder),
        select: defaultUserSelect,
    });
    const total = yield prisma_1.prisma.user.count({
        where,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: users,
    };
});
const updateUserStatus = (userId, status) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            status,
        },
        select: defaultUserSelect,
    });
});
const verifyUser = (userId, isVerified) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            isVerified,
        },
        select: defaultUserSelect,
    });
});
const updateUserRole = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role,
        },
        select: defaultUserSelect,
    });
});
const softDeleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            status: "DELETED",
        },
        select: defaultUserSelect,
    });
});
exports.UserService = {
    getMyProfile,
    updateMyProfile,
    updateProfilePhoto,
    getMyTravelPlans,
    getMyReviews,
    getAllUsers,
    updateUserStatus,
    verifyUser,
    updateUserRole,
    softDeleteUser,
};
