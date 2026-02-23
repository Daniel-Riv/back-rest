import { ProductUnit } from "./product-unit.model.js";
import { ProductUnitHistory } from "./product-unit-history.model.js";
import { Op } from "sequelize";

export type ProductUnitPayload = {
  name: string;
  shortName: string;
  description?: string | null;
  sortOrder?: number;
};

export class ProductUnitRepository {
  async create(data: ProductUnitPayload) {
    return ProductUnit.create({
      name: data.name,
      shortName: data.shortName,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
      status: 1,
    });
  }

  async findAllActive() {
    return ProductUnit.findAll({
      where: { status: 1 },
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  async findById(id: number) {
    return ProductUnit.findByPk(id);
  }

  async findByNameOrShortName(name: string, shortName: string, excludeId?: number) {
    const where: any = {
      status: 1,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    };
    const rows = await ProductUnit.findAll({ where });
    const normalizedName = name.toLowerCase();
    const normalizedShort = shortName.toLowerCase();
    return rows.find(
      (row) =>
        row.name.toLowerCase() === normalizedName ||
        row.shortName.toLowerCase() === normalizedShort
    );
  }

  async update(unit: ProductUnit, data: Partial<ProductUnitPayload> & { status?: number }) {
    return unit.update(data);
  }

  async createHistory(data: {
    productUnitId: number;
    changedByUserId: number | null;
    action: "create" | "update" | "delete";
    changedFields: object;
    snapshot: object;
  }) {
    return ProductUnitHistory.create({
      productUnitId: data.productUnitId,
      changedByUserId: data.changedByUserId,
      action: data.action,
      changedFields: data.changedFields,
      snapshot: data.snapshot,
    });
  }

  async findHistoryByUnitId(productUnitId: number) {
    return ProductUnitHistory.findAll({
      where: { productUnitId },
      order: [["createdAt", "DESC"]],
    });
  }
}
