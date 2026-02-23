import { ProductCategory } from "./product-category.model.js";
import { ProductCategoryHistory } from "./product-category-history.model.js";

export type ProductCategoryPayload = {
  nameEs: string;
  nameEn?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number;
};

export class ProductCategoryRepository {
  async create(data: ProductCategoryPayload) {
    return ProductCategory.create({
      nameEs: data.nameEs,
      nameEn: data.nameEn ?? null,
      description: data.description ?? null,
      icon: data.icon ?? null,
      color: data.color ?? null,
      sortOrder: data.sortOrder ?? 0,
      status: 1,
    });
  }

  async findAllActive() {
    return ProductCategory.findAll({
      where: { status: 1 },
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  async findById(id: number) {
    return ProductCategory.findByPk(id);
  }

  async update(instance: ProductCategory, data: Partial<ProductCategoryPayload> & { status?: number }) {
    return instance.update(data);
  }

  async createHistory(data: {
    productCategoryId: number;
    changedByUserId: number | null;
    action: "create" | "update" | "delete";
    changedFields: object;
    snapshot: object;
  }) {
    return ProductCategoryHistory.create({
      productCategoryId: data.productCategoryId,
      changedByUserId: data.changedByUserId,
      action: data.action,
      changedFields: data.changedFields,
      snapshot: data.snapshot,
    });
  }

  async findHistoryByCategoryId(productCategoryId: number) {
    return ProductCategoryHistory.findAll({
      where: { productCategoryId },
      order: [["createdAt", "DESC"]],
    });
  }
}
