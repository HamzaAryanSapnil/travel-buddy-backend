import { NotificationType, PlanVisibility, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { TripMemberService } from "../tripMember/tripMember.service";
import { NotificationService } from "../notification/notification.service";
import { TAuthUser } from "../tripMember/tripMember.interface";
import {
  TItineraryItemCreate,
  TItineraryItemUpdate,
  TItineraryItemQuery,
  TItineraryItemResponse,
  TItineraryGroupedResponse,
  TItineraryPlanItemsResponse,
  TBulkUpsertPayload,
  TBulkUpsertItem,
  TReorderPayload
} from "./itinerary.interface";
import { computeNextOrder, computeNextOrderTx } from "./itinerary.helper";
import { getDaysBetween } from "../../helper/dateHelper";

/**
 * Get total days for a travel plan
 */
const getTotalDays = (startDate: Date, endDate: Date): number => {
  return getDaysBetween(startDate, endDate);
};

/**
 * Validate dayIndex is within plan's totalDays range
 */
const validateDayIndex = async (planId: string, dayIndex: number): Promise<void> => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
    select: {
      startDate: true,
      endDate: true
    }
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  const totalDays = getTotalDays(plan.startDate, plan.endDate);

  if (dayIndex < 1 || dayIndex > totalDays) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Day index must be between 1 and ${totalDays} (inclusive).`
    );
  }
};

/**
 * Validate date range is within plan's date window
 */
const validateDateRange = async (
  planId: string,
  startAt?: string,
  endAt?: string
): Promise<void> => {
  if (!startAt && !endAt) return;

  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
    select: {
      startDate: true,
      endDate: true
    }
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  const planStart = plan.startDate;
  const planEnd = plan.endDate;

  if (startAt) {
    const start = new Date(startAt);
    if (start < planStart || start > planEnd) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `startAt must be within the plan's date range (${planStart.toISOString()} to ${planEnd.toISOString()}).`
      );
    }
  }

  if (endAt) {
    const end = new Date(endAt);
    if (end < planStart || end > planEnd) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `endAt must be within the plan's date range (${planStart.toISOString()} to ${planEnd.toISOString()}).`
      );
    }
  }
};

/**
 * Create a new itinerary item
 */
const createItem = async (
  authUser: TAuthUser,
  payload: TItineraryItemCreate
): Promise<TItineraryItemResponse> => {
  // Validate plan exists and fetch details
  const plan = await prisma.travelPlan.findUnique({
    where: { id: payload.planId },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      visibility: true
    }
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check permission to edit itinerary
  await TripMemberService.assertTripMemberPermission(
    authUser,
    payload.planId,
    "canEditItinerary",
    "You do not have permission to create itinerary items."
  );

  // Validate dayIndex
  await validateDayIndex(payload.planId, payload.dayIndex);

  // Validate date range if provided
  if (payload.startAt || payload.endAt) {
    await validateDateRange(payload.planId, payload.startAt, payload.endAt);
  }

  // Compute order if not provided
  let order = payload.order;
  if (order === undefined) {
    order = await computeNextOrder(payload.planId, payload.dayIndex);
  }

  // Create item in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Re-compute order inside transaction to prevent race conditions
    if (payload.order === undefined) {
      order = await computeNextOrderTx(tx, payload.planId, payload.dayIndex);
    }

    const item = await tx.itineraryItem.create({
      data: {
        planId: payload.planId,
        dayIndex: payload.dayIndex,
        startAt: payload.startAt ? new Date(payload.startAt) : null,
        endAt: payload.endAt ? new Date(payload.endAt) : null,
        title: payload.title,
        description: payload.description || null,
        locationId: payload.locationId || null,
        order: order!
      },
      include: {
        location: true
      }
    });

    return item;
  });

  // Notify all plan members except creator (async, don't wait)
  NotificationService.notifyPlanMembers(
    payload.planId,
    authUser.userId,
    {
      type: NotificationType.ITINERARY_ADDED,
      title: "New itinerary item added",
      message: `"${payload.title}" was added to the itinerary`,
      data: {
        planId: payload.planId,
        itemId: result.id
      }
    }
  ).catch((error) => {
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
};

/**
 * Get all itinerary items for a plan (grouped by day)
 */
const getPlanItems = async (
  authUser: TAuthUser | null,
  planId: string,
  query: TItineraryItemQuery
): Promise<TItineraryPlanItemsResponse> => {
  // Check if plan exists and get details
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      visibility: true
    }
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check visibility permissions
  if (plan.visibility === PlanVisibility.PUBLIC) {
    // PUBLIC plans: anyone can view
  } else {
    // PRIVATE/UNLISTED: require authentication and membership
    if (!authUser) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Authentication required to view this plan."
      );
    }

    const { member } = await TripMemberService.getTripMemberPermission(authUser, planId);
    if (!member) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You are not allowed to view items for this plan."
      );
    }
  }

  const totalDays = getTotalDays(plan.startDate, plan.endDate);

  // Build where clause
  const where: Prisma.ItineraryItemWhereInput = {
    planId
  };

  if (query.dayIndex) {
    const dayIndex = typeof query.dayIndex === "string" ? parseInt(query.dayIndex, 10) : query.dayIndex;
    if (!isNaN(dayIndex)) {
      where.dayIndex = dayIndex;
    }
  }

  // Fetch items
  const items = await prisma.itineraryItem.findMany({
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
  const groupedByDay: Record<number, TItineraryItemResponse[]> = {};

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
  const days: TItineraryGroupedResponse[] = [];
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
};

/**
 * Get a single itinerary item
 */
const getSingleItem = async (
  authUser: TAuthUser | null,
  itemId: string
): Promise<TItineraryItemResponse> => {
  const item = await prisma.itineraryItem.findUnique({
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
    throw new ApiError(httpStatus.NOT_FOUND, "Itinerary item not found.");
  }

  // Check visibility permissions
  if (item.plan.visibility === PlanVisibility.PUBLIC) {
    // PUBLIC plans: anyone can view
  } else {
    // PRIVATE/UNLISTED: require authentication and membership
    if (!authUser) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Authentication required to view this item."
      );
    }

    const { member } = await TripMemberService.getTripMemberPermission(authUser, item.planId);
    if (!member) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You are not allowed to view this item."
      );
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
};

