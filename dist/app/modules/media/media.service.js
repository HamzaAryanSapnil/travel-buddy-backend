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
exports.MediaService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
const pick_1 = __importDefault(require("../../shared/pick"));
const media_constant_1 = require("./media.constant");
/**
 * Helper: Verify user owns the plan
 */
const verifyPlanOwnership = (authUser, planId) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
        select: { id: true, ownerId: true },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    if (plan.ownerId !== authUser.userId && authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to upload media to this plan. Only the plan owner can upload media.");
    }
});
/**
 * Helper: Verify user is the meetup organizer
 */
const verifyMeetupOwnership = (authUser, meetupId) => __awaiter(void 0, void 0, void 0, function* () {
    const meetup = yield prisma_1.prisma.meetup.findUnique({
        where: { id: meetupId },
        select: { id: true, organizerId: true },
    });
    if (!meetup) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Meetup not found.");
    }
    if (meetup.organizerId !== authUser.userId &&
        authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to upload media to this meetup. Only the organizer can upload media.");
    }
});
/**
 * Helper: Verify user owns the itinerary item's plan
 */
const verifyItineraryItemOwnership = (authUser, itineraryItemId) => __awaiter(void 0, void 0, void 0, function* () {
    const itineraryItem = yield prisma_1.prisma.itineraryItem.findUnique({
        where: { id: itineraryItemId },
        include: {
            plan: {
                select: { id: true, ownerId: true },
            },
        },
    });
    if (!itineraryItem) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Itinerary item not found.");
    }
    if (itineraryItem.plan.ownerId !== authUser.userId &&
        authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to upload media to this itinerary item. Only the plan owner can upload media.");
    }
});
/**
 * Helper: Verify user owns the media
 */
const verifyMediaOwnership = (authUser, mediaId) => __awaiter(void 0, void 0, void 0, function* () {
    const media = yield prisma_1.prisma.media.findUnique({
        where: { id: mediaId },
        select: { id: true, ownerId: true },
    });
    if (!media) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Media not found.");
    }
    if (media.ownerId !== authUser.userId && authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to delete this media. Only the owner can delete media.");
    }
});
/**
 * Helper: Verify user has access to view media (owner or plan member)
 */
const verifyMediaAccess = (authUser, media) => __awaiter(void 0, void 0, void 0, function* () {
    // Owner can always view
    if (media.ownerId === authUser.userId || authUser.role === client_1.Role.ADMIN) {
        return;
    }
    // If media is associated with a plan, check if user is a plan member
    if (media.planId) {
        const member = yield prisma_1.prisma.tripMember.findFirst({
            where: {
                planId: media.planId,
                userId: authUser.userId,
                status: "JOINED",
            },
        });
        if (member) {
            return;
        }
    }
    // If media is associated with a meetup, check if user is a plan member
    if (media.meetupId) {
        const meetup = yield prisma_1.prisma.meetup.findUnique({
            where: { id: media.meetupId },
            select: { planId: true },
        });
        if (meetup) {
            const member = yield prisma_1.prisma.tripMember.findFirst({
                where: {
                    planId: meetup.planId,
                    userId: authUser.userId,
                    status: "JOINED",
                },
            });
            if (member) {
                return;
            }
        }
    }
    // If media is associated with an itinerary item, check if user is a plan member
    if (media.itineraryItemId) {
        const itineraryItem = yield prisma_1.prisma.itineraryItem.findUnique({
            where: { id: media.itineraryItemId },
            select: { planId: true },
        });
        if (itineraryItem) {
            const member = yield prisma_1.prisma.tripMember.findFirst({
                where: {
                    planId: itineraryItem.planId,
                    userId: authUser.userId,
                    status: "JOINED",
                },
            });
            if (member) {
                return;
            }
        }
    }
    throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to view this media.");
});
/**
 * Upload media from image URLs
 * @param authUser - Authenticated user
 * @param payload - Media creation payload with image URLs
 * @returns Upload response with created media
 */
