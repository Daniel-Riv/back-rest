import { RestaurantTable } from "./table.model.js";
import { Zone } from "./zone.model.js";
export class TableRepository {
    async create(data) {
        return RestaurantTable.create({
            zoneId: data.zoneId,
            name: data.name,
            description: data.description ?? null,
            accessCode: data.accessCode ?? null,
            isDeliveryOrCash: data.isDeliveryOrCash ?? false,
            sortOrder: data.sortOrder ?? 0,
            status: 1,
        });
    }
    async findActive() {
        return RestaurantTable.findAll({
            where: { status: 1 },
            include: [
                {
                    model: Zone,
                    as: "zone",
                    attributes: ["id", "name", "color", "status"],
                    required: false,
                },
            ],
            order: [
                ["sortOrder", "ASC"],
                ["id", "ASC"],
            ],
        });
    }
    async findById(id) {
        return RestaurantTable.findByPk(id);
    }
    async countActiveByZone(zoneId) {
        return RestaurantTable.count({ where: { zoneId, status: 1 } });
    }
    async update(table, data) {
        return table.update(data);
    }
}
