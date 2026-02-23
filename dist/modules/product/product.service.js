import { HttpError } from "../../shared/errors/HttpError.js";
import { ProductCategory } from "../product-category/product-category.model.js";
import { ProductRepository, } from "./product.repository.js";
export class ProductService {
    repo;
    constructor(repo = new ProductRepository()) {
        this.repo = repo;
    }
    maxLen = {
        code: 60,
        name: 150,
        description: 255,
        variantName: 120,
    };
    trimOrNull(value) {
        if (value == null)
            return null;
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
    }
    toNumber(value, fallback) {
        if (value == null || value === "")
            return fallback;
        const parsed = Number(value);
        if (Number.isNaN(parsed))
            throw new HttpError(400, "product.invalidNumber");
        return parsed;
    }
    normalizeVariant(variant, index) {
        return {
            name: this.trimOrNull(variant.name) ?? "",
            additionalPrice: this.toNumber(variant.additionalPrice, 0),
            sortOrder: variant.sortOrder == null ? index : this.toNumber(variant.sortOrder, index),
        };
    }
    normalize(data) {
        const variants = Array.isArray(data.variants) ? data.variants : [];
        return {
            productCategoryId: data.productCategoryId == null ? null : Number(data.productCategoryId),
            code: this.trimOrNull(data.code),
            name: this.trimOrNull(data.name) ?? "",
            description: this.trimOrNull(data.description),
            basePrice: this.toNumber(data.basePrice, 0),
            status: data.status == null ? 1 : this.toNumber(data.status, 1),
            variants: variants.map((item, index) => this.normalizeVariant(item, index)),
        };
    }
    validateId(id) {
        if (!Number.isInteger(id) || id <= 0)
            throw new HttpError(400, "product.invalidId");
    }
    validateCategoryId(productCategoryId) {
        if (productCategoryId == null)
            return;
        if (!Number.isInteger(productCategoryId) || productCategoryId <= 0) {
            throw new HttpError(400, "product.invalidCategoryId");
        }
    }
    validateStatus(status) {
        if (status !== 0 && status !== 1)
            throw new HttpError(400, "product.invalidStatus");
    }
    validateLen(name, value) {
        if (value != null && value.length > this.maxLen[name]) {
            throw new HttpError(400, "product.fieldTooLong");
        }
    }
    validateNonNegative(values) {
        if (values.some((value) => value < 0))
            throw new HttpError(400, "product.negativeValuesNotAllowed");
    }
    async validateCategoryExists(productCategoryId) {
        if (productCategoryId == null)
            return;
        const found = await ProductCategory.findByPk(productCategoryId);
        if (!found || found.status !== 1)
            throw new HttpError(404, "product.categoryNotFound");
    }
    validateVariants(variants) {
        if (!variants.length)
            throw new HttpError(400, "product.variantsRequired");
        const used = new Set();
        variants.forEach((variant) => {
            if (!variant.name)
                throw new HttpError(400, "product.variantNameRequired");
            this.validateLen("variantName", variant.name);
            const key = variant.name.toLowerCase();
            if (used.has(key))
                throw new HttpError(400, "product.variantDuplicated");
            used.add(key);
            this.validateNonNegative([variant.additionalPrice, variant.sortOrder]);
            if (!Number.isInteger(variant.sortOrder))
                throw new HttpError(400, "product.invalidSortOrder");
        });
    }
    toResponse(data) {
        return {
            id: data.id,
            productCategoryId: data.productCategoryId,
            code: data.code,
            name: data.name,
            description: data.description,
            basePrice: Number(data.basePrice),
            status: data.status,
            category: data.category
                ? {
                    id: data.category.id,
                    nameEs: data.category.nameEs,
                    nameEn: data.category.nameEn,
                }
                : null,
            variants: (data.variants ?? [])
                .filter((item) => item.status === 1)
                .map((item) => ({
                id: item.id,
                name: item.name,
                additionalPrice: Number(item.additionalPrice),
                sortOrder: item.sortOrder,
                status: item.status,
            })),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    }
    async create(data, changedByUserId) {
        const normalized = this.normalize(data);
        if (!normalized.name)
            throw new HttpError(400, "product.nameRequired");
        this.validateCategoryId(normalized.productCategoryId);
        this.validateStatus(normalized.status);
        this.validateLen("code", normalized.code);
        this.validateLen("name", normalized.name);
        this.validateLen("description", normalized.description);
        this.validateNonNegative([normalized.basePrice]);
        await this.validateCategoryExists(normalized.productCategoryId);
        this.validateVariants(normalized.variants);
        const duplicated = await this.repo.findDuplicated(normalized.name, normalized.code);
        if (duplicated)
            throw new HttpError(409, "product.duplicated");
        const created = await this.repo.create({
            productCategoryId: normalized.productCategoryId,
            code: normalized.code,
            name: normalized.name,
            description: normalized.description,
            basePrice: normalized.basePrice,
            status: normalized.status,
            variants: normalized.variants,
        });
        const full = await this.repo.findById(created.id);
        const snapshot = this.toResponse(full);
        await this.repo.createHistory({
            productId: created.id,
            changedByUserId,
            action: "create",
            changedFields: snapshot,
            snapshot,
        });
        return snapshot;
    }
    async findAll(search) {
        const rows = await this.repo.findAllActive(search);
        return rows.map((row) => this.toResponse(row));
    }
    async findById(id) {
        this.validateId(id);
        const found = await this.repo.findById(id);
        if (!found || found.status !== 1)
            throw new HttpError(404, "product.notFound");
        return this.toResponse(found);
    }
    async update(id, data, changedByUserId) {
        this.validateId(id);
        const found = await this.repo.findById(id);
        if (!found || found.status !== 1)
            throw new HttpError(404, "product.notFound");
        const existingVariants = (found.variants ?? []);
        const normalized = this.normalize({
            productCategoryId: data.productCategoryId ?? found.productCategoryId,
            code: data.code ?? found.code,
            name: data.name ?? found.name,
            description: data.description ?? found.description,
            basePrice: data.basePrice ?? Number(found.basePrice),
            status: data.status ?? found.status,
            variants: data.variants ??
                existingVariants.map((variant) => ({
                    name: variant.name,
                    additionalPrice: Number(variant.additionalPrice),
                    sortOrder: variant.sortOrder,
                })),
        });
        if (!normalized.name)
            throw new HttpError(400, "product.nameRequired");
        this.validateCategoryId(normalized.productCategoryId);
        this.validateStatus(normalized.status);
        this.validateLen("code", normalized.code);
        this.validateLen("name", normalized.name);
        this.validateLen("description", normalized.description);
        this.validateNonNegative([normalized.basePrice]);
        await this.validateCategoryExists(normalized.productCategoryId);
        this.validateVariants(normalized.variants);
        const duplicated = await this.repo.findDuplicated(normalized.name, normalized.code, id);
        if (duplicated)
            throw new HttpError(409, "product.duplicated");
        const before = this.toResponse(found);
        await this.repo.update(found, normalized);
        const updated = await this.repo.findById(id);
        const snapshot = this.toResponse(updated);
        const changedFields = {};
        Object.keys(snapshot).forEach((key) => {
            if (key === "createdAt" || key === "updatedAt")
                return;
            const beforeValue = before[key];
            const afterValue = snapshot[key];
            if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
                changedFields[key] = { before: beforeValue, after: afterValue };
            }
        });
        if (Object.keys(changedFields).length > 0) {
            await this.repo.createHistory({
                productId: id,
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
        if (!found || found.status !== 1)
            throw new HttpError(404, "product.notFound");
        await this.repo.update(found, { status: 0, variants: [] });
        const snapshot = this.toResponse(found);
        await this.repo.createHistory({
            productId: id,
            changedByUserId,
            action: "delete",
            changedFields: { status: { before: 1, after: 0 } },
            snapshot,
        });
        return { id, deleted: true };
    }
    async getHistory(id) {
        this.validateId(id);
        const found = await this.repo.findById(id);
        if (!found)
            throw new HttpError(404, "product.notFound");
        const history = await this.repo.findHistoryByProductId(id);
        return history.map((item) => ({
            id: item.id,
            productId: item.productId,
            changedByUserId: item.changedByUserId,
            action: item.action,
            changedFields: item.changedFields,
            snapshot: item.snapshot,
            createdAt: item.createdAt,
        }));
    }
}
