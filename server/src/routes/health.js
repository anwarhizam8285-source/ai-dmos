import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0-alpha",
    environment: process.env.NODE_ENV || "development",
    checks: {
      server: "running",
      uptime: process.uptime(),
    },
  });
});

export default router;
