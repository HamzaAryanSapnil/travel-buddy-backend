import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { MediaController } from "./media.controller";
import { MediaValidation } from "./media.validation";
import optionalAuth from "../../middlewares/optionalAuth";

const router = express.Router();

// Upload media (multiple image URLs)
router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(MediaValidation.uploadMedia),
  MediaController.uploadMedia
);
// Public gallery (homepage) - NO AUTH REQUIRED
router.get(
  "/public/gallery",
  validateRequest(MediaValidation.getPublicGallery),
  MediaController.getPublicGallery
);

// Get media list
router.get(
  "/",
  optionalAuth(),
  validateRequest(MediaValidation.getMediaList),
  MediaController.getMediaList
);

// Get single media
router.get(
  "/:id",
  optionalAuth(),
  validateRequest(MediaValidation.getMedia),
  MediaController.getMedia
);

// Delete media
router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(MediaValidation.deleteMedia),
  MediaController.deleteMedia
);

export const MediaRoutes = router;
