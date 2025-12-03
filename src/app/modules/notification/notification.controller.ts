import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { NotificationService } from "./notification.service";
import { TAuthUser } from "../tripMember/tripMember.interface";

const getNotifications = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await NotificationService.getNotifications(authUser.userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully.",
    meta: result.meta,
    data: result.data
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await NotificationService.markAsRead(req.params.id, authUser.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read successfully.",
    data: result
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await NotificationService.markAllAsRead(authUser.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notifications marked as read successfully.",
    data: result
  });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await NotificationService.getUnreadCount(authUser.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Unread count retrieved successfully.",
    data: result
  });
});

export const NotificationController = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};

