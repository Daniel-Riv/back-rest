import { ProductCategory } from "./product-category.model.js";
import { ProductCategoryHistory } from "./product-category-history.model.js";
export class ProductCategoryRepository {
    async create(data) {
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
    async findById(id) {
        return ProductCategory.findByPk(id);
    }
    async update(instance, data) {
        return instance.update(data);
    }
    async createHistory(data) {
        return ProductCategoryHistory.create({
            productCategoryId: data.productCategoryId,
            changedByUserId: data.changedByUserId,
            action: data.action,
            changedFields: data.changedFields,
            snapshot: data.snapshot,
        });
    }
    async findHistoryByCategoryId(productCategoryId) {
        return ProductCategoryHistory.findAll({
            where: { productCategoryId },
            order: [["createdAt", "DESC"]],
        });
    }
}
