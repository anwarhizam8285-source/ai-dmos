import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
