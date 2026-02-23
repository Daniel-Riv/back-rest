import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class ProductHistory extends Model {
  declare id: number;
  declare productId: number;
  declare changedByUserId: number | null;
  declare action: "create" | "update" | "delete";
  declare changedFields: object;
  declare snapshot: object;
  declare createdAt: Date;
}

ProductHistory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
    },
    changedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "changed_by_user_id",
    },
    action: {
      type: DataTypes.ENUM("create", "update", "delete"),
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
    tableName: "product_history",
    updatedAt: false,
  }
);
