import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { ProductCategoryController } from "./product-category.controller.js";

export const productCategoryRoutes = Router();
const controller = new ProductCategoryController();

productCategoryRoutes.get("/", authMiddleware, controller.list);
productCategoryRoutes.post("/", authMiddleware, controller.create);
productCategoryRoutes.get("/:id/history", authMiddleware, controller.getHistory);
productCategoryRoutes.get("/:id", authMiddleware, controller.getById);
productCategoryRoutes.put("/:id", authMiddleware, controller.update);
productCategoryRoutes.delete("/:id", authMiddleware, controller.remove);
