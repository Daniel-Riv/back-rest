import { DataTypes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
import type { Zone } from "./zone.model.js";

export class RestaurantTable extends Model {
  declare id: number;
  declare zoneId: number;
  declare name: string;
  declare description: string | null;
  declare accessCode: string | null;
  declare isDeliveryOrCash: boolean;
  declare sortOrder: number;
  declare status: number;
  declare zone?: NonAttribute<Zone>;
}

RestaurantTable.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    zoneId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_zone",
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    accessCode: {
      type: DataTypes.STRING(60),
      allowNull: true,
      field: "access_code",
    },
    isDeliveryOrCash: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_delivery_or_cash",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order",
    },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  },
  {
    sequelize,
    tableName: "restaurant_tables",
    timestamps: false,
    indexes: [{ fields: ["id_zone", "sort_order"] }],
  }
);
