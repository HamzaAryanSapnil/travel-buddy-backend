import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { MediaController } from "./media.controller";
import { MediaValidation } from "./media.validation";

const router = express.Router();

// Upload media (multiple image URLs)
router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(MediaValidation.uploadMedia),
  MediaController.uploadMedia
);

// Get single media
router.get(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(MediaValidation.getMedia),
  MediaController.getMedia
);

// Get media list
router.get(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(MediaValidation.getMediaList),
  MediaController.getMediaList
);

// Delete media
router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(MediaValidation.deleteMedia),
  MediaController.deleteMedia
);

export const MediaRoutes = router;

