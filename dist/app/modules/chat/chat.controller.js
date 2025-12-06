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
exports.ChatController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const chat_service_1 = require("./chat.service");
const createThread = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield chat_service_1.ChatService.createThread(authUser, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Chat thread created successfully.",
        data: result
    });
}));
const getThread = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield chat_service_1.ChatService.getThread(authUser, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat thread retrieved successfully.",
        data: result
    });
}));
const addMember = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield chat_service_1.ChatService.addMember(authUser, req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Member added to thread successfully.",
        data: result
    });
}));
const getMessages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield chat_service_1.ChatService.getMessages(authUser, req.params.id, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Messages retrieved successfully.",
        data: result
    });
}));
const sendMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield chat_service_1.ChatService.sendMessage(authUser, req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Message sent successfully.",
        data: result
    });
}));
const editMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield chat_service_1.ChatService.editMessage(authUser, req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Message edited successfully.",
        data: result
    });
}));
const deleteMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    yield chat_service_1.ChatService.deleteMessage(authUser, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Message deleted successfully.",
        data: null
    });
}));
const findThreadByPlan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield chat_service_1.ChatService.findThreadByPlan(authUser, {
        planId: req.query.planId
    });
    if (!result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "Chat thread not found for this travel plan.",
            data: null
        });
        return;
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat thread found successfully.",
        data: result
    });
}));
exports.ChatController = {
    createThread,
    getThread,
    addMember,
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    findThreadByPlan
};
