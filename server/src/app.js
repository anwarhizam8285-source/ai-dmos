import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import generateRoutes from "./routes/generate.js";
import companyRoutes from "./routes/company.js";
import knowledgeRoutes from "./routes/knowledge.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/generate", generateRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/knowledge", knowledgeRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
