import { HttpError } from "../../shared/errors/HttpError.js";
import {
  IngredientRepository,
  type IngredientPayload,
} from "./ingredient.repository.js";
import { ProductCategory } from "../product-category/product-category.model.js";
import { ProductUnit } from "../product-unit/product-unit.model.js";

export class IngredientService {
  constructor(private readonly repo = new IngredientRepository()) {}

  private readonly maxLen = {
    code: 50,
    name: 120,
  };

  private trimOrNull(value: string | null | undefined) {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  private toNumber(value: unknown, defaultValue: number) {
    if (value == null || value === "") return defaultValue;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new HttpError(400, "ingredient.invalidNumber");
    }
    return parsed;
  }

  private normalize(data: Partial<IngredientPayload>) {
    return {
      productCategoryId: Number(data.productCategoryId),
      productUnitId: Number(data.productUnitId),
      code: this.trimOrNull(data.code),
      name: this.trimOrNull(data.name) ?? "",
      minStock: this.toNumber(data.minStock, 0),
      initialStock: this.toNumber(data.initialStock, 0),
      currentStock: data.currentStock == null ? undefined : this.toNumber(data.currentStock, 0),
      purchasePrice: this.toNumber(data.purchasePrice, 0),
      status: data.status == null ? 1 : this.toNumber(data.status, 1),
    };
  }

  private validateId(id: number, key = "ingredient.invalidId") {
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, key);
    }
  }

  private validateLengths(data: ReturnType<IngredientService["normalize"]>) {
    (Object.keys(this.maxLen) as Array<keyof typeof this.maxLen>).forEach((key) => {
      const value = data[key];
      if (value != null && value.length > this.maxLen[key]) {
        throw new HttpError(400, "ingredient.fieldTooLong");
      }
    });
  }

  private validateAmounts(data: ReturnType<IngredientService["normalize"]>) {
    const values = [
      data.minStock,
      data.initialStock,
      data.currentStock ?? data.initialStock,
      data.purchasePrice,
    ];
    if (values.some((value) => value < 0)) {
      throw new HttpError(400, "ingredient.negativeValuesNotAllowed");
    }
  }

  private validateStatus(status: number) {
    if (status !== 0 && status !== 1) {
      throw new HttpError(400, "ingredient.invalidStatus");
    }
  }

  private async validateRefs(productCategoryId: number, productUnitId: number) {
    this.validateId(productCategoryId, "ingredient.invalidCategoryId");
    this.validateId(productUnitId, "ingredient.invalidUnitId");

    const category = await ProductCategory.findByPk(productCategoryId);
    if (!category || category.status !== 1) {
      throw new HttpError(404, "ingredient.categoryNotFound");
    }

    const unit = await ProductUnit.findByPk(productUnitId);
    if (!unit || unit.status !== 1) {
      throw new HttpError(404, "ingredient.unitNotFound");
    }
  }

  private toResponse(data: any) {
    return {
      id: data.id,
      productCategoryId: data.productCategoryId,
      productUnitId: data.productUnitId,
      code: data.code,
      name: data.name,
      minStock: Number(data.minStock),
      initialStock: Number(data.initialStock),
      currentStock: Number(data.currentStock),
      purchasePrice: Number(data.purchasePrice),
      status: data.status,
      category: data.category
        ? {
            id: data.category.id,
            nameEs: data.category.nameEs,
            nameEn: data.category.nameEn,
          }
        : null,
      unit: data.unit
        ? {
            id: data.unit.id,
            name: data.unit.name,
            shortName: data.unit.shortName,
          }
        : null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async create(data: Partial<IngredientPayload>, changedByUserId: number | null) {
    const normalized = this.normalize(data);
    if (!normalized.name) {
      throw new HttpError(400, "ingredient.nameRequired");
    }

    this.validateLengths(normalized);
    this.validateAmounts(normalized);
    this.validateStatus(normalized.status);
    await this.validateRefs(normalized.productCategoryId, normalized.productUnitId);

    const duplicated = await this.repo.findByCodeOrName(normalized.name, normalized.code);
    if (duplicated) {
      throw new HttpError(409, "ingredient.duplicated");
    }

    const created = await this.repo.create({
      productCategoryId: normalized.productCategoryId,
      productUnitId: normalized.productUnitId,
      code: normalized.code,
      name: normalized.name,
      minStock: normalized.minStock,
      initialStock: normalized.initialStock,
      currentStock: normalized.currentStock ?? normalized.initialStock,
      purchasePrice: normalized.purchasePrice,
      status: normalized.status,
    });

    const complete = await this.repo.findById(created.id);
    const snapshot = this.toResponse(complete);
    await this.repo.createHistory({
      ingredientId: created.id,
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
    if (!found || found.status !== 1) {
      throw new HttpError(404, "ingredient.notFound");
    }
    return this.toResponse(found);
  }

  async update(id: number, data: Partial<IngredientPayload>, changedByUserId: number | null) {
    this.validateId(id);
    const found = await this.repo.findById(id);
    if (!found || found.status !== 1) {
      throw new HttpError(404, "ingredient.notFound");
    }

    const normalized = this.normalize({
      productCategoryId: data.productCategoryId ?? found.productCategoryId,
      productUnitId: data.productUnitId ?? found.productUnitId,
      code: data.code ?? found.code,
      name: data.name ?? found.name,
      minStock: data.minStock ?? Number(found.minStock),
      initialStock: data.initialStock ?? Number(found.initialStock),
      currentStock: data.currentStock ?? Number(found.currentStock),
      purchasePrice: data.purchasePrice ?? Number(found.purchasePrice),
      status: (data as any).status ?? found.status,
    });

    if (!normalized.name) {
      throw new HttpError(400, "ingredient.nameRequired");
    }
    this.validateLengths(normalized);
    this.validateAmounts(normalized);
    this.validateStatus(normalized.status);
    await this.validateRefs(normalized.productCategoryId, normalized.productUnitId);

    const duplicated = await this.repo.findByCodeOrName(normalized.name, normalized.code, id);
    if (duplicated) {
      throw new HttpError(409, "ingredient.duplicated");
    }

    const before = this.toResponse(found);
    await this.repo.update(found, {
      productCategoryId: normalized.productCategoryId,
      productUnitId: normalized.productUnitId,
      code: normalized.code,
      name: normalized.name,
      minStock: normalized.minStock,
      initialStock: normalized.initialStock,
      currentStock: normalized.currentStock ?? normalized.initialStock,
      purchasePrice: normalized.purchasePrice,
      status: normalized.status,
    });

    const complete = await this.repo.findById(id);
    const snapshot = this.toResponse(complete);
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
        ingredientId: id,
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
    if (!found || found.status !== 1) {
      throw new HttpError(404, "ingredient.notFound");
    }

    await this.repo.update(found, { status: 0 });
    const snapshot = this.toResponse(found);
    await this.repo.createHistory({
      ingredientId: id,
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
    if (!found) {
      throw new HttpError(404, "ingredient.notFound");
    }
    const history = await this.repo.findHistoryByIngredientId(id);
    return history.map((item) => ({
      id: item.id,
      ingredientId: item.ingredientId,
      changedByUserId: item.changedByUserId,
      action: item.action,
      changedFields: item.changedFields,
      snapshot: item.snapshot,
      createdAt: item.createdAt,
    }));
  }
}
