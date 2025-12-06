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
exports.ItineraryService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = require("../../shared/prisma");
const tripMember_service_1 = require("../tripMember/tripMember.service");
const notification_service_1 = require("../notification/notification.service");
const itinerary_helper_1 = require("./itinerary.helper");
const dateHelper_1 = require("../../helper/dateHelper");
/**
 * Get total days for a travel plan
 */
const getTotalDays = (startDate, endDate) => {
    return (0, dateHelper_1.getDaysBetween)(startDate, endDate);
};
/**
 * Validate dayIndex is within plan's totalDays range
 */
const validateDayIndex = (planId, dayIndex) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
        select: {
            startDate: true,
            endDate: true
        }
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    const totalDays = getTotalDays(plan.startDate, plan.endDate);
    if (dayIndex < 1 || dayIndex > totalDays) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Day index must be between 1 and ${totalDays} (inclusive).`);
    }
});
/**
 * Validate date range is within plan's date window
 */
const validateDateRange = (planId, startAt, endAt) => __awaiter(void 0, void 0, void 0, function* () {
    if (!startAt && !endAt)
        return;
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
        select: {
            startDate: true,
            endDate: true
        }
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    const planStart = plan.startDate;
    const planEnd = plan.endDate;
    if (startAt) {
        const start = new Date(startAt);
        if (start < planStart || start > planEnd) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `startAt must be within the plan's date range (${planStart.toISOString()} to ${planEnd.toISOString()}).`);
        }
    }
    if (endAt) {
        const end = new Date(endAt);
        if (end < planStart || end > planEnd) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `endAt must be within the plan's date range (${planStart.toISOString()} to ${planEnd.toISOString()}).`);
        }
    }
});
/**
 * Create a new itinerary item
 */
const createItem = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate plan exists and fetch details
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: payload.planId },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            visibility: true
        }
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check permission to edit itinerary
    yield tripMember_service_1.TripMemberService.assertTripMemberPermission(authUser, payload.planId, "canEditItinerary", "You do not have permission to create itinerary items.");
    // Validate dayIndex
    yield validateDayIndex(payload.planId, payload.dayIndex);
    // Validate date range if provided
    if (payload.startAt || payload.endAt) {
        yield validateDateRange(payload.planId, payload.startAt, payload.endAt);
    }
    // Compute order if not provided
    let order = payload.order;
    if (order === undefined) {
        order = yield (0, itinerary_helper_1.computeNextOrder)(payload.planId, payload.dayIndex);
    }
    // Create item in transaction
    const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Re-compute order inside transaction to prevent race conditions
        if (payload.order === undefined) {
            order = yield (0, itinerary_helper_1.computeNextOrderTx)(tx, payload.planId, payload.dayIndex);
        }
        const item = yield tx.itineraryItem.create({
            data: {
                planId: payload.planId,
                dayIndex: payload.dayIndex,
                startAt: payload.startAt ? new Date(payload.startAt) : null,
                endAt: payload.endAt ? new Date(payload.endAt) : null,
                title: payload.title,
                description: payload.description || null,
                locationId: payload.locationId || null,
                order: order
            },
            include: {
                location: true
            }
        });
        return item;
    }));
    // Notify all plan members except creator (async, don't wait)
    notification_service_1.NotificationService.notifyPlanMembers(payload.planId, authUser.userId, {
        type: client_1.NotificationType.ITINERARY_ADDED,
        title: "New itinerary item added",
        message: `"${payload.title}" was added to the itinerary`,
        data: {
            planId: payload.planId,
            itemId: result.id
        }
    }).catch((error) => {
        // Log error but don't fail the item creation
        console.error("Failed to send notification for itinerary item:", error);
    });
    return {
        id: result.id,
        planId: result.planId,
        dayIndex: result.dayIndex,
        startAt: result.startAt,
        endAt: result.endAt,
        title: result.title,
        description: result.description,
        locationId: result.locationId,
        order: result.order,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        location: result.location
            ? {
                id: result.location.id,
                name: result.location.name,
                address: result.location.address,
                city: result.location.city,
                country: result.location.country,
                latitude: result.location.latitude,
                longitude: result.location.longitude,
                googlePlaceId: result.location.googlePlaceId
            }
            : null
    };
});
/**
 * Get all itinerary items for a plan (grouped by day)
 */
