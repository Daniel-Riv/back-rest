import { HttpError } from "../../shared/errors/HttpError.js";
import {
  BusinessInfoRepository,
  type BusinessInfoPayload,
} from "./business-info.repository.js";

export class BusinessInfoService {
  constructor(private readonly repo = new BusinessInfoRepository()) {}

  private readonly maxLen = {
    currentPlan: 80,
    name: 150,
    taxId: 50,
    contact: 120,
    email: 150,
    address: 255,
    country: 80,
    department: 80,
    city: 80,
    phone: 40,
    website: 255,
    logoUrl: 255,
  };

  private normalize(data: Partial<BusinessInfoPayload>) {
    const trimOrNull = (v: string | null | undefined) => {
      if (v == null) return null;
      const t = v.trim();
      return t === "" ? null : t;
    };

    return {
      currentPlan: trimOrNull(data.currentPlan),
      name: trimOrNull(data.name) ?? "",
      taxId: trimOrNull(data.taxId) ?? "",
      contact: trimOrNull(data.contact),
      email: trimOrNull(data.email),
      address: trimOrNull(data.address),
      country: trimOrNull(data.country),
      department: trimOrNull(data.department),
      city: trimOrNull(data.city),
      phone: trimOrNull(data.phone),
      website: trimOrNull(data.website),
      handlesElectronicInvoicing: data.handlesElectronicInvoicing ?? false,
      hasIngredientProducts: data.hasIngredientProducts ?? false,
      usesTables: data.usesTables ?? false,
      hasDelivery: data.hasDelivery ?? false,
      logoUrl: trimOrNull(data.logoUrl),
    };
  }

  private validateEmail(email: string | null) {
    if (!email) return;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      throw new HttpError(400, "businessInfo.invalidEmail");
    }
  }

  private validateUrl(url: string | null) {
    if (!url) return;
    const regex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    if (!regex.test(url)) {
      throw new HttpError(400, "businessInfo.invalidWebsite");
    }
  }

  private validateLengths(data: ReturnType<BusinessInfoService["normalize"]>) {
    (Object.keys(this.maxLen) as Array<keyof typeof this.maxLen>).forEach((key) => {
      const value = data[key];
      if (value != null && typeof value === "string" && value.length > this.maxLen[key]) {
        throw new HttpError(400, "businessInfo.fieldTooLong");
      }
    });
  }

  private toResponse(data: {
    id: number;
    currentPlan: string | null;
    name: string;
    taxId: string;
    contact: string | null;
    email: string | null;
    address: string | null;
    country: string | null;
    department: string | null;
    city: string | null;
    phone: string | null;
    website: string | null;
    handlesElectronicInvoicing: boolean;
    hasIngredientProducts: boolean;
    usesTables: boolean;
    hasDelivery: boolean;
    logoUrl: string | null;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return {
      id: data.id,
      currentPlan: data.currentPlan,
      name: data.name,
      taxId: data.taxId,
      contact: data.contact,
      email: data.email,
      address: data.address,
      country: data.country,
      department: data.department,
      city: data.city,
      phone: data.phone,
      website: data.website,
      handlesElectronicInvoicing: data.handlesElectronicInvoicing,
      hasIngredientProducts: data.hasIngredientProducts,
      usesTables: data.usesTables,
      hasDelivery: data.hasDelivery,
      logoUrl: data.logoUrl,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async getCurrent() {
    const current = await this.repo.findCurrent();
    if (!current) {
      return null;
    }
    return this.toResponse(current);
  }

  async create(data: Partial<BusinessInfoPayload>, changedByUserId: number | null) {
    const current = await this.repo.findCurrent();
    if (current) {
      throw new HttpError(409, "businessInfo.alreadyExists");
    }

    const normalized = this.normalize(data);
    if (!normalized.name) throw new HttpError(400, "businessInfo.nameRequired");
    if (!normalized.taxId) throw new HttpError(400, "businessInfo.taxIdRequired");

    this.validateEmail(normalized.email);
    this.validateUrl(normalized.website);
    this.validateLengths(normalized);

    const created = await this.repo.create(normalized);
    const snapshot = this.toResponse(created);
    await this.repo.createHistory({
      businessInfoId: created.id,
      changedByUserId,
      action: "create",
      changedFields: snapshot,
      snapshot,
    });

    return snapshot;
  }

  async update(
    businessInfoId: number,
    data: Partial<BusinessInfoPayload>,
    changedByUserId: number | null
  ) {
    if (!Number.isInteger(businessInfoId) || businessInfoId <= 0) {
      throw new HttpError(400, "businessInfo.invalidId");
    }

    const found = await this.repo.findById(businessInfoId);
    if (!found || found.status !== 1) {
      throw new HttpError(404, "businessInfo.notFound");
    }

    const base = this.normalize(found.toJSON() as Partial<BusinessInfoPayload>);
    const incoming = this.normalize(data);
    const merged = {
      ...base,
      ...Object.fromEntries(
        Object.entries(incoming).filter(([, value]) => value !== undefined)
      ),
    };

    if (!merged.name) throw new HttpError(400, "businessInfo.nameRequired");
    if (!merged.taxId) throw new HttpError(400, "businessInfo.taxIdRequired");
    this.validateEmail(merged.email);
    this.validateUrl(merged.website);
    this.validateLengths(merged);

    const changedFields: Record<string, { before: unknown; after: unknown }> = {};
    (Object.keys(merged) as Array<keyof typeof merged>).forEach((key) => {
      const before = (base as any)[key];
      const after = (merged as any)[key];
      if (before !== after) {
        changedFields[key] = { before, after };
      }
    });

    if (Object.keys(changedFields).length === 0) {
      return this.toResponse(found);
    }

    await this.repo.update(found, merged);
    const snapshot = this.toResponse(found);
    await this.repo.createHistory({
      businessInfoId: found.id,
      changedByUserId,
      action: "update",
      changedFields,
      snapshot,
    });

    return snapshot;
  }

  async getHistory(businessInfoId: number) {
    if (!Number.isInteger(businessInfoId) || businessInfoId <= 0) {
      throw new HttpError(400, "businessInfo.invalidId");
    }
    const found = await this.repo.findById(businessInfoId);
    if (!found || found.status !== 1) {
      throw new HttpError(404, "businessInfo.notFound");
    }

    const history = await this.repo.findHistoryByBusinessInfoId(businessInfoId);
    return history.map((item) => ({
      id: item.id,
      businessInfoId: item.businessInfoId,
      changedByUserId: item.changedByUserId,
      action: item.action,
      changedFields: item.changedFields,
      snapshot: item.snapshot,
      createdAt: item.createdAt,
    }));
  }
}
