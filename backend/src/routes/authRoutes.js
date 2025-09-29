// routes/auth.route.js
import { Router } from "express";
import {
  register, login, logout, me,
  verifyEmail, resendVerificationCode,
  forgotPassword, resetPassword
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, me);

router.post("/verify-email", protect, verifyEmail);
router.post("/resend-code", protect, resendVerificationCode);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
