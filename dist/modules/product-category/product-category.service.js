import { HttpError } from "../../shared/errors/HttpError.js";
import { ProductCategoryRepository, } from "./product-category.repository.js";
const HEX_COLOR_REGEX = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
export class ProductCategoryService {
    repo;
    constructor(repo = new ProductCategoryRepository()) {
        this.repo = repo;
    }
    maxLen = {
        nameEs: 120,
        nameEn: 120,
        description: 255,
        icon: 50,
        color: 20,
    };
    trimOrNull(value) {
        if (value == null)
            return null;
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
    }
    normalize(data) {
        return {
            nameEs: this.trimOrNull(data.nameEs) ?? "",
            nameEn: this.trimOrNull(data.nameEn),
            description: this.trimOrNull(data.description),
            icon: this.trimOrNull(data.icon),
            color: this.trimOrNull(data.color),
            sortOrder: data.sortOrder,
        };
    }
    validateSortOrder(sortOrder) {
        if (sortOrder == null)
            return;
        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            throw new HttpError(400, "productCategory.invalidSortOrder");
        }
    }
    validateLengths(data) {
        Object.keys(this.maxLen).forEach((key) => {
            const value = data[key];
            if (value != null && value.length > this.maxLen[key]) {
                throw new HttpError(400, "productCategory.fieldTooLong");
            }
        });
    }
    validateColor(color) {
        if (!color)
            return;
        if (!HEX_COLOR_REGEX.test(color)) {
            throw new HttpError(400, "productCategory.invalidColor");
        }
    }
    validateId(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new HttpError(400, "productCategory.invalidId");
        }
    }
    toResponse(data) {
        return {
            id: data.id,
            nameEs: data.nameEs,
            nameEn: data.nameEn,
            description: data.description,
            icon: data.icon,
            color: data.color,
            sortOrder: data.sortOrder,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    }
    async create(data, changedByUserId) {
        const normalized = this.normalize(data);
        if (!normalized.nameEs) {
            throw new HttpError(400, "productCategory.nameEsRequired");
        }
        this.validateSortOrder(normalized.sortOrder);
        this.validateLengths(normalized);
        this.validateColor(normalized.color);
        const created = await this.repo.create({
            nameEs: normalized.nameEs,
            nameEn: normalized.nameEn,
            description: normalized.description,
            icon: normalized.icon,
            color: normalized.color,
            sortOrder: normalized.sortOrder ?? 0,
        });
        const snapshot = this.toResponse(created);
        await this.repo.createHistory({
            productCategoryId: created.id,
            changedByUserId,
            action: "create",
            changedFields: snapshot,
            snapshot,
        });
        return snapshot;
    }
    async findAll() {
        const rows = await this.repo.findAllActive();
        return rows.map((row) => this.toResponse(row));
    }
    async findById(id) {
        this.validateId(id);
        const found = await this.repo.findById(id);
        if (!found || found.status !== 1) {
            throw new HttpError(404, "productCategory.notFound");
        }
        return this.toResponse(found);
    }
    async update(id, data, changedByUserId) {
        this.validateId(id);
        const found = await this.repo.findById(id);
        if (!found || found.status !== 1) {
            throw new HttpError(404, "productCategory.notFound");
        }
        const normalized = this.normalize(data);
        this.validateSortOrder(normalized.sortOrder);
        this.validateLengths(normalized);
        this.validateColor(normalized.color);
        if (data.nameEs != null && !normalized.nameEs) {
            throw new HttpError(400, "productCategory.nameEsRequired");
        }
        const base = this.toResponse(found);
        const updateData = {};
        if (data.nameEs != null)
            updateData.nameEs = normalized.nameEs;
        if (data.nameEn != null)
            updateData.nameEn = normalized.nameEn;
        if (data.description != null)
            updateData.description = normalized.description;
        if (data.icon != null)
            updateData.icon = normalized.icon;
        if (data.color != null)
            updateData.color = normalized.color;
        if (data.sortOrder != null)
            updateData.sortOrder = normalized.sortOrder;
        await this.repo.update(found, updateData);
        const snapshot = this.toResponse(found);
        const changedFields = {};
        Object.keys(snapshot).forEach((key) => {
            if (key === "createdAt" || key === "updatedAt")
                return;
            const before = base[key];
            const after = snapshot[key];
            if (before !== after) {
                changedFields[key] = { before, after };
            }
        });
        if (Object.keys(changedFields).length > 0) {
            await this.repo.createHistory({
                productCategoryId: found.id,
                changedByUserId,
                action: "update",
                changedFields,
                snapshot,
            });
        }
        return snapshot;
    }
    async remove(id, changedByUserId) {
        this.validateId(id);
        const found = await this.repo.findById(id);
        if (!found || found.status !== 1) {
            throw new HttpError(404, "productCategory.notFound");
        }
        await this.repo.update(found, { status: 0 });
        const snapshot = this.toResponse(found);
        await this.repo.createHistory({
            productCategoryId: found.id,
            changedByUserId,
            action: "delete",
            changedFields: { status: { before: 1, after: 0 } },
            snapshot,
        });
        return { id: found.id, deleted: true };
    }
    async getHistory(id) {
        this.validateId(id);
        const found = await this.repo.findById(id);
        if (!found) {
            throw new HttpError(404, "productCategory.notFound");
        }
        const history = await this.repo.findHistoryByCategoryId(id);
        return history.map((item) => ({
            id: item.id,
            productCategoryId: item.productCategoryId,
            changedByUserId: item.changedByUserId,
            action: item.action,
            changedFields: item.changedFields,
            snapshot: item.snapshot,
            createdAt: item.createdAt,
        }));
    }
}
