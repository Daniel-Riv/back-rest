import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { menuRoutes } from "./modules/menu/menu.routes.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/menus", menuRoutes);
  app.use(errorHandler);
  return app;
}
