import { User } from "../modules/auth/auth.model.js";
import { Role } from "../modules/rol/roles.model.js";
import { UserRole } from "../modules/auth/user-role.model.js";
import { Menu } from "../modules/menu/menu.model.js";
import { RoleMenu } from "../modules/menu/role-menu.model.js";

export function initAssociations() {
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "userId",
    otherKey: "roleId",
    as: "roles",
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "roleId",
    otherKey: "userId",
    as: "users",
  });

  Role.belongsToMany(Menu, {
    through: RoleMenu,
    foreignKey: "roleId",
    otherKey: "menuId",
    as: "menus",
  });

  Menu.belongsToMany(Role, {
    through: RoleMenu,
    foreignKey: "menuId",
    otherKey: "roleId",
    as: "roles",
  });

  Menu.belongsTo(Menu, { foreignKey: "parentId", as: "parent" });
  Menu.hasMany(Menu, { foreignKey: "parentId", as: "children" });
}
