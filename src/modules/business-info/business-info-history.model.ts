import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class BusinessInfoHistory extends Model {
  declare id: number;
  declare businessInfoId: number;
  declare changedByUserId: number | null;
  declare action: "create" | "update";
  declare changedFields: object;
  declare snapshot: object;
  declare createdAt: Date;
}

BusinessInfoHistory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    businessInfoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_business_info",
    },
    changedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "changed_by_user_id",
    },
    action: {
      type: DataTypes.ENUM("create", "update"),
      allowNull: false,
    },
    changedFields: {
      type: DataTypes.JSON,
      allowNull: false,
      field: "changed_fields",
    },
    snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "business_info_history",
    timestamps: true,
    updatedAt: false,
  }
);
