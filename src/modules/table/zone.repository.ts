import { Zone } from "./zone.model.js";
import { RestaurantTable } from "./table.model.js";

export type CreateZoneData = {
  name: string;
  description?: string | null;
  color?: string;
  sortOrder?: number;
};

export type UpdateZoneData = {
  name?: string;
  description?: string | null;
  color?: string;
  sortOrder?: number;
  status?: number;
};

export class ZoneRepository {
  async create(data: CreateZoneData) {
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

  async findById(id: number) {
    return Zone.findByPk(id);
  }

  async update(zone: Zone, data: UpdateZoneData) {
    return zone.update(data);
  }
}
