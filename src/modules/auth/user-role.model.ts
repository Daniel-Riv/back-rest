import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export class UserRole extends Model {
  declare userId: number;
  declare roleId: number;
}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "role_id",
      references: {
        model: "roles",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "user_roles",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "role_id"],
      },
    ],
  }
);
