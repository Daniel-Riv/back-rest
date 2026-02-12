import { Menu } from "./menu.model.js";
import { Op } from "sequelize";

export type CreateMenuData = {
  name: string;
  path: string;
  icon?: string | null;
  parentId?: number | null;
  sortOrder?: number;
};

export class MenuRepository {
  async create(data: CreateMenuData) {
    return Menu.create({
      name: data.name,
      path: data.path,
      icon: data.icon ?? null,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? 0,
      status: 1,
    });
  }

  async findByIds(ids: number[]) {
    if (ids.length === 0) {
      return [];
    }

    return Menu.findAll({
      where: { id: { [Op.in]: ids } },
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
  }
}
