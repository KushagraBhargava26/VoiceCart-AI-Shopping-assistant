import { Router } from "express";
import { handleLogin, handleSignup, handleGoogleAuth, handleGetMe } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", handleLogin);
router.post("/signup", handleSignup);
router.post("/google", handleGoogleAuth);
router.get("/me", handleGetMe);

export default router;
