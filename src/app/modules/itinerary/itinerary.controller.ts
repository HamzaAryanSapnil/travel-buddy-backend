import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ItineraryService } from "./itinerary.service";
import { TAuthUser } from "../tripMember/tripMember.interface";

const createItem = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ItineraryService.createItem(authUser, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Itinerary item created successfully.",
    data: result
  });
});

const getPlanItems = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser | null;
  const result = await ItineraryService.getPlanItems(
    authUser,
    req.params.planId,
    {
      planId: req.params.planId,
      ...req.query
    }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Itinerary items retrieved successfully.",
    data: result
  });
});

const getSingleItem = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser | null;
  const result = await ItineraryService.getSingleItem(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Itinerary item retrieved successfully.",
    data: result
  });
});

const updateItem = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ItineraryService.updateItem(authUser, req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Itinerary item updated successfully.",
    data: result
  });
});

const deleteItem = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  await ItineraryService.deleteItem(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Itinerary item deleted successfully.",
    data: null
  });
});

const bulkUpsert = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ItineraryService.bulkUpsert(authUser, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Itinerary items bulk updated successfully.",
    data: result
  });
});

const reorderItems = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ItineraryService.reorderItems(authUser, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Itinerary items reordered successfully.",
    data: result
  });
});

export const ItineraryController = {
  createItem,
  getPlanItems,
  getSingleItem,
  updateItem,
  deleteItem,
  bulkUpsert,
  reorderItems
};

