import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { TripMemberController } from "./tripMember.controller";
import { TripMemberValidation } from "./tripMember.validation";

const router = express.Router();

router.post(
    "/",
    auth("USER", "ADMIN"),
    validateRequest(TripMemberValidation.addMember),
    TripMemberController.addMember
);

router.get(
    "/:planId",
    auth("USER", "ADMIN"),
    validateRequest(TripMemberValidation.getMembers),
    TripMemberController.getMembers
);

router.patch(
    "/:id/role",
    auth("USER", "ADMIN"),
    validateRequest(TripMemberValidation.updateRole),
    TripMemberController.updateMemberRole
);

router.delete(
    "/:id",
    auth("USER", "ADMIN"),
    validateRequest(TripMemberValidation.removeMember),
    TripMemberController.removeMember
);

export const TripMemberRoutes = router;

