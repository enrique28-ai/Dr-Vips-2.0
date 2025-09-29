// controllers/auth.controller.js
import User from "../models/User.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail
} from "../utils/email.js";
import { nanoid } from "nanoid"; // <-- sin crypto

// Helpers para códigos/tokens
const gen6Code = () => (Math.floor(100000 + Math.random() * 900000)).toString(); // 6 dígitos

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "User already exists" });

    const verificationToken = gen6Code();
    const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      name, email, password,
      verificationToken,
      verificationTokenExpiresAt,
      isVerified: false
    });

    await sendVerificationEmail(user.email, verificationToken);

    // Autologin por cookie (puedes quitarlo si quieres requerir verificación antes)
    generateTokenAndSetCookie(res, user._id);
    return res.status(201).json({ user, message: "Registered. Verification code sent." });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    generateTokenAndSetCookie(res, user._id);

    const safeUser = await User.findById(user._id);
    return res.json({ user: safeUser });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/auth/logout
export const logout = async (_req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/"
  });
  return res.json({ success: true, message: "Logged out" });
};

// GET /api/auth/me
export const me = async (req, res) => {
  return res.json({ user: req.user });
};

// POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "Code is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const now = new Date();
    if (!user.verificationToken || !user.verificationTokenExpiresAt || now > user.verificationTokenExpiresAt) {
      return res.status(400).json({ error: "Verification code expired" });
    }
    if (user.verificationToken !== code) {
      return res.status(400).json({ error: "Invalid code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);
    return res.json({ success: true, message: "Email verified" });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/auth/resend-code
export const resendVerificationCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "Already verified" });

    user.verificationToken = gen6Code();
    user.verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.verificationToken);
    return res.json({ success: true, message: "Verification code resent" });
  } catch (err) {
    console.error("resendVerificationCode error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/auth/forgot-password   { email }
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    const user = await User.findOne({ email });
    // Respuesta genérica para no filtrar si existe o no
    if (!user) return res.json({ success: true, message: "If the email exists, we sent a link" });

    // Token largo y aleatorio sin crypto
    const rawToken = nanoid(64); // ~64 chars url-safe
    user.resetPasswordToken = rawToken; // almacenado en claro (válido en apps pequeñas)
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    const resetURL = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;
    await sendPasswordResetEmail(user.email, resetURL);

    return res.json({ success: true, message: "If the email exists, we sent a link" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/auth/reset-password/:token   { password }
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params || {};
    const { password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: "Invalid payload" });

    // Como guardamos el token en claro, lo buscamos directo
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() }
    }).select("+password");

    if (!user) return res.status(400).json({ error: "Invalid or expired reset link" });

    user.password = password;               // se hashea en pre('save') del modelo
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);
    return res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
