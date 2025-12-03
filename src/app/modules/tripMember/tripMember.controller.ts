import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TripMemberService } from "./tripMember.service";
import { TAuthUser } from "./tripMember.interface";

const addMember = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const result = await TripMemberService.addMember(authUser, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Member added successfully.",
        data: result
    });
});

const getMembers = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const result = await TripMemberService.getMembers(authUser, req.params.planId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Members retrieved successfully.",
        data: result
    });
});

const updateMemberRole = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    const result = await TripMemberService.updateMemberRole(
        authUser,
        req.params.id,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Member role updated successfully.",
        data: result
    });
});

const removeMember = catchAsync(async (req, res) => {
    const authUser = req.user as TAuthUser;
    await TripMemberService.removeMember(authUser, req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Member removed successfully.",
        data: null
    });
});

export const TripMemberController = {
    addMember,
    getMembers,
    updateMemberRole,
    removeMember
};

