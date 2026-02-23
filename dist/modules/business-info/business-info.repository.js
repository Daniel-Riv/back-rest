import { BusinessInfo } from "./business-info.model.js";
import { BusinessInfoHistory } from "./business-info-history.model.js";
export class BusinessInfoRepository {
    async create(data) {
        return BusinessInfo.create({
            currentPlan: data.currentPlan ?? null,
            name: data.name,
            taxId: data.taxId,
            contact: data.contact ?? null,
            email: data.email ?? null,
            address: data.address ?? null,
            country: data.country ?? null,
            department: data.department ?? null,
            city: data.city ?? null,
            phone: data.phone ?? null,
            website: data.website ?? null,
            handlesElectronicInvoicing: data.handlesElectronicInvoicing ?? false,
            hasIngredientProducts: data.hasIngredientProducts ?? false,
            usesTables: data.usesTables ?? false,
            hasDelivery: data.hasDelivery ?? false,
            logoUrl: data.logoUrl ?? null,
            status: 1,
        });
    }
    async findCurrent() {
        return BusinessInfo.findOne({
            where: { status: 1 },
            order: [["id", "DESC"]],
        });
    }
    async findById(id) {
        return BusinessInfo.findByPk(id);
    }
    async update(instance, data) {
        return instance.update(data);
    }
    async createHistory(data) {
        return BusinessInfoHistory.create({
            businessInfoId: data.businessInfoId,
            changedByUserId: data.changedByUserId,
            action: data.action,
            changedFields: data.changedFields,
            snapshot: data.snapshot,
        });
    }
    async findHistoryByBusinessInfoId(businessInfoId) {
        return BusinessInfoHistory.findAll({
            where: { businessInfoId },
            order: [["createdAt", "DESC"]],
        });
    }
}
