import { Zone } from "./zone.model.js";
import { RestaurantTable } from "./table.model.js";
export class ZoneRepository {
    async create(data) {
        return Zone.create({
            name: data.name,
            description: data.description ?? null,
            color: data.color ?? "#38BDF8",
            sortOrder: data.sortOrder ?? 0,
            status: 1,
        });
    }
    async findActive() {
        return Zone.findAll({
            where: { status: 1 },
            include: [{ model: RestaurantTable, as: "tables", required: false }],
            order: [
                ["sortOrder", "ASC"],
                ["id", "ASC"],
                [{ model: RestaurantTable, as: "tables" }, "sortOrder", "ASC"],
                [{ model: RestaurantTable, as: "tables" }, "id", "ASC"],
            ],
        });
    }
    async findById(id) {
        return Zone.findByPk(id);
    }
    async update(zone, data) {
        return zone.update(data);
    }
}
