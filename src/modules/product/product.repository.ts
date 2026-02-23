import { Op, Transaction } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
import { Product } from "./product.model.js";
import { ProductVariant } from "./product-variant.model.js";
import { ProductHistory } from "./product-history.model.js";
import { ProductCategory } from "../product-category/product-category.model.js";

export type ProductVariantPayload = {
  name: string;
  additionalPrice?: number;
  sortOrder?: number;
};

export type ProductPayload = {
  productCategoryId?: number | null;
  code?: string | null;
  name: string;
  description?: string | null;
  basePrice?: number;
  status?: number;
  variants: ProductVariantPayload[];
};

export class ProductRepository {
  async create(data: ProductPayload) {
    return sequelize.transaction(async (transaction) => {
      const product = await Product.create(
        {
          productCategoryId: data.productCategoryId ?? null,
          code: data.code ?? null,
          name: data.name,
          description: data.description ?? null,
          basePrice: data.basePrice ?? 0,
          status: data.status ?? 1,
        },
        { transaction }
      );

      await ProductVariant.bulkCreate(
        data.variants.map((item, index) => ({
          productId: product.id,
          name: item.name,
          additionalPrice: item.additionalPrice ?? 0,
          sortOrder: item.sortOrder ?? index,
          status: 1,
        })),
        { transaction }
      );

      return product;
    });
  }

  async findAllActive(search?: string) {
    const where: any = { status: 1 };
    if (search?.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [{ name: { [Op.like]: q } }, { code: { [Op.like]: q } }];
    }
    return Product.findAll({
      where,
      include: [
        {
          model: ProductCategory,
          as: "category",
          attributes: ["id", "nameEs", "nameEn", "status"],
          required: false,
        },
        {
          model: ProductVariant,
          as: "variants",
          where: { status: 1 },
          required: false,
        },
      ],
      order: [
        ["id", "DESC"],
        [{ model: ProductVariant, as: "variants" }, "sortOrder", "ASC"],
        [{ model: ProductVariant, as: "variants" }, "id", "ASC"],
      ],
    });
  }

  async findById(id: number) {
    return Product.findByPk(id, {
      include: [
        {
          model: ProductCategory,
          as: "category",
          attributes: ["id", "nameEs", "nameEn", "status"],
          required: false,
        },
        {
          model: ProductVariant,
          as: "variants",
          where: { status: 1 },
          required: false,
        },
      ],
      order: [[{ model: ProductVariant, as: "variants" }, "sortOrder", "ASC"]],
    });
  }

  async findDuplicated(name: string, code: string | null, excludeId?: number) {
    const conditions: any[] = [{ name }];
    if (code) conditions.push({ code });
    const where: any = {
      status: 1,
      [Op.or]: conditions,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    };
    return Product.findOne({ where });
  }

  async update(product: Product, data: Partial<ProductPayload>) {
    return sequelize.transaction(async (transaction) => {
      await product.update(
        {
          productCategoryId: data.productCategoryId,
          code: data.code,
          name: data.name,
          description: data.description,
          basePrice: data.basePrice,
          status: data.status,
        },
        { transaction }
      );

      if (data.variants) {
        await ProductVariant.update(
          { status: 0 },
          { where: { productId: product.id, status: 1 }, transaction }
        );
        await ProductVariant.bulkCreate(
          data.variants.map((item, index) => ({
            productId: product.id,
            name: item.name,
            additionalPrice: item.additionalPrice ?? 0,
            sortOrder: item.sortOrder ?? index,
            status: 1,
          })),
          { transaction }
        );
      }
    });
  }

  async createHistory(
    data: {
      productId: number;
      changedByUserId: number | null;
      action: "create" | "update" | "delete";
      changedFields: object;
      snapshot: object;
    },
    transaction?: Transaction
  ) {
    return ProductHistory.create(
      {
        productId: data.productId,
        changedByUserId: data.changedByUserId,
        action: data.action,
        changedFields: data.changedFields,
        snapshot: data.snapshot,
      },
      { transaction }
    );
  }

  async findHistoryByProductId(productId: number) {
    return ProductHistory.findAll({
      where: { productId },
      order: [["createdAt", "DESC"]],
    });
  }
}