const getPlanItems = (authUser, planId, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if plan exists and get details
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            visibility: true
        }
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check visibility permissions
    if (plan.visibility === client_1.PlanVisibility.PUBLIC) {
        // PUBLIC plans: anyone can view
    }
    else {
        // PRIVATE/UNLISTED: require authentication and membership
        if (!authUser) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Authentication required to view this plan.");
        }
        const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, planId);
        if (!member) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to view items for this plan.");
        }
    }
    const totalDays = getTotalDays(plan.startDate, plan.endDate);
    // Build where clause
    const where = {
        planId
    };
    if (query.dayIndex) {
        const dayIndex = typeof query.dayIndex === "string" ? parseInt(query.dayIndex, 10) : query.dayIndex;
        if (!isNaN(dayIndex)) {
            where.dayIndex = dayIndex;
        }
    }
    // Fetch items
    const items = yield prisma_1.prisma.itineraryItem.findMany({
        where,
        include: {
            location: true
        },
        orderBy: [
            { dayIndex: "asc" },
            { order: "asc" }
        ]
    });
    // Group by day
    const groupedByDay = {};
    items.forEach((item) => {
        if (!groupedByDay[item.dayIndex]) {
            groupedByDay[item.dayIndex] = [];
        }
        groupedByDay[item.dayIndex].push({
            id: item.id,
            planId: item.planId,
            dayIndex: item.dayIndex,
            startAt: item.startAt,
            endAt: item.endAt,
            title: item.title,
            description: item.description,
            locationId: item.locationId,
            order: item.order,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            location: item.location
                ? {
                    id: item.location.id,
                    name: item.location.name,
                    address: item.location.address,
                    city: item.location.city,
                    country: item.location.country,
                    latitude: item.location.latitude,
                    longitude: item.location.longitude,
                    googlePlaceId: item.location.googlePlaceId
                }
                : null
        });
    });
    // Convert to array format
    const days = [];
    for (let day = 1; day <= totalDays; day++) {
        days.push({
            day,
            items: groupedByDay[day] || []
        });
    }
    return {
        days,
        totalDays
    };
});
/**
 * Get a single itinerary item
 */
const getSingleItem = (authUser, itemId) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield prisma_1.prisma.itineraryItem.findUnique({
        where: { id: itemId },
        include: {
            plan: {
                select: {
                    id: true,
                    visibility: true
                }
            },
            location: true
        }
    });
    if (!item) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Itinerary item not found.");
    }
    // Check visibility permissions
    if (item.plan.visibility === client_1.PlanVisibility.PUBLIC) {
        // PUBLIC plans: anyone can view
    }
    else {
        // PRIVATE/UNLISTED: require authentication and membership
        if (!authUser) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Authentication required to view this item.");
        }
        const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, item.planId);
        if (!member) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to view this item.");
        }
    }
    return {
        id: item.id,
        planId: item.planId,
        dayIndex: item.dayIndex,
        startAt: item.startAt,
        endAt: item.endAt,
        title: item.title,
        description: item.description,
        locationId: item.locationId,
        order: item.order,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        location: item.location
            ? {
                id: item.location.id,
                name: item.location.name,
                address: item.location.address,
                city: item.location.city,
                country: item.location.country,
                latitude: item.location.latitude,
                longitude: item.location.longitude,
                googlePlaceId: item.location.googlePlaceId
            }
            : null
    };
});
/**
 * Update an itinerary item
 */
const updateItem = (authUser, itemId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Load item and plan
    const item = yield prisma_1.prisma.itineraryItem.findUnique({
        where: { id: itemId },
        include: {
            plan: {
                select: {
                    id: true,
                    startDate: true,
                    endDate: true
                }
            }
        }
    });
    if (!item) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Itinerary item not found.");
    }
    // Check permission to edit
    yield tripMember_service_1.TripMemberService.assertTripMemberPermission(authUser, item.planId, "canEditItinerary", "You do not have permission to update this item.");
    // Validate dayIndex if changed
    if (payload.dayIndex !== undefined) {
        yield validateDayIndex(item.planId, payload.dayIndex);
    }
    // Validate date range if provided
    if (payload.startAt || payload.endAt) {
        yield validateDateRange(item.planId, payload.startAt, payload.endAt);
    }
    // Update in transaction
    const updated = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // If dayIndex changed, we might need to handle reordering
        // For now, we'll just update the item
        // (Reordering logic can be handled separately via reorder endpoint)
        const data = {};
        if (payload.dayIndex !== undefined) {
            data.dayIndex = payload.dayIndex;
        }
        if (payload.startAt !== undefined) {
            data.startAt = payload.startAt ? new Date(payload.startAt) : null;
        }
        if (payload.endAt !== undefined) {
            data.endAt = payload.endAt ? new Date(payload.endAt) : null;
        }
        if (payload.title !== undefined) {
            data.title = payload.title;
        }
        if (payload.description !== undefined) {
            data.description = payload.description || null;
        }
        if (payload.locationId !== undefined) {
            if (payload.locationId) {
                data.location = {
                    connect: { id: payload.locationId }
                };
            }
            else {
                data.location = {
                    disconnect: true
                };
            }
        }
        if (payload.order !== undefined) {
            data.order = payload.order;
        }
        const result = yield tx.itineraryItem.update({
            where: { id: itemId },
            data,
            include: {
                location: true
            }
        });
        return result;
    }));
    return {
        id: updated.id,
        planId: updated.planId,
        dayIndex: updated.dayIndex,
        startAt: updated.startAt,
        endAt: updated.endAt,
        title: updated.title,
        description: updated.description,
        locationId: updated.locationId,
        order: updated.order,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        location: updated.location
            ? {
                id: updated.location.id,
                name: updated.location.name,
                address: updated.location.address,
                city: updated.location.city,
                country: updated.location.country,
                latitude: updated.location.latitude,
                longitude: updated.location.longitude,
                googlePlaceId: updated.location.googlePlaceId
            }
            : null
    };
});
/**
 * Delete an itinerary item
 */
