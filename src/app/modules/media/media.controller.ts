import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { MediaService } from "./media.service";
import { TAuthUser } from "./media.interface";

const uploadMedia = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const payload = req.body;

  const result = await MediaService.uploadMedia(authUser, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: result.message,
    data: result,
  });
});

const getMedia = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await MediaService.getMedia(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Media retrieved successfully.",
    data: result,
  });
});

const getMediaList = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser | null;
  const result = await MediaService.getMediaList(authUser, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Media list retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const deleteMedia = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await MediaService.deleteMedia(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const getPublicGallery = catchAsync(async (req, res) => {
  const result = await MediaService.getPublicGallery(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Public gallery retrieved successfully.",
    data: result.data,
    meta: result.meta,
  });
});

export const MediaController = {
  uploadMedia,
  getMedia,
  getMediaList,
  deleteMedia,
  getPublicGallery,
};

