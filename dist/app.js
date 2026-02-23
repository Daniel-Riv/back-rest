import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { menuRoutes } from "./modules/menu/menu.routes.js";
import { tableRoutes } from "./modules/table/table.routes.js";
import { businessInfoRoutes } from "./modules/business-info/business-info.routes.js";
import { productCategoryRoutes } from "./modules/product-category/product-category.routes.js";
import { productUnitRoutes } from "./modules/product-unit/product-unit.routes.js";
import { ingredientRoutes } from "./modules/ingredient/ingredient.routes.js";
import { supplierRoutes } from "./modules/supplier/supplier.routes.js";
import { productRoutes } from "./modules/product/product.routes.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";
export function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use("/api/auth", authRoutes);
    app.use("/api/menus", menuRoutes);
    app.use("/api/tables", tableRoutes);
    app.use("/api/business-info", businessInfoRoutes);
    app.use("/api/product-categories", productCategoryRoutes);
    app.use("/api/product-units", productUnitRoutes);
    app.use("/api/ingredients", ingredientRoutes);
    app.use("/api/suppliers", supplierRoutes);
    app.use("/api/products", productRoutes);
    app.use(errorHandler);
    return app;
}
