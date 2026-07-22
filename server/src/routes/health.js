import express from "express";
import { getFullHealthStatus } from "../services/healthService.js";

const router = express.Router();

// GET /health - Simple health check
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0-alpha",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

// GET /health/detailed - Detailed health status
router.get("/detailed", async (req, res) => {
  try {
    const status = await getFullHealthStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /health/ready - Readiness probe for Kubernetes
router.get("/ready", async (req, res) => {
  try {
    const status = await getFullHealthStatus();
    const isReady = status.status === "healthy";
    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      status: status.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /health/live - Liveness probe for Kubernetes
router.get("/live", (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

export default router;
