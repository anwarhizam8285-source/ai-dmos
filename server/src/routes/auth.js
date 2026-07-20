import express from "express";
import jwt from "jsonwebtoken";
import { auth } from "../services/firebaseService.js";
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
} from "../middlewares/authMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const router = express.Router();

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: email.split("@")[0],
    });

    const token = generateToken(userRecord.uid, email);
    const refreshToken = generateRefreshToken(userRecord.uid, email);

    res.status(201).json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ error: error.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password required" });
    }

    const userRecord = await auth.getUserByEmail(email);

    const token = generateToken(userRecord.uid, email);
    const refreshToken = generateRefreshToken(userRecord.uid, email);

    res.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Invalid email or password" });
  }
});

// GET /auth/me
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userRecord = await auth.getUser(req.user.uid);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      createdAt: userRecord.metadata?.creationTime,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// POST /auth/logout
router.post("/logout", verifyToken, (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

// POST /auth/refresh-token
router.post("/refresh-token", (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const newToken = generateToken(decoded.uid, decoded.email);

    res.json({
      success: true,
      token: newToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

export default router;
