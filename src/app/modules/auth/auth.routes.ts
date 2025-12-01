import express from "express";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login
);

router.post("/refresh-token", AuthController.refreshToken);

router.get("/me", auth("USER", "ADMIN"), AuthController.getMe);

export const authRoutes = router;
