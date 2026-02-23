import { Op } from "sequelize";
import { Supplier } from "./supplier.model.js";
import { SupplierHistory } from "./supplier-history.model.js";

export type SupplierPayload = {
  name: string;
  commercialName?: string | null;
  document: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  contact?: string | null;
  note?: string | null;
  status?: number;
};

export class SupplierRepository {
  async create(data: SupplierPayload) {
    return Supplier.create({
      name: data.name,
      commercialName: data.commercialName ?? null,
      document: data.document,
      email: data.email ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      website: data.website ?? null,
      contact: data.contact ?? null,
      note: data.note ?? null,
      status: data.status ?? 1,
    });
  }

  async findAllActive(search?: string) {
    const where: any = { status: 1 };
    if (search?.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: q } },
        { commercialName: { [Op.like]: q } },
        { document: { [Op.like]: q } },
      ];
    }
    return Supplier.findAll({
      where,
      order: [["id", "DESC"]],
    });
  }

  async findById(id: number) {
    return Supplier.findByPk(id);
  }

  async findDuplicated(document: string, excludeId?: number) {
    const where: any = {
      status: 1,
      document,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    };
    return Supplier.findOne({ where });
  }

  async update(instance: Supplier, data: Partial<SupplierPayload> & { status?: number }) {
    return instance.update(data);
  }

  async createHistory(data: {
    supplierId: number;
    changedByUserId: number | null;
    action: "create" | "update" | "delete";
    changedFields: object;
    snapshot: object;
  }) {
    return SupplierHistory.create({
      supplierId: data.supplierId,
      changedByUserId: data.changedByUserId,
      action: data.action,
      changedFields: data.changedFields,
      snapshot: data.snapshot,
    });
  }

  async findHistoryBySupplierId(supplierId: number) {
    return SupplierHistory.findAll({
      where: { supplierId },
      order: [["createdAt", "DESC"]],
    });
  }
}
