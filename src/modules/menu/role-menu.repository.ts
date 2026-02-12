import { RoleMenu } from "./role-menu.model.js";

export class RoleMenuRepository {
  async setMenusForRole(roleId: number, menuIds: number[]) {
    await RoleMenu.destroy({ where: { roleId } });
    if (menuIds.length === 0) return [];
    const rows = await RoleMenu.bulkCreate(
      menuIds.map((menuId) => ({ roleId, menuId }))
    );
    return rows;
  }

  async getMenuIdsByRoleId(roleId: number): Promise<number[]> {
    const rows = await RoleMenu.findAll({
      where: { roleId },
      attributes: ["menuId"],
    });
    return rows.map((r) => r.menuId);
  }
}
