import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { TravelPlanController } from "./travelPlan.controller";
import { TravelPlanValidation } from "./travelPlan.validation";

const router = express.Router();

router.post(
    "/",
    auth("USER", "ADMIN"),
    validateRequest(TravelPlanValidation.createTravelPlan),
    TravelPlanController.createTravelPlan
);

router.get(
    "/",
    auth("USER", "ADMIN"),
    TravelPlanController.getMyTravelPlans
);

router.get(
    "/:id",
    auth("USER", "ADMIN"),
    validateRequest(TravelPlanValidation.getSingleTravelPlan),
    TravelPlanController.getSingleTravelPlan
);

router.patch(
    "/:id",
    auth("USER", "ADMIN"),
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


