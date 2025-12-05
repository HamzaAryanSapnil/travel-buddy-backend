import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { MeetupController } from "./meetup.controller";
import { MeetupValidation } from "./meetup.validation";

const router = express.Router();

router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(MeetupValidation.createMeetup),
  MeetupController.createMeetup
);

router.get(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(MeetupValidation.getMeetups),
  MeetupController.getMeetups
);

router.get(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(MeetupValidation.getMeetup),
  MeetupController.getMeetup
);

router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(MeetupValidation.updateMeetup),
  MeetupController.updateMeetup
);

router.patch(
  "/:id/status",
  auth("USER", "ADMIN"),
  validateRequest(MeetupValidation.updateStatus),
  MeetupController.updateStatus
);

router.post(
  "/:id/rsvp",
  auth("USER", "ADMIN"),
  validateRequest(MeetupValidation.rsvp),
  MeetupController.rsvp
);

router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(MeetupValidation.deleteMeetup),
  MeetupController.deleteMeetup
);

export const MeetupRoutes = router;

