import express from "express";
import auth from "../../middlewares/auth";
import optionalAuth from "../../middlewares/optionalAuth";
import validateRequest from "../../middlewares/validateRequest";
import { multerUpload } from "../../middlewares/upload";
import { TravelPlanController } from "./travelPlan.controller";
import { TravelPlanValidation } from "./travelPlan.validation";

const router = express.Router();

// Public route - Get all PUBLIC travel plans (NO AUTH REQUIRED)
router.get(
    "/public",
    TravelPlanController.getPublicTravelPlans
);

router.post(
    "/",
    auth("USER", "ADMIN"),
    multerUpload.array("files", 10),
    validateRequest(TravelPlanValidation.createTravelPlan),
    TravelPlanController.createTravelPlan
);

router.get(
    "/",
    auth("USER", "ADMIN"),
    TravelPlanController.getMyTravelPlans
);

// Public route with optional auth - Get single plan (PUBLIC plans accessible without auth)
router.get(
    "/:id",
    optionalAuth(),
    validateRequest(TravelPlanValidation.getSingleTravelPlan),
    TravelPlanController.getSingleTravelPlan
);

router.patch(
    "/:id",
    auth("USER", "ADMIN"),
    multerUpload.array("files", 10),
    validateRequest(TravelPlanValidation.updateTravelPlan),
    TravelPlanController.updateTravelPlan
);

router.delete(
    "/:id",
    auth("USER", "ADMIN"),
    validateRequest(TravelPlanValidation.getSingleTravelPlan),
    TravelPlanController.deleteTravelPlan
);

export const TravelPlanRoutes = router;


