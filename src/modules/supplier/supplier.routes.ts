import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { SupplierController } from "./supplier.controller.js";

export const supplierRoutes = Router();
const controller = new SupplierController();

supplierRoutes.get("/", authMiddleware, controller.list);
supplierRoutes.post("/", authMiddleware, controller.create);
supplierRoutes.get("/:id/history", authMiddleware, controller.getHistory);
supplierRoutes.get("/:id", authMiddleware, controller.getById);
supplierRoutes.put("/:id", authMiddleware, controller.update);
supplierRoutes.delete("/:id", authMiddleware, controller.remove);
