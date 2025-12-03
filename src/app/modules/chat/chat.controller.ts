import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ChatService } from "./chat.service";
import { TAuthUser } from "../tripMember/tripMember.interface";

const createThread = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ChatService.createThread(authUser, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Chat thread created successfully.",
    data: result
  });
});

const getThread = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ChatService.getThread(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat thread retrieved successfully.",
    data: result
  });
});

const addMember = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ChatService.addMember(authUser, req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Member added to thread successfully.",
    data: result
  });
});

const getMessages = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ChatService.getMessages(authUser, req.params.id, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully.",
    data: result
  });
});

const sendMessage = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ChatService.sendMessage(authUser, req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Message sent successfully.",
    data: result
  });
});

const editMessage = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ChatService.editMessage(authUser, req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message edited successfully.",
    data: result
  });
});

const deleteMessage = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  await ChatService.deleteMessage(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message deleted successfully.",
    data: null
  });
});

const findThreadByPlan = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ChatService.findThreadByPlan(authUser, {
    planId: req.query.planId as string
  });

  if (!result) {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Chat thread not found for this travel plan.",
      data: null
    });
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat thread found successfully.",
    data: result
  });
});

export const ChatController = {
  createThread,
  getThread,
  addMember,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  findThreadByPlan
};

