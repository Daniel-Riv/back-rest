import { HttpError } from "../../shared/errors/HttpError.js";
import { TableRepository } from "./table.repository.js";
import { ZoneRepository } from "./zone.repository.js";
const HEX_COLOR_REGEX = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
export class TableService {
    zoneRepo;
    tableRepo;
    constructor(zoneRepo = new ZoneRepository(), tableRepo = new TableRepository()) {
        this.zoneRepo = zoneRepo;
        this.tableRepo = tableRepo;
    }
    validateName(name, key) {
        if (!name?.trim()) {
            throw new HttpError(400, key);
        }
        if (name.trim().length > 100) {
            throw new HttpError(400, "table.nameTooLong");
        }
    }
    validateDescription(description) {
        if (description != null && description.length > 255) {
            throw new HttpError(400, "table.descriptionTooLong");
        }
    }
    validateSortOrder(sortOrder) {
        if (sortOrder == null)
            return;
        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            throw new HttpError(400, "table.invalidSortOrder");
        }
    }
    normalizeColor(color) {
        const normalized = color?.trim() || "#38BDF8";
        if (!HEX_COLOR_REGEX.test(normalized)) {
            throw new HttpError(400, "table.invalidColor");
        }
        return normalized;
    }
    async getWorkspace() {
        const zones = await this.zoneRepo.findActive();
        const tables = await this.tableRepo.findActive();
        return {
            zones: zones.map((zone) => ({
                id: zone.id,
                name: zone.name,
                description: zone.description,
                color: zone.color,
                sortOrder: zone.sortOrder,
                status: zone.status,
            })),
            tables: tables.map((table) => ({
                id: table.id,
                zoneId: table.zoneId,
                name: table.name,
                description: table.description,
                accessCode: table.accessCode,
                isDeliveryOrCash: table.isDeliveryOrCash,
                sortOrder: table.sortOrder,
                status: table.status,
            })),
        };
    }
    async createZone(data) {
        this.validateName(data.name, "table.zoneNameRequired");
        this.validateDescription(data.description);
        this.validateSortOrder(data.sortOrder);
        const zone = await this.zoneRepo.create({
            name: data.name.trim(),
            description: data.description?.trim() || null,
            color: this.normalizeColor(data.color),
            sortOrder: data.sortOrder ?? 0,
        });
        return {
            id: zone.id,
            name: zone.name,
            description: zone.description,
            color: zone.color,
            sortOrder: zone.sortOrder,
            status: zone.status,
        };
    }
    async updateZone(zoneId, data) {
        if (!Number.isInteger(zoneId) || zoneId <= 0) {
            throw new HttpError(400, "table.invalidZoneId");
        }
        const zone = await this.zoneRepo.findById(zoneId);
        if (!zone || zone.status !== 1) {
            throw new HttpError(404, "table.zoneNotFound");
        }
        if (data.name != null)
            this.validateName(data.name, "table.zoneNameRequired");
        this.validateDescription(data.description);
        this.validateSortOrder(data.sortOrder);
        await this.zoneRepo.update(zone, {
            name: data.name?.trim(),
            description: data.description?.trim() || (data.description === "" ? null : undefined),
            color: data.color == null ? undefined : this.normalizeColor(data.color),
            sortOrder: data.sortOrder,
            status: data.status,
        });
        return {
            id: zone.id,
            name: zone.name,
            description: zone.description,
            color: zone.color,
            sortOrder: zone.sortOrder,
            status: zone.status,
        };
    }
    async deleteZone(zoneId) {
        if (!Number.isInteger(zoneId) || zoneId <= 0) {
            throw new HttpError(400, "table.invalidZoneId");
        }
        const zone = await this.zoneRepo.findById(zoneId);
        if (!zone || zone.status !== 1) {
            throw new HttpError(404, "table.zoneNotFound");
        }
        const activeTables = await this.tableRepo.countActiveByZone(zoneId);
        if (activeTables > 0) {
            throw new HttpError(409, "table.zoneHasActiveTables");
        }
        await this.zoneRepo.update(zone, { status: 0 });
        return { zoneId, deleted: true };
    }
    async createTable(data) {
        this.validateName(data.name, "table.tableNameRequired");
        this.validateDescription(data.description);
        this.validateSortOrder(data.sortOrder);
        if (!Number.isInteger(data.zoneId) || data.zoneId <= 0) {
            throw new HttpError(400, "table.invalidZoneId");
        }
        const zone = await this.zoneRepo.findById(data.zoneId);
        if (!zone || zone.status !== 1) {
            throw new HttpError(404, "table.zoneNotFound");
        }
        if (data.accessCode != null && data.accessCode.length > 60) {
            throw new HttpError(400, "table.accessCodeTooLong");
        }
        const table = await this.tableRepo.create({
            zoneId: data.zoneId,
            name: data.name.trim(),
            description: data.description?.trim() || null,
            accessCode: data.accessCode?.trim() || null,
            isDeliveryOrCash: Boolean(data.isDeliveryOrCash),
            sortOrder: data.sortOrder ?? 0,
        });
        return {
            id: table.id,
            zoneId: table.zoneId,
            name: table.name,
            description: table.description,
            accessCode: table.accessCode,
            isDeliveryOrCash: table.isDeliveryOrCash,
            sortOrder: table.sortOrder,
            status: table.status,
        };
    }
    async updateTable(tableId, data) {
        if (!Number.isInteger(tableId) || tableId <= 0) {
            throw new HttpError(400, "table.invalidTableId");
        }
        const table = await this.tableRepo.findById(tableId);
        if (!table || table.status !== 1) {
            throw new HttpError(404, "table.tableNotFound");
        }
        if (data.name != null)
            this.validateName(data.name, "table.tableNameRequired");
        this.validateDescription(data.description);
        this.validateSortOrder(data.sortOrder);
        if (data.zoneId != null) {
            if (!Number.isInteger(data.zoneId) || data.zoneId <= 0) {
                throw new HttpError(400, "table.invalidZoneId");
            }
            const zone = await this.zoneRepo.findById(data.zoneId);
            if (!zone || zone.status !== 1) {
                throw new HttpError(404, "table.zoneNotFound");
            }
        }
        if (data.accessCode != null && data.accessCode.length > 60) {
            throw new HttpError(400, "table.accessCodeTooLong");
        }
        await this.tableRepo.update(table, {
            zoneId: data.zoneId,
            name: data.name?.trim(),
            description: data.description?.trim() || (data.description === "" ? null : undefined),
            accessCode: data.accessCode?.trim() || (data.accessCode === "" ? null : undefined),
            isDeliveryOrCash: data.isDeliveryOrCash,
            sortOrder: data.sortOrder,
            status: data.status,
        });
        return {
            id: table.id,
            zoneId: table.zoneId,
            name: table.name,
            description: table.description,
            accessCode: table.accessCode,
            isDeliveryOrCash: table.isDeliveryOrCash,
            sortOrder: table.sortOrder,
            status: table.status,
        };
    }
    async deleteTable(tableId) {
        if (!Number.isInteger(tableId) || tableId <= 0) {
            throw new HttpError(400, "table.invalidTableId");
        }
        const table = await this.tableRepo.findById(tableId);
        if (!table || table.status !== 1) {
            throw new HttpError(404, "table.tableNotFound");
        }
        await this.tableRepo.update(table, { status: 0 });
        return { tableId, deleted: true };
    }
}
