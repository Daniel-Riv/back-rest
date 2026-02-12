import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class Menu extends Model {
  declare id: number;
  declare name: string;
  declare path: string;
  declare icon: string | null;
  declare parentId: number | null;
  declare sortOrder: number;
  declare status: number;
}

Menu.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    path: { type: DataTypes.STRING(255), allowNull: false },
    icon: { type: DataTypes.STRING(50), allowNull: true },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "id_parent",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "sort_order",
    },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
  },
  {
    sequelize,
    tableName: "menu",
    timestamps: false,
  }
);
