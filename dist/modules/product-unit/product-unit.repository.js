import { ProductUnit } from "./product-unit.model.js";
import { ProductUnitHistory } from "./product-unit-history.model.js";
import { Op } from "sequelize";
export class ProductUnitRepository {
    async create(data) {
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
    async findById(id) {
        return ProductUnit.findByPk(id);
    }
    async findByNameOrShortName(name, shortName, excludeId) {
        const where = {
            status: 1,
            ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
        };
        const rows = await ProductUnit.findAll({ where });
        const normalizedName = name.toLowerCase();
        const normalizedShort = shortName.toLowerCase();
        return rows.find((row) => row.name.toLowerCase() === normalizedName ||
            row.shortName.toLowerCase() === normalizedShort);
    }
    async update(unit, data) {
        return unit.update(data);
    }
    async createHistory(data) {
        return ProductUnitHistory.create({
            productUnitId: data.productUnitId,
            changedByUserId: data.changedByUserId,
            action: data.action,
            changedFields: data.changedFields,
            snapshot: data.snapshot,
        });
    }
    async findHistoryByUnitId(productUnitId) {
        return ProductUnitHistory.findAll({
            where: { productUnitId },
            order: [["createdAt", "DESC"]],
        });
    }
}
