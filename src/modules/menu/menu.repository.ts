import { Menu } from "./menu.model.js";

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
}
