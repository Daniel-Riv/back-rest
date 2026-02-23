import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { MenuController } from "./menu.controller.js";
export const menuRoutes = Router();
const controller = new MenuController();
menuRoutes.post("/", authMiddleware, controller.create);
menuRoutes.put("/role/:roleId", authMiddleware, controller.assignMenusToRole);
menuRoutes.get("/role/:roleId", authMiddleware, controller.getMenusByRole);
