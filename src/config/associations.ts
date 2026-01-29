import { User } from "../modules/auth/auth.model.js";
import { Role } from "../modules/rol/roles.model.js";
import { UserRole } from "../modules/auth/user-role.model.js";

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
}
