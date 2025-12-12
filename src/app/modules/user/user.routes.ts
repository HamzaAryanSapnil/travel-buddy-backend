import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { upload } from "../../middlewares/upload";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.get("/me", auth("USER", "ADMIN"), UserController.getMyProfile);



router.get(
    "/me/travel-plans",
    auth("USER", "ADMIN"),
    UserController.getMyTravelPlans
);

router.get(
    "/me/reviews",
    auth("USER", "ADMIN"),
    UserController.getMyReviews
);

// Admin routes
router.get("/admin", auth("ADMIN"), UserController.getAllUsers);

router.patch(
  "/me",
  auth("USER", "ADMIN"),
  validateRequest(UserValidation.updateProfile),
  UserController.updateMyProfile
);

router.patch(
  "/me/profile-image",
  auth("USER", "ADMIN"),
  upload.single("profileImage"),
  UserController.updateProfilePhoto
);


router.patch(
    "/admin/:id/status",
    auth("ADMIN"),
    validateRequest(UserValidation.adminUpdateStatus),
    UserController.updateUserStatus
);

router.patch(
    "/admin/:id/verify",
    auth("ADMIN"),
    validateRequest(UserValidation.adminVerifyUser),
    UserController.verifyUser
);

router.patch(
    "/admin/:id/role",
    auth("ADMIN"),
    validateRequest(UserValidation.adminUpdateRole),
    UserController.updateUserRole
);

router.delete("/admin/:id", auth("ADMIN"), UserController.softDeleteUser);

export const userRoutes = router;


