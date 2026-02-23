import { HttpError } from "../../shared/errors/HttpError.js";
import {
  ProductUnitRepository,
  type ProductUnitPayload,
} from "./product-unit.repository.js";

export class ProductUnitService {
  constructor(private readonly repo = new ProductUnitRepository()) {}

  private readonly maxLen = {
    name: 80,
    shortName: 20,
    description: 255,
  };

  private trimOrNull(value: string | null | undefined) {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  private normalize(data: Partial<ProductUnitPayload>) {
    return {
      name: this.trimOrNull(data.name) ?? "",
      shortName: this.trimOrNull(data.shortName) ?? "",
      description: this.trimOrNull(data.description),
      sortOrder: data.sortOrder,
    };
  }

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, "productUnit.invalidId");
    }
  }

  private validateSortOrder(sortOrder: number | undefined) {
    if (sortOrder == null) return;
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw new HttpError(400, "productUnit.invalidSortOrder");
    }
  }

  private validateLengths(data: ReturnType<ProductUnitService["normalize"]>) {
    (Object.keys(this.maxLen) as Array<keyof typeof this.maxLen>).forEach((key) => {
      const value = data[key];
      if (value != null && value.length > this.maxLen[key]) {
        throw new HttpError(400, "productUnit.fieldTooLong");
      }
    });
  }

  private async validateUnique(name: string, shortName: string, excludeId?: number) {
    const duplicated = await this.repo.findByNameOrShortName(name, shortName, excludeId);
    if (duplicated) {
      throw new HttpError(409, "productUnit.duplicated");
    }
  }

  private toResponse(data: {
    id: number;
    name: string;
    shortName: string;
    description: string | null;
    sortOrder: number;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return {
      id: data.id,
      name: data.name,
      shortName: data.shortName,
      description: data.description,
      sortOrder: data.sortOrder,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async create(data: Partial<ProductUnitPayload>, changedByUserId: number | null) {
    const normalized = this.normalize(data);
    if (!normalized.name) {
      throw new HttpError(400, "productUnit.nameRequired");
    }
    if (!normalized.shortName) {
      throw new HttpError(400, "productUnit.shortNameRequired");
    }

    this.validateSortOrder(normalized.sortOrder);
    this.validateLengths(normalized);
    await this.validateUnique(normalized.name, normalized.shortName);

    const created = await this.repo.create({
      name: normalized.name,
      shortName: normalized.shortName,
      description: normalized.description,
      sortOrder: normalized.sortOrder ?? 0,
    });

    const snapshot = this.toResponse(created);
    await this.repo.createHistory({
      productUnitId: created.id,
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

  async findById(id: number) {
    this.validateId(id);
    const found = await this.repo.findById(id);
    if (!found || found.status !== 1) {
      throw new HttpError(404, "productUnit.notFound");
    }
    return this.toResponse(found);
  }

  async update(id: number, data: Partial<ProductUnitPayload>, changedByUserId: number | null) {
    this.validateId(id);
    const found = await this.repo.findById(id);
    if (!found || found.status !== 1) {
      throw new HttpError(404, "productUnit.notFound");
    }

    const normalized = this.normalize(data);
    this.validateSortOrder(normalized.sortOrder);
    this.validateLengths(normalized);

    if (data.name != null && !normalized.name) {
      throw new HttpError(400, "productUnit.nameRequired");
    }
    if (data.shortName != null && !normalized.shortName) {
      throw new HttpError(400, "productUnit.shortNameRequired");
    }

    const nextName = data.name != null ? normalized.name : found.name;
    const nextShort = data.shortName != null ? normalized.shortName : found.shortName;
    await this.validateUnique(nextName, nextShort, id);

    const base = this.toResponse(found);
    const updateData: Partial<ProductUnitPayload> = {};
    if (data.name != null) updateData.name = normalized.name;
    if (data.shortName != null) updateData.shortName = normalized.shortName;
    if (data.description != null) updateData.description = normalized.description;
    if (data.sortOrder != null) updateData.sortOrder = normalized.sortOrder;

    await this.repo.update(found, updateData);
    const snapshot = this.toResponse(found);

    const changedFields: Record<string, { before: unknown; after: unknown }> = {};
    (Object.keys(snapshot) as Array<keyof typeof snapshot>).forEach((key) => {
      if (key === "createdAt" || key === "updatedAt") return;
      const before = base[key];
      const after = snapshot[key];
      if (before !== after) changedFields[key] = { before, after };
    });

    if (Object.keys(changedFields).length > 0) {
      await this.repo.createHistory({
        productUnitId: found.id,
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
      throw new HttpError(404, "productUnit.notFound");
    }

    await this.repo.update(found, { status: 0 });
    const snapshot = this.toResponse(found);
    await this.repo.createHistory({
      productUnitId: found.id,
      changedByUserId,
      action: "delete",
      changedFields: { status: { before: 1, after: 0 } },
      snapshot,
    });

    return { id: found.id, deleted: true };
  }

  async getHistory(id: number) {
    this.validateId(id);
    const found = await this.repo.findById(id);
    if (!found) {
      throw new HttpError(404, "productUnit.notFound");
    }

    const history = await this.repo.findHistoryByUnitId(id);
    return history.map((item) => ({
      id: item.id,
      productUnitId: item.productUnitId,
      changedByUserId: item.changedByUserId,
      action: item.action,
      changedFields: item.changedFields,
      snapshot: item.snapshot,
      createdAt: item.createdAt,
    }));
  }
}
