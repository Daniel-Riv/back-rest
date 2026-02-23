import { Op } from "sequelize";
import { Ingredient } from "./ingredient.model.js";
import { IngredientHistory } from "./ingredient-history.model.js";
import { ProductCategory } from "../product-category/product-category.model.js";
import { ProductUnit } from "../product-unit/product-unit.model.js";

export type IngredientPayload = {
  productCategoryId: number;
  productUnitId: number;
  code?: string | null;
  name: string;
  minStock?: number;
  initialStock?: number;
  currentStock?: number;
  purchasePrice?: number;
  status?: number;
};

export class IngredientRepository {
  async create(data: IngredientPayload) {
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

  async findAllActive(search?: string) {
    const where: any = { status: 1 };
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

  async findById(id: number) {
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

  async findByCodeOrName(name: string, code: string | null, excludeId?: number) {
    const where: any = {
      status: 1,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      [Op.or]: [{ name: name }],
    };
    if (code) {
      where[Op.or].push({ code });
    }
    return Ingredient.findOne({ where });
  }

  async update(instance: Ingredient, data: Partial<IngredientPayload> & { status?: number }) {
    return instance.update(data);
  }

  async createHistory(data: {
    ingredientId: number;
    changedByUserId: number | null;
    action: "create" | "update" | "delete";
    changedFields: object;
    snapshot: object;
  }) {
    return IngredientHistory.create({
      ingredientId: data.ingredientId,
      changedByUserId: data.changedByUserId,
      action: data.action,
      changedFields: data.changedFields,
      snapshot: data.snapshot,
    });
  }

  async findHistoryByIngredientId(ingredientId: number) {
    return IngredientHistory.findAll({
      where: { ingredientId },
      order: [["createdAt", "DESC"]],
    });
  }
}
