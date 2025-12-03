import { prisma } from "../../shared/prisma";
import { ORDER_GAP } from "./itinerary.constant";

/**
 * Compute next order value for a day (max order + 1)
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 * @returns Next order value
 */
export const computeNextOrder = async (
  planId: string,
  dayIndex: number
): Promise<number> => {
  const maxOrder = await prisma.itineraryItem.aggregate({
    where: {
      planId,
      dayIndex
    },
    _max: {
      order: true
    }
  });

  return (maxOrder._max.order ?? -1) + 1;
};

/**
 * Compute next order value within a transaction
 * @param tx - Prisma transaction client
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 * @returns Next order value
 */
export const computeNextOrderTx = async (
  tx: any,
  planId: string,
  dayIndex: number
): Promise<number> => {
  const maxOrder = await tx.itineraryItem.aggregate({
    where: {
      planId,
      dayIndex
    },
    _max: {
      order: true
    }
  });

  return (maxOrder._max.order ?? -1) + 1;
};

/**
 * Normalize orders to have gaps (10, 20, 30...) for easy reordering
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 */
export const normalizeOrders = async (
  planId: string,
  dayIndex: number
): Promise<void> => {
  const items = await prisma.itineraryItem.findMany({
    where: {
      planId,
      dayIndex
    },
    orderBy: {
      order: "asc"
    }
  });

  if (items.length === 0) return;

  // Update orders with gaps
  await prisma.$transaction(
    items.map((item, index) =>
      prisma.itineraryItem.update({
        where: { id: item.id },
        data: { order: (index + 1) * ORDER_GAP }
      })
    )
  );
};

/**
 * Compact orders to consecutive integers (1, 2, 3...)
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 */
export const compactOrders = async (
  planId: string,
  dayIndex: number
): Promise<void> => {
  const items = await prisma.itineraryItem.findMany({
    where: {
      planId,
      dayIndex
    },
    orderBy: {
      order: "asc"
    }
  });

  if (items.length === 0) return;

  // Update orders to consecutive integers
  await prisma.$transaction(
    items.map((item, index) =>
      prisma.itineraryItem.update({
        where: { id: item.id },
        data: { order: index + 1 }
      })
    )
  );
};

/**
 * Get max order value for a day
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 * @returns Max order value or 0 if no items
 */
export const getMaxOrderForDay = async (
  planId: string,
  dayIndex: number
): Promise<number> => {
  const result = await prisma.itineraryItem.aggregate({
    where: {
      planId,
      dayIndex
    },
    _max: {
      order: true
    }
  });

  return result._max.order ?? 0;
};

