import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { ProductUnitController } from "./product-unit.controller.js";

export const productUnitRoutes = Router();
const controller = new ProductUnitController();

productUnitRoutes.get("/", authMiddleware, controller.list);
productUnitRoutes.post("/", authMiddleware, controller.create);
productUnitRoutes.get("/:id/history", authMiddleware, controller.getHistory);
productUnitRoutes.get("/:id", authMiddleware, controller.getById);
productUnitRoutes.put("/:id", authMiddleware, controller.update);
productUnitRoutes.delete("/:id", authMiddleware, controller.remove);