const deleteItem = (authUser, itemId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load item and plan
    const item = yield prisma_1.prisma.itineraryItem.findUnique({
        where: { id: itemId },
        include: {
            plan: {
                select: {
                    id: true
                }
            }
        }
    });
    if (!item) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Itinerary item not found.");
    }
    // Check permission to edit
    yield tripMember_service_1.TripMemberService.assertTripMemberPermission(authUser, item.planId, "canEditItinerary", "You do not have permission to delete this item.");
    // Delete item
    yield prisma_1.prisma.itineraryItem.delete({
        where: { id: itemId }
    });
    // Note: Order compaction is optional and can be done via reorder endpoint if needed
});
/**
 * Bulk upsert itinerary items (create/update/replace)
 * Used by AI Planner to create complete itineraries
 */
const bulkUpsert = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate plan exists and get details
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: payload.planId },
        select: {
            id: true,
            startDate: true,
            endDate: true
        }
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check permission to edit itinerary
    yield tripMember_service_1.TripMemberService.assertTripMemberPermission(authUser, payload.planId, "canEditItinerary", "You do not have permission to bulk update itinerary items.");
    const totalDays = getTotalDays(plan.startDate, plan.endDate);
    // Validate all items before processing
    for (const item of payload.items) {
        // Validate dayIndex
        if (item.dayIndex < 1 || item.dayIndex > totalDays) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Day index ${item.dayIndex} must be between 1 and ${totalDays} (inclusive).`);
        }
        // Validate date range if provided
        if (item.startAt || item.endAt) {
            const start = item.startAt ? new Date(item.startAt) : null;
            const end = item.endAt ? new Date(item.endAt) : null;
            if (start && (start < plan.startDate || start > plan.endDate)) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `startAt for item "${item.title}" must be within the plan's date range.`);
            }
            if (end && (end < plan.startDate || end > plan.endDate)) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `endAt for item "${item.title}" must be within the plan's date range.`);
            }
            if (start && end && end < start) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `endAt must be greater than or equal to startAt for item "${item.title}".`);
            }
        }
    }
    // Process in transaction
    const results = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        // If replace=true, delete all existing items for the plan
        if (payload.replace) {
            yield tx.itineraryItem.deleteMany({
                where: { planId: payload.planId }
            });
        }
        const createdOrUpdated = [];
        // Process each item
        for (const itemData of payload.items) {
            let item;
            if (itemData.id && !payload.replace) {
                // Update existing item (only if not replacing)
                const existing = yield tx.itineraryItem.findUnique({
                    where: { id: itemData.id },
                    include: { location: true }
                });
                if (existing && existing.planId === payload.planId) {
                    // Update existing item
                    item = yield tx.itineraryItem.update({
                        where: { id: itemData.id },
                        data: {
                            dayIndex: itemData.dayIndex,
                            startAt: itemData.startAt ? new Date(itemData.startAt) : null,
                            endAt: itemData.endAt ? new Date(itemData.endAt) : null,
                            title: itemData.title,
                            description: itemData.description || null,
                            locationId: itemData.locationId || null,
                            order: (_a = itemData.order) !== null && _a !== void 0 ? _a : existing.order
                        },
                        include: { location: true }
                    });
                }
                else {
                    // Item not found or belongs to different plan, create new
                    const order = (_b = itemData.order) !== null && _b !== void 0 ? _b : (yield (0, itinerary_helper_1.computeNextOrderTx)(tx, payload.planId, itemData.dayIndex));
                    item = yield tx.itineraryItem.create({
                        data: {
                            planId: payload.planId,
                            dayIndex: itemData.dayIndex,
                            startAt: itemData.startAt ? new Date(itemData.startAt) : null,
                            endAt: itemData.endAt ? new Date(itemData.endAt) : null,
                            title: itemData.title,
                            description: itemData.description || null,
                            locationId: itemData.locationId || null,
                            order
                        },
                        include: { location: true }
                    });
                }
            }
            else {
                // Create new item
                const order = (_c = itemData.order) !== null && _c !== void 0 ? _c : (yield (0, itinerary_helper_1.computeNextOrderTx)(tx, payload.planId, itemData.dayIndex));
                item = yield tx.itineraryItem.create({
                    data: {
                        planId: payload.planId,
                        dayIndex: itemData.dayIndex,
                        startAt: itemData.startAt ? new Date(itemData.startAt) : null,
                        endAt: itemData.endAt ? new Date(itemData.endAt) : null,
                        title: itemData.title,
                        description: itemData.description || null,
                        locationId: itemData.locationId || null,
                        order
                    },
                    include: { location: true }
                });
            }
            createdOrUpdated.push({
                id: item.id,
                planId: item.planId,
                dayIndex: item.dayIndex,
                startAt: item.startAt,
                endAt: item.endAt,
                title: item.title,
                description: item.description,
                locationId: item.locationId,
                order: item.order,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                location: item.location
                    ? {
                        id: item.location.id,
                        name: item.location.name,
                        address: item.location.address,
                        city: item.location.city,
                        country: item.location.country,
                        latitude: item.location.latitude,
                        longitude: item.location.longitude,
                        googlePlaceId: item.location.googlePlaceId
                    }
                    : null
            });
        }
        return createdOrUpdated;
    }));
    // Notify all plan members except updater (async, don't wait)
    // This is typically used by AI Planner for bulk updates
    notification_service_1.NotificationService.notifyPlanMembers(payload.planId, authUser.userId, {
        type: client_1.NotificationType.ITINERARY_UPDATED,
        title: "Itinerary updated",
        message: payload.replace
            ? "Your travel plan itinerary has been updated"
            : `${payload.items.length} itinerary items were added or updated`,
        data: {
            planId: payload.planId
        }
    }).catch((error) => {
        // Log error but don't fail the bulk update
        console.error("Failed to send notification for itinerary update:", error);
    });
    return results;
});
/**
 * Reorder itinerary items (move between days, change order)
 */
