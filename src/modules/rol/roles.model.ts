import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";
import { User } from "../auth/auth.model.js";
import { UserRole } from "../auth/user-role.model.js";

export class Role extends Model {
  declare id: number;
  declare nombre: string;
  declare estado: number;
  declare users?: User[];
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    estado: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: false,
  }
);

Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "roleId",
    otherKey: "userId",
    as: "users",
  });