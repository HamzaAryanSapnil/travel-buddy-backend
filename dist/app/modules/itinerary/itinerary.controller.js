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
exports.ItineraryController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const itinerary_service_1 = require("./itinerary.service");
const createItem = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield itinerary_service_1.ItineraryService.createItem(authUser, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Itinerary item created successfully.",
        data: result
    });
}));
const getPlanItems = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield itinerary_service_1.ItineraryService.getPlanItems(authUser, req.params.planId, Object.assign({ planId: req.params.planId }, req.query));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Itinerary items retrieved successfully.",
        data: result
    });
}));
const getSingleItem = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield itinerary_service_1.ItineraryService.getSingleItem(authUser, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Itinerary item retrieved successfully.",
        data: result
    });
}));
const updateItem = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield itinerary_service_1.ItineraryService.updateItem(authUser, req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Itinerary item updated successfully.",
        data: result
    });
}));
const deleteItem = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    yield itinerary_service_1.ItineraryService.deleteItem(authUser, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Itinerary item deleted successfully.",
        data: null
    });
}));
const bulkUpsert = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield itinerary_service_1.ItineraryService.bulkUpsert(authUser, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Itinerary items bulk updated successfully.",
        data: result
    });
}));
const reorderItems = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield itinerary_service_1.ItineraryService.reorderItems(authUser, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Itinerary items reordered successfully.",
        data: result
    });
}));
exports.ItineraryController = {
    createItem,
    getPlanItems,
    getSingleItem,
    updateItem,
    deleteItem,
    bulkUpsert,
    reorderItems
};