/**
 * Update an itinerary item
 */
const updateItem = async (
  authUser: TAuthUser,
  itemId: string,
  payload: TItineraryItemUpdate
): Promise<TItineraryItemResponse> => {
  // Load item and plan
  const item = await prisma.itineraryItem.findUnique({
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
    throw new ApiError(httpStatus.NOT_FOUND, "Itinerary item not found.");
  }

  // Check permission to edit
  await TripMemberService.assertTripMemberPermission(
    authUser,
    item.planId,
    "canEditItinerary",
    "You do not have permission to update this item."
  );

  // Validate dayIndex if changed
  if (payload.dayIndex !== undefined) {
    await validateDayIndex(item.planId, payload.dayIndex);
  }

  // Validate date range if provided
  if (payload.startAt || payload.endAt) {
    await validateDateRange(item.planId, payload.startAt, payload.endAt);
  }

  // Update in transaction
  const updated = await prisma.$transaction(async (tx) => {
    // If dayIndex changed, we might need to handle reordering
    // For now, we'll just update the item
    // (Reordering logic can be handled separately via reorder endpoint)

    const data: Prisma.ItineraryItemUpdateInput = {};

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
      } else {
        data.location = {
          disconnect: true
        };
      }
    }
    if (payload.order !== undefined) {
      data.order = payload.order;
    }

    const result = await tx.itineraryItem.update({
      where: { id: itemId },
      data,
      include: {
        location: true
      }
    });

    return result;
  });

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
};

/**
 * Delete an itinerary item
 */
