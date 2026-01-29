import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class UserRole extends Model {
  declare userId: number;
  declare roleId: number;
}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_user",
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_role",
    },
  },
  {
    sequelize,
    tableName: "user_roles",
    timestamps: false,
    indexes: [{ unique: true, fields: ["id_user", "id_role"] }],
  }
);
