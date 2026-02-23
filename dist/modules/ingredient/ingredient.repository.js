import { Op } from "sequelize";
import { Ingredient } from "./ingredient.model.js";
import { IngredientHistory } from "./ingredient-history.model.js";
import { ProductCategory } from "../product-category/product-category.model.js";
import { ProductUnit } from "../product-unit/product-unit.model.js";
export class IngredientRepository {
    async create(data) {
        return Ingredient.create({
            productCategoryId: data.productCategoryId,
            productUnitId: data.productUnitId,
            code: data.code ?? null,
            name: data.name,
            minStock: data.minStock ?? 0,
            initialStock: data.initialStock ?? 0,
            currentStock: data.currentStock ?? 0,
            purchasePrice: data.purchasePrice ?? 0,
            status: data.status ?? 1,
        });
    }
    async findAllActive(search) {
        const where = { status: 1 };
        if (search?.trim()) {
            const q = `%${search.trim()}%`;
            where[Op.or] = [{ name: { [Op.like]: q } }, { code: { [Op.like]: q } }];
        }
        return Ingredient.findAll({
            where,
            include: [
                {
                    model: ProductCategory,
                    as: "category",
                    attributes: ["id", "nameEs", "nameEn", "status"],
                    required: false,
                },
                {
                    model: ProductUnit,
                    as: "unit",
                    attributes: ["id", "name", "shortName", "status"],
                    required: false,
                },
            ],
            order: [
                ["id", "DESC"],
            ],
        });
    }
    async findById(id) {
        return Ingredient.findByPk(id, {
            include: [
                {
                    model: ProductCategory,
                    as: "category",
                    attributes: ["id", "nameEs", "nameEn", "status"],
                    required: false,
                },
                {
                    model: ProductUnit,
                    as: "unit",
                    attributes: ["id", "name", "shortName", "status"],
                    required: false,
                },
            ],
        });
    }
    async findByCodeOrName(name, code, excludeId) {
        const where = {
            status: 1,
            ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
            [Op.or]: [{ name: name }],
        };
        if (code) {
            where[Op.or].push({ code });
        }
        return Ingredient.findOne({ where });
    }
    async update(instance, data) {
        return instance.update(data);
    }
    async createHistory(data) {
        return IngredientHistory.create({
            ingredientId: data.ingredientId,
            changedByUserId: data.changedByUserId,
            action: data.action,
            changedFields: data.changedFields,
            snapshot: data.snapshot,
        });
    }
    async findHistoryByIngredientId(ingredientId) {
        return IngredientHistory.findAll({
            where: { ingredientId },
            order: [["createdAt", "DESC"]],
        });
    }
}