const reorderItems = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate plan exists
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: payload.planId },
        select: {
            id: true,
            startDate: true,
            endDate: true
        }
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check permission to edit itinerary
    yield tripMember_service_1.TripMemberService.assertTripMemberPermission(authUser, payload.planId, "canEditItinerary", "You do not have permission to reorder itinerary items.");
    const totalDays = getTotalDays(plan.startDate, plan.endDate);
    // Validate all updates before processing
    const itemIds = payload.updates.map((u) => u.id);
    const existingItems = yield prisma_1.prisma.itineraryItem.findMany({
        where: {
            id: { in: itemIds },
            planId: payload.planId
        }
    });
    if (existingItems.length !== itemIds.length) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "One or more items not found or do not belong to this plan.");
    }
    // Validate dayIndex for all updates
    for (const update of payload.updates) {
        if (update.dayIndex < 1 || update.dayIndex > totalDays) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Day index ${update.dayIndex} must be between 1 and ${totalDays} (inclusive).`);
        }
        if (update.order < 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Order must be >= 0 for item ${update.id}.`);
        }
    }
    // Process reordering in transaction
    const results = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Update each item
        const updatedItems = yield Promise.all(payload.updates.map((update) => tx.itineraryItem.update({
            where: { id: update.id },
            data: {
                dayIndex: update.dayIndex,
                order: update.order
            },
            include: {
                location: true
            }
        })));
        return updatedItems.map((item) => ({
            id: item.id,
            planId: item.planId,
            dayIndex: item.dayIndex,
            startAt: item.startAt,
            endAt: item.endAt,
            title: item.title,
            description: item.description,
            locationId: item.locationId,
            order: item.order,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            location: item.location
                ? {
                    id: item.location.id,
                    name: item.location.name,
                    address: item.location.address,
                    city: item.location.city,
                    country: item.location.country,
                    latitude: item.location.latitude,
                    longitude: item.location.longitude,
                    googlePlaceId: item.location.googlePlaceId
                }
                : null
        }));
    }));
    return results;
});
exports.ItineraryService = {
    createItem,
    getPlanItems,
    getSingleItem,
    updateItem,
    deleteItem,
    bulkUpsert,
    reorderItems
};
