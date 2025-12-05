import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReviewService } from "./review.service";
import { TAuthUser } from "./review.interface";

const createReview = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ReviewService.createReview(authUser, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully.",
    data: result,
  });
});

const getReview = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ReviewService.getReview(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review retrieved successfully.",
    data: result,
  });
});

const getReviews = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ReviewService.getReviews(authUser, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ReviewService.updateReview(
    authUser,
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully.",
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ReviewService.deleteReview(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const getReviewStatistics = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ReviewService.getReviewStatistics(
    authUser,
    req.query.userId as string | undefined,
    req.query.planId as string | undefined
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review statistics retrieved successfully.",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewStatistics,
};

