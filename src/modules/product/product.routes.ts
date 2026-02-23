import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { ProductController } from "./product.controller.js";

export const productRoutes = Router();
const controller = new ProductController();

productRoutes.get("/", authMiddleware, controller.list);
productRoutes.post("/", authMiddleware, controller.create);
productRoutes.get("/:id/history", authMiddleware, controller.getHistory);
productRoutes.get("/:id", authMiddleware, controller.getById);
productRoutes.put("/:id", authMiddleware, controller.update);
productRoutes.delete("/:id", authMiddleware, controller.remove);
