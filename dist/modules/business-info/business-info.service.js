import { HttpError } from "../../shared/errors/HttpError.js";
import { BusinessInfoRepository, } from "./business-info.repository.js";
export class BusinessInfoService {
    repo;
    constructor(repo = new BusinessInfoRepository()) {
        this.repo = repo;
    }
    maxLen = {
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
    normalize(data) {
        const trimOrNull = (v) => {
            if (v == null)
                return null;
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
    validateEmail(email) {
        if (!email)
            return;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            throw new HttpError(400, "businessInfo.invalidEmail");
        }
    }
    validateUrl(url) {
        if (!url)
            return;
        const regex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
        if (!regex.test(url)) {
            throw new HttpError(400, "businessInfo.invalidWebsite");
        }
    }
    validateLengths(data) {
        Object.keys(this.maxLen).forEach((key) => {
            const value = data[key];
            if (value != null && typeof value === "string" && value.length > this.maxLen[key]) {
                throw new HttpError(400, "businessInfo.fieldTooLong");
            }
        });
    }
    toResponse(data) {
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
    async create(data, changedByUserId) {
        const current = await this.repo.findCurrent();
        if (current) {
            throw new HttpError(409, "businessInfo.alreadyExists");
        }
        const normalized = this.normalize(data);
        if (!normalized.name)
            throw new HttpError(400, "businessInfo.nameRequired");
        if (!normalized.taxId)
            throw new HttpError(400, "businessInfo.taxIdRequired");
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
    async update(businessInfoId, data, changedByUserId) {
        if (!Number.isInteger(businessInfoId) || businessInfoId <= 0) {
            throw new HttpError(400, "businessInfo.invalidId");
        }
        const found = await this.repo.findById(businessInfoId);
        if (!found || found.status !== 1) {
            throw new HttpError(404, "businessInfo.notFound");
        }
        const base = this.normalize(found.toJSON());
        const incoming = this.normalize(data);
        const merged = {
            ...base,
            ...Object.fromEntries(Object.entries(incoming).filter(([, value]) => value !== undefined)),
        };
        if (!merged.name)
            throw new HttpError(400, "businessInfo.nameRequired");
        if (!merged.taxId)
            throw new HttpError(400, "businessInfo.taxIdRequired");
        this.validateEmail(merged.email);
        this.validateUrl(merged.website);
        this.validateLengths(merged);
        const changedFields = {};
        Object.keys(merged).forEach((key) => {
            const before = base[key];
            const after = merged[key];
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
    async getHistory(businessInfoId) {
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
