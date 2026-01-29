import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use(errorHandler);
  return app;
}
