import { RestaurantTable } from "./table.model.js";
import { Zone } from "./zone.model.js";

export type CreateTableData = {
  zoneId: number;
  name: string;
  description?: string | null;
  accessCode?: string | null;
  isDeliveryOrCash?: boolean;
  sortOrder?: number;
};

export type UpdateTableData = {
  zoneId?: number;
  name?: string;
  description?: string | null;
  accessCode?: string | null;
  isDeliveryOrCash?: boolean;
  sortOrder?: number;
  status?: number;
};

export class TableRepository {
  async create(data: CreateTableData) {
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

  async findById(id: number) {
    return RestaurantTable.findByPk(id);
  }

  async countActiveByZone(zoneId: number) {
    return RestaurantTable.count({ where: { zoneId, status: 1 } });
  }

  async update(table: RestaurantTable, data: UpdateTableData) {
    return table.update(data);
  }
}
