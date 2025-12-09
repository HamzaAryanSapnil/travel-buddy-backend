import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TravelPlanService } from "./travelPlan.service";
import { TAuthUser } from "./travelPlan.interface";

const createTravelPlan = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const files = req.files as Express.Multer.File[] | undefined;
    const result = await TravelPlanService.createTravelPlan(authUser, req.body, files);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Travel plan created successfully.",
        data: result
    });
});

const getMyTravelPlans = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const result = await TravelPlanService.getMyTravelPlans(authUser, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Travel plans retrieved successfully.",
        meta: result.meta,
        data: result.data
    });
});

const getPublicTravelPlans = catchAsync(async (req, res) => {
    const result = await TravelPlanService.getPublicTravelPlans(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Public travel plans retrieved successfully.",
        meta: result.meta,
        data: result.data
    });
});

const getSingleTravelPlan = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser | null;
    const result = await TravelPlanService.getSingleTravelPlan(authUser, req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Travel plan retrieved successfully.",
        data: result
    });
});

const updateTravelPlan = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const files = req.files as Express.Multer.File[] | undefined;
    const result = await TravelPlanService.updateTravelPlan(
        authUser,
        req.params.id,
        req.body,
        files
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Travel plan updated successfully.",
        data: result
    });
});

const deleteTravelPlan = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    await TravelPlanService.deleteTravelPlan(authUser, req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Travel plan deleted successfully.",
        data: null
    });
});

export const TravelPlanController = {
    createTravelPlan,
    getMyTravelPlans,
    getPublicTravelPlans,
    getSingleTravelPlan,
    updateTravelPlan,
    deleteTravelPlan
};


