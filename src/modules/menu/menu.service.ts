import { Menu } from "./menu.model.js";
import { MenuRepository, CreateMenuData } from "./menu.repository.js";
import { RoleMenuRepository } from "./role-menu.repository.js";
import { Role } from "../rol/roles.model.js";
import { HttpError } from "../../shared/errors/HttpError.js";

export class MenuService {
  constructor(
    private readonly repo = new MenuRepository(),
    private readonly roleMenuRepo = new RoleMenuRepository()
  ) {}

  async create(data: CreateMenuData) {
    if (!data.name?.trim()) {
      throw new HttpError(400, "menu.nameRequired");
    }
    if (!data.path?.trim()) {
      throw new HttpError(400, "menu.pathRequired");
    }
    if (data.path.length > 255) {
      throw new HttpError(400, "menu.pathTooLong");
    }
    if (data.name.length > 100) {
      throw new HttpError(400, "menu.nameTooLong");
    }
    if (data.icon != null && data.icon.length > 50) {
      throw new HttpError(400, "menu.iconTooLong");
    }
    if (data.sortOrder != null && (typeof data.sortOrder !== "number" || data.sortOrder < 0)) {
      throw new HttpError(400, "menu.invalidSortOrder");
    }

    const menu = await this.repo.create({
      name: data.name.trim(),
      path: data.path.trim(),
      icon: data.icon?.trim() || null,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? 0,
    });

    return {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      parentId: menu.parentId,
      sortOrder: menu.sortOrder,
      status: menu.status,
    };
  }

  async assignMenusToRole(roleId: number, menuIds: number[]) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new HttpError(404, "menu.roleNotFound");
    }
    if (!Array.isArray(menuIds)) {
      throw new HttpError(400, "menu.menuIdsMustBeArray");
    }
    const ids = [...new Set(menuIds)].filter(
      (id) => typeof id === "number" && Number.isInteger(id) && id > 0
    );
    if (ids.length > 0) {
      const menus = await Menu.findAll({
        where: { id: ids },
        attributes: ["id"],
      });
      const foundIds = new Set(menus.map((m) => m.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new HttpError(400, "menu.menusNotFound");
      }
    }
    await this.roleMenuRepo.setMenusForRole(roleId, ids);
    return { roleId, menuIds: ids };
  }
}