const deleteItem = async (authUser: TAuthUser, itemId: string): Promise<void> => {
  // Load item and plan
  const item = await prisma.itineraryItem.findUnique({
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
    throw new ApiError(httpStatus.NOT_FOUND, "Itinerary item not found.");
  }

  // Check permission to edit
  await TripMemberService.assertTripMemberPermission(
    authUser,
    item.planId,
    "canEditItinerary",
    "You do not have permission to delete this item."
  );

  // Delete item
  await prisma.itineraryItem.delete({
    where: { id: itemId }
  });

  // Note: Order compaction is optional and can be done via reorder endpoint if needed
};

/**
 * Bulk upsert itinerary items (create/update/replace)
 * Used by AI Planner to create complete itineraries
 */
const bulkUpsert = async (
  authUser: TAuthUser,
  payload: TBulkUpsertPayload
): Promise<TItineraryItemResponse[]> => {
  // Validate plan exists and get details
  const plan = await prisma.travelPlan.findUnique({
    where: { id: payload.planId },
    select: {
      id: true,
      startDate: true,
      endDate: true
    }
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check permission to edit itinerary
  await TripMemberService.assertTripMemberPermission(
    authUser,
    payload.planId,
    "canEditItinerary",
    "You do not have permission to bulk update itinerary items."
  );

  const totalDays = getTotalDays(plan.startDate, plan.endDate);

  // Validate all items before processing
  for (const item of payload.items) {
    // Validate dayIndex
    if (item.dayIndex < 1 || item.dayIndex > totalDays) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Day index ${item.dayIndex} must be between 1 and ${totalDays} (inclusive).`
      );
    }

    // Validate date range if provided
    if (item.startAt || item.endAt) {
      const start = item.startAt ? new Date(item.startAt) : null;
      const end = item.endAt ? new Date(item.endAt) : null;

      if (start && (start < plan.startDate || start > plan.endDate)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `startAt for item "${item.title}" must be within the plan's date range.`
        );
      }

      if (end && (end < plan.startDate || end > plan.endDate)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `endAt for item "${item.title}" must be within the plan's date range.`
        );
      }

      if (start && end && end < start) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `endAt must be greater than or equal to startAt for item "${item.title}".`
        );
      }
    }
  }

  // Process in transaction
  const results = await prisma.$transaction(async (tx) => {
    // If replace=true, delete all existing items for the plan
    if (payload.replace) {
      await tx.itineraryItem.deleteMany({
        where: { planId: payload.planId }
      });
    }

    const createdOrUpdated: TItineraryItemResponse[] = [];

    // Process each item
    for (const itemData of payload.items) {
      let item: any;

      if (itemData.id && !payload.replace) {
        // Update existing item (only if not replacing)
        const existing = await tx.itineraryItem.findUnique({
          where: { id: itemData.id },
          include: { location: true }
        });

        if (existing && existing.planId === payload.planId) {
          // Update existing item
          item = await tx.itineraryItem.update({
            where: { id: itemData.id },
            data: {
              dayIndex: itemData.dayIndex,
              startAt: itemData.startAt ? new Date(itemData.startAt) : null,
              endAt: itemData.endAt ? new Date(itemData.endAt) : null,
              title: itemData.title,
              description: itemData.description || null,
              locationId: itemData.locationId || null,
              order: itemData.order ?? existing.order
            },
            include: { location: true }
          });
        } else {
          // Item not found or belongs to different plan, create new
          const order = itemData.order ?? (await computeNextOrderTx(tx, payload.planId, itemData.dayIndex));
          item = await tx.itineraryItem.create({
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
      } else {
        // Create new item
        const order = itemData.order ?? (await computeNextOrderTx(tx, payload.planId, itemData.dayIndex));
        item = await tx.itineraryItem.create({
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
  });

  // Notify all plan members except updater (async, don't wait)
  // This is typically used by AI Planner for bulk updates
  NotificationService.notifyPlanMembers(
    payload.planId,
    authUser.userId,
    {
      type: NotificationType.ITINERARY_UPDATED,
      title: "Itinerary updated",
      message: payload.replace 
        ? "Your travel plan itinerary has been updated" 
        : `${payload.items.length} itinerary items were added or updated`,
      data: {
        planId: payload.planId
      }
    }
  ).catch((error) => {
    // Log error but don't fail the bulk update
    console.error("Failed to send notification for itinerary update:", error);
  });

  return results;
};

/**
 * Reorder itinerary items (move between days, change order)
 */
const reorderItems = async (
  authUser: TAuthUser,
  payload: TReorderPayload
): Promise<TItineraryItemResponse[]> => {
  // Validate plan exists
  const plan = await prisma.travelPlan.findUnique({
    where: { id: payload.planId },
    select: {
      id: true,
      startDate: true,
      endDate: true
    }
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check permission to edit itinerary
  await TripMemberService.assertTripMemberPermission(
    authUser,
    payload.planId,
    "canEditItinerary",
    "You do not have permission to reorder itinerary items."
  );

  const totalDays = getTotalDays(plan.startDate, plan.endDate);

  // Validate all updates before processing
  const itemIds = payload.updates.map((u) => u.id);
  const existingItems = await prisma.itineraryItem.findMany({
    where: {
      id: { in: itemIds },
      planId: payload.planId
    }
  });

  if (existingItems.length !== itemIds.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "One or more items not found or do not belong to this plan."
    );
  }

  // Validate dayIndex for all updates
  for (const update of payload.updates) {
    if (update.dayIndex < 1 || update.dayIndex > totalDays) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Day index ${update.dayIndex} must be between 1 and ${totalDays} (inclusive).`
      );
    }

    if (update.order < 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Order must be >= 0 for item ${update.id}.`
      );
    }
  }

  // Process reordering in transaction
  const results = await prisma.$transaction(async (tx) => {
    // Update each item
    const updatedItems = await Promise.all(
      payload.updates.map((update) =>
        tx.itineraryItem.update({
          where: { id: update.id },
          data: {
            dayIndex: update.dayIndex,
            order: update.order
          },
          include: {
            location: true
          }
        })
      )
    );

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
  });

  return results;
};

export const ItineraryService = {
  createItem,
  getPlanItems,
  getSingleItem,
  updateItem,
  deleteItem,
  bulkUpsert,
  reorderItems
};

