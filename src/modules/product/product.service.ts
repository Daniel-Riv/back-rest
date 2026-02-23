import { HttpError } from "../../shared/errors/HttpError.js";
import { ProductCategory } from "../product-category/product-category.model.js";
import {
  ProductRepository,
  type ProductPayload,
  type ProductVariantPayload,
} from "./product.repository.js";

export class ProductService {
  constructor(private readonly repo = new ProductRepository()) {}

  private readonly maxLen = {
    code: 60,
    name: 150,
    description: 255,
    variantName: 120,
  };

  private trimOrNull(value: string | null | undefined) {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  private toNumber(value: unknown, fallback: number) {
    if (value == null || value === "") return fallback;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) throw new HttpError(400, "product.invalidNumber");
    return parsed;
  }

  private normalizeVariant(variant: Partial<ProductVariantPayload>, index: number) {
    return {
      name: this.trimOrNull(variant.name) ?? "",
      additionalPrice: this.toNumber(variant.additionalPrice, 0),
      sortOrder: variant.sortOrder == null ? index : this.toNumber(variant.sortOrder, index),
    };
  }

  private normalize(data: Partial<ProductPayload>) {
    const variants = Array.isArray(data.variants) ? data.variants : [];
    return {
      productCategoryId:
        data.productCategoryId == null ? null : Number(data.productCategoryId),
      code: this.trimOrNull(data.code),
      name: this.trimOrNull(data.name) ?? "",
      description: this.trimOrNull(data.description),
      basePrice: this.toNumber(data.basePrice, 0),
      status: data.status == null ? 1 : this.toNumber(data.status, 1),
      variants: variants.map((item, index) => this.normalizeVariant(item, index)),
    };
  }

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "product.invalidId");
  }

  private validateCategoryId(productCategoryId: number | null) {
    if (productCategoryId == null) return;
    if (!Number.isInteger(productCategoryId) || productCategoryId <= 0) {
      throw new HttpError(400, "product.invalidCategoryId");
    }
  }

  private validateStatus(status: number) {
    if (status !== 0 && status !== 1) throw new HttpError(400, "product.invalidStatus");
  }

  private validateLen(name: keyof ProductService["maxLen"], value: string | null) {
    if (value != null && value.length > this.maxLen[name]) {
      throw new HttpError(400, "product.fieldTooLong");
    }
  }

  private validateNonNegative(values: number[]) {
    if (values.some((value) => value < 0)) throw new HttpError(400, "product.negativeValuesNotAllowed");
  }

  private async validateCategoryExists(productCategoryId: number | null) {
    if (productCategoryId == null) return;
    const found = await ProductCategory.findByPk(productCategoryId);
    if (!found || found.status !== 1) throw new HttpError(404, "product.categoryNotFound");
  }

  private validateVariants(variants: Array<{ name: string; additionalPrice: number; sortOrder: number }>) {
    if (!variants.length) throw new HttpError(400, "product.variantsRequired");
    const used = new Set<string>();
    variants.forEach((variant) => {
      if (!variant.name) throw new HttpError(400, "product.variantNameRequired");
      this.validateLen("variantName", variant.name);
      const key = variant.name.toLowerCase();
      if (used.has(key)) throw new HttpError(400, "product.variantDuplicated");
      used.add(key);
      this.validateNonNegative([variant.additionalPrice, variant.sortOrder]);
      if (!Number.isInteger(variant.sortOrder)) throw new HttpError(400, "product.invalidSortOrder");
    });
  }

  private toResponse(data: any) {
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
        .filter((item: any) => item.status === 1)
        .map((item: any) => ({
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

  async create(data: Partial<ProductPayload>, changedByUserId: number | null) {
    const normalized = this.normalize(data);
    if (!normalized.name) throw new HttpError(400, "product.nameRequired");
    this.validateCategoryId(normalized.productCategoryId);
    this.validateStatus(normalized.status);
    this.validateLen("code", normalized.code);
    this.validateLen("name", normalized.name);
    this.validateLen("description", normalized.description);
    this.validateNonNegative([normalized.basePrice]);
    await this.validateCategoryExists(normalized.productCategoryId);
    this.validateVariants(normalized.variants);

    const duplicated = await this.repo.findDuplicated(normalized.name, normalized.code);
    if (duplicated) throw new HttpError(409, "product.duplicated");

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

  async findAll(search?: string) {
    const rows = await this.repo.findAllActive(search);
    return rows.map((row) => this.toResponse(row));
  }

  async findById(id: number) {
    this.validateId(id);
    const found = await this.repo.findById(id);
    if (!found || found.status !== 1) throw new HttpError(404, "product.notFound");
    return this.toResponse(found);
  }

  async update(id: number, data: Partial<ProductPayload>, changedByUserId: number | null) {
    this.validateId(id);
    const found = await this.repo.findById(id);
    if (!found || found.status !== 1) throw new HttpError(404, "product.notFound");

    const existingVariants = ((found as any).variants ?? []) as Array<{
      name: string;
      additionalPrice: number | string;
      sortOrder: number;
    }>;

    const normalized = this.normalize({
      productCategoryId: data.productCategoryId ?? found.productCategoryId,
      code: data.code ?? found.code,
      name: data.name ?? found.name,
      description: data.description ?? found.description,
      basePrice: data.basePrice ?? Number(found.basePrice),
      status: data.status ?? found.status,
      variants:
        data.variants ??
        existingVariants.map((variant) => ({
          name: variant.name,
          additionalPrice: Number(variant.additionalPrice),
          sortOrder: variant.sortOrder,
        })),
    });

    if (!normalized.name) throw new HttpError(400, "product.nameRequired");
    this.validateCategoryId(normalized.productCategoryId);
    this.validateStatus(normalized.status);
    this.validateLen("code", normalized.code);
    this.validateLen("name", normalized.name);
    this.validateLen("description", normalized.description);
    this.validateNonNegative([normalized.basePrice]);
    await this.validateCategoryExists(normalized.productCategoryId);
    this.validateVariants(normalized.variants);

    const duplicated = await this.repo.findDuplicated(normalized.name, normalized.code, id);
    if (duplicated) throw new HttpError(409, "product.duplicated");

    const before = this.toResponse(found);
    await this.repo.update(found, normalized);
    const updated = await this.repo.findById(id);
    const snapshot = this.toResponse(updated);
    const changedFields: Record<string, { before: unknown; after: unknown }> = {};
    (Object.keys(snapshot) as Array<keyof typeof snapshot>).forEach((key) => {
      if (key === "createdAt" || key === "updatedAt") return;
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

  async remove(id: number, changedByUserId: number | null) {
    this.validateId(id);
    const found = await this.repo.findById(id);
    if (!found || found.status !== 1) throw new HttpError(404, "product.notFound");
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

  async getHistory(id: number) {
    this.validateId(id);
    const found = await this.repo.findById(id);
    if (!found) throw new HttpError(404, "product.notFound");
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
