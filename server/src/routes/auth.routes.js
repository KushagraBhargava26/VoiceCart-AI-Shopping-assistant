import { Router } from "express";
import {
  handleLogin,
  handleSignup,
  handleGoogleAuth,
  handleGetMe,
  handleForgotPassword,
  handleResetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", handleLogin);
router.post("/signup", handleSignup);
router.post("/google", handleGoogleAuth);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword);
router.get("/me", handleGetMe);

export default router;
