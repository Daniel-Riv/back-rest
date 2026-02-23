import { HttpError } from "../../shared/errors/HttpError.js";
import { SupplierRepository, type SupplierPayload } from "./supplier.repository.js";

export class SupplierService {
  constructor(private readonly repo = new SupplierRepository()) {}

  private readonly maxLen = {
    name: 120,
    commercialName: 120,
    document: 60,
    email: 150,
    phone: 40,
    address: 255,
    website: 255,
    contact: 120,
    note: 255,
  };

  private trimOrNull(value: string | null | undefined) {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  private normalize(data: Partial<SupplierPayload>) {
    return {
      name: this.trimOrNull(data.name) ?? "",
      commercialName: this.trimOrNull(data.commercialName),
      document: this.trimOrNull(data.document) ?? "",
      email: this.trimOrNull(data.email),
      phone: this.trimOrNull(data.phone),
      address: this.trimOrNull(data.address),
      website: this.trimOrNull(data.website),
      contact: this.trimOrNull(data.contact),
      note: this.trimOrNull(data.note),
      status: data.status == null ? 1 : Number(data.status),
    };
  }

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, "supplier.invalidId");
    }
  }

  private validateStatus(status: number) {
    if (status !== 0 && status !== 1) {
      throw new HttpError(400, "supplier.invalidStatus");
    }
  }

  private validateLengths(data: ReturnType<SupplierService["normalize"]>) {
    (Object.keys(this.maxLen) as Array<keyof typeof this.maxLen>).forEach((key) => {
      const value = data[key];
      if (value != null && value.length > this.maxLen[key]) {
        throw new HttpError(400, "supplier.fieldTooLong");
      }
    });
  }

  private validateEmail(email: string | null) {
    if (!email) return;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) throw new HttpError(400, "supplier.invalidEmail");
  }

  private validateWebsite(website: string | null) {
    if (!website) return;
    const regex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    if (!regex.test(website)) throw new HttpError(400, "supplier.invalidWebsite");
  }

  private toResponse(data: any) {
    return {
      id: data.id,
      name: data.name,
      commercialName: data.commercialName,
      document: data.document,
      email: data.email,
      phone: data.phone,
      address: data.address,
      website: data.website,
      contact: data.contact,
      note: data.note,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async create(data: Partial<SupplierPayload>, changedByUserId: number | null) {
    const normalized = this.normalize(data);
    if (!normalized.name) throw new HttpError(400, "supplier.nameRequired");
    if (!normalized.document) throw new HttpError(400, "supplier.documentRequired");
    this.validateLengths(normalized);
    this.validateEmail(normalized.email);
    this.validateWebsite(normalized.website);
    this.validateStatus(normalized.status);

    const duplicated = await this.repo.findDuplicated(normalized.document);
    if (duplicated) throw new HttpError(409, "supplier.duplicatedDocument");

    const created = await this.repo.create(normalized);
    const snapshot = this.toResponse(created);
    await this.repo.createHistory({
      supplierId: created.id,
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
    if (!found || found.status !== 1) throw new HttpError(404, "supplier.notFound");
    return this.toResponse(found);
  }

  async update(id: number, data: Partial<SupplierPayload>, changedByUserId: number | null) {
    this.validateId(id);
    const found = await this.repo.findById(id);
    if (!found || found.status !== 1) throw new HttpError(404, "supplier.notFound");

    const normalized = this.normalize({
      name: data.name ?? found.name,
      commercialName: data.commercialName ?? found.commercialName,
      document: data.document ?? found.document,
      email: data.email ?? found.email,
      phone: data.phone ?? found.phone,
      address: data.address ?? found.address,
      website: data.website ?? found.website,
      contact: data.contact ?? found.contact,
      note: data.note ?? found.note,
      status: data.status ?? found.status,
    });

    if (!normalized.name) throw new HttpError(400, "supplier.nameRequired");
    if (!normalized.document) throw new HttpError(400, "supplier.documentRequired");
    this.validateLengths(normalized);
    this.validateEmail(normalized.email);
    this.validateWebsite(normalized.website);
    this.validateStatus(normalized.status);

    const duplicated = await this.repo.findDuplicated(normalized.document, id);
    if (duplicated) throw new HttpError(409, "supplier.duplicatedDocument");

    const before = this.toResponse(found);
    await this.repo.update(found, normalized);
    const snapshot = this.toResponse(found);

    const changedFields: Record<string, { before: unknown; after: unknown }> = {};
    (Object.keys(snapshot) as Array<keyof typeof snapshot>).forEach((key) => {
      if (key === "createdAt" || key === "updatedAt") return;
      const beforeVal = before[key];
      const afterVal = snapshot[key];
      if (beforeVal !== afterVal) changedFields[key] = { before: beforeVal, after: afterVal };
    });

    if (Object.keys(changedFields).length > 0) {
      await this.repo.createHistory({
        supplierId: id,
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
    if (!found || found.status !== 1) throw new HttpError(404, "supplier.notFound");
    await this.repo.update(found, { status: 0 });
    const snapshot = this.toResponse(found);
    await this.repo.createHistory({
      supplierId: id,
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
    if (!found) throw new HttpError(404, "supplier.notFound");
    const history = await this.repo.findHistoryBySupplierId(id);
    return history.map((item) => ({
      id: item.id,
      supplierId: item.supplierId,
      changedByUserId: item.changedByUserId,
      action: item.action,
      changedFields: item.changedFields,
      snapshot: item.snapshot,
      createdAt: item.createdAt,
    }));
  }
}