const uploadMedia = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate at least one entity ID is provided
    if (!payload.planId && !payload.meetupId && !payload.itineraryItemId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "At least one of planId, meetupId, or itineraryItemId must be provided.");
    }
    // Verify ownership
    if (payload.planId) {
        yield verifyPlanOwnership(authUser, payload.planId);
    }
    if (payload.meetupId) {
        yield verifyMeetupOwnership(authUser, payload.meetupId);
    }
    if (payload.itineraryItemId) {
        yield verifyItineraryItemOwnership(authUser, payload.itineraryItemId);
    }
    // Validate image URLs
    if (!payload.imageUrls || payload.imageUrls.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "No image URLs provided.");
    }
    if (payload.imageUrls.length > 10) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Maximum 10 images can be uploaded at once.");
    }
    const uploadedMedia = [];
    const errors = [];
    let uploadedCount = 0;
    let failedCount = 0;
    // Create media records for each URL
    for (const imageUrl of payload.imageUrls) {
        try {
            // Create media record directly with URL
            const media = yield prisma_1.prisma.media.create({
                data: {
                    ownerId: authUser.userId,
                    planId: payload.planId || null,
                    meetupId: payload.meetupId || null,
                    itineraryItemId: payload.itineraryItemId || null,
                    url: imageUrl,
                    provider: "imgbb",
                    type: payload.type || "photo",
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            profileImage: true,
                        },
                    },
                    plan: {
                        select: {
                            id: true,
                            title: true,
                            destination: true,
                        },
                    },
                    meetup: {
                        select: {
                            id: true,
                            scheduledAt: true,
                            location: true,
                        },
                    },
                    itineraryItem: {
                        select: {
                            id: true,
                            title: true,
                            dayIndex: true,
                        },
                    },
                },
            });
            uploadedMedia.push(media);
            uploadedCount++;
        }
        catch (error) {
            errors.push(`${imageUrl}: ${error.message || "Failed to create media record"}`);
            failedCount++;
        }
    }
    return {
        message: `Uploaded ${uploadedCount} image(s), ${failedCount} failed.`,
        uploadedCount,
        failedCount,
        media: uploadedMedia,
        errors: errors.length > 0 ? errors : undefined,
    };
});
/**
 * Get single media by ID
 * @param authUser - Authenticated user
 * @param mediaId - Media ID
 * @returns Media details
 */
const getMedia = (authUser, mediaId) => __awaiter(void 0, void 0, void 0, function* () {
    const media = yield prisma_1.prisma.media.findUnique({
        where: { id: mediaId },
        include: {
            owner: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                },
            },
            meetup: {
                select: {
                    id: true,
                    scheduledAt: true,
                    location: true,
                },
            },
            itineraryItem: {
                select: {
                    id: true,
                    title: true,
                    dayIndex: true,
                },
            },
        },
    });
    if (!media) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Media not found.");
    }
    // Verify access
    yield verifyMediaAccess(authUser, media);
    return media;
});
/**
 * Get paginated list of media
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated media list
 */
const getMediaList = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Pagination
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        sortBy: query.sortBy || "createdAt",
        sortOrder: query.sortOrder || "desc",
    });
    // Filters
    const filters = (0, pick_1.default)(query, media_constant_1.mediaFilterableFields);
    const andConditions = [];
    // Permission-based filtering
    if (authUser.role !== client_1.Role.ADMIN) {
        // Users can see their own media + media from plans they're members of
        const userPlans = yield prisma_1.prisma.tripMember.findMany({
            where: {
                userId: authUser.userId,
                status: "JOINED",
            },
            select: { planId: true },
        });
        const planIds = userPlans.map((tm) => tm.planId);
        andConditions.push({
            OR: [
                { ownerId: authUser.userId },
                { planId: { in: planIds } },
                {
                    meetup: {
                        planId: { in: planIds },
                    },
                },
                {
                    itineraryItem: {
                        planId: { in: planIds },
                    },
                },
            ],
        });
    }
    // Apply filters
    if (filters.type) {
        andConditions.push({ type: filters.type });
    }
    if (filters.ownerId) {
        andConditions.push({ ownerId: filters.ownerId });
    }
    if (filters.planId) {
        andConditions.push({ planId: filters.planId });
    }
    if (filters.meetupId) {
        andConditions.push({ meetupId: filters.meetupId });
    }
    if (filters.itineraryItemId) {
        andConditions.push({ itineraryItemId: filters.itineraryItemId });
    }
    if (filters.provider) {
        andConditions.push({ provider: filters.provider });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    // Get media
    const media = yield prisma_1.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            owner: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                },
            },
            meetup: {
                select: {
                    id: true,
                    scheduledAt: true,
                    location: true,
                },
            },
            itineraryItem: {
                select: {
                    id: true,
                    title: true,
                    dayIndex: true,
                },
            },
        },
    });
    // Get total count
    const total = yield prisma_1.prisma.media.count({ where });
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: media,
    };
});
/**
 * Delete media
 * @param authUser - Authenticated user
 * @param mediaId - Media ID
 * @returns Success message
 */
const deleteMedia = (authUser, mediaId) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify ownership
    yield verifyMediaOwnership(authUser, mediaId);
    // Get media to verify it exists
    const media = yield prisma_1.prisma.media.findUnique({
        where: { id: mediaId },
        select: { id: true, url: true, provider: true },
    });
    if (!media) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Media not found.");
    }
    // Note: imgBB handles image deletion on their side
    // For cloudinary images, deletion was handled separately
    // We only need to delete from database
    // Delete from database
    yield prisma_1.prisma.media.delete({
        where: { id: mediaId },
    });
    return {
        message: "Media deleted successfully.",
    };
});
exports.MediaService = {
    uploadMedia,
    getMedia,
    getMediaList,
    deleteMedia,
};
