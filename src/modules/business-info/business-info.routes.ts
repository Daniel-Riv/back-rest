import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { BusinessInfoController } from "./business-info.controller.js";

export const businessInfoRoutes = Router();
const controller = new BusinessInfoController();

businessInfoRoutes.get("/current", authMiddleware, controller.getCurrent);
businessInfoRoutes.post("/", authMiddleware, controller.create);
businessInfoRoutes.put("/:id", authMiddleware, controller.update);
businessInfoRoutes.get("/:id/history", authMiddleware, controller.getHistory);
