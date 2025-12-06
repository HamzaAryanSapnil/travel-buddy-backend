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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxOrderForDay = exports.compactOrders = exports.normalizeOrders = exports.computeNextOrderTx = exports.computeNextOrder = void 0;
const prisma_1 = require("../../shared/prisma");
const itinerary_constant_1 = require("./itinerary.constant");
/**
 * Compute next order value for a day (max order + 1)
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 * @returns Next order value
 */
const computeNextOrder = (planId, dayIndex) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const maxOrder = yield prisma_1.prisma.itineraryItem.aggregate({
        where: {
            planId,
            dayIndex
        },
        _max: {
            order: true
        }
    });
    return ((_a = maxOrder._max.order) !== null && _a !== void 0 ? _a : -1) + 1;
});
exports.computeNextOrder = computeNextOrder;
/**
 * Compute next order value within a transaction
 * @param tx - Prisma transaction client
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 * @returns Next order value
 */
const computeNextOrderTx = (tx, planId, dayIndex) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const maxOrder = yield tx.itineraryItem.aggregate({
        where: {
            planId,
            dayIndex
        },
        _max: {
            order: true
        }
    });
    return ((_a = maxOrder._max.order) !== null && _a !== void 0 ? _a : -1) + 1;
});
exports.computeNextOrderTx = computeNextOrderTx;
/**
 * Normalize orders to have gaps (10, 20, 30...) for easy reordering
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 */
const normalizeOrders = (planId, dayIndex) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield prisma_1.prisma.itineraryItem.findMany({
        where: {
            planId,
            dayIndex
        },
        orderBy: {
            order: "asc"
        }
    });
    if (items.length === 0)
        return;
    // Update orders with gaps
    yield prisma_1.prisma.$transaction(items.map((item, index) => prisma_1.prisma.itineraryItem.update({
        where: { id: item.id },
        data: { order: (index + 1) * itinerary_constant_1.ORDER_GAP }
    })));
});
exports.normalizeOrders = normalizeOrders;
/**
 * Compact orders to consecutive integers (1, 2, 3...)
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 */
const compactOrders = (planId, dayIndex) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield prisma_1.prisma.itineraryItem.findMany({
        where: {
            planId,
            dayIndex
        },
        orderBy: {
            order: "asc"
        }
    });
    if (items.length === 0)
        return;
    // Update orders to consecutive integers
    yield prisma_1.prisma.$transaction(items.map((item, index) => prisma_1.prisma.itineraryItem.update({
        where: { id: item.id },
        data: { order: index + 1 }
    })));
});
exports.compactOrders = compactOrders;
/**
 * Get max order value for a day
 * @param planId - Travel plan ID
 * @param dayIndex - Day index
 * @returns Max order value or 0 if no items
 */
const getMaxOrderForDay = (planId, dayIndex) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield prisma_1.prisma.itineraryItem.aggregate({
        where: {
            planId,
            dayIndex
        },
        _max: {
            order: true
        }
    });
    return (_a = result._max.order) !== null && _a !== void 0 ? _a : 0;
});
exports.getMaxOrderForDay = getMaxOrderForDay;
