import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class Ingredient extends Model {
  declare id: number;
  declare productCategoryId: number;
  declare productUnitId: number;
  declare code: string | null;
  declare name: string;
  declare minStock: number;
  declare initialStock: number;
  declare currentStock: number;
  declare purchasePrice: number;
  declare status: number;
}

Ingredient.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_category_id",
    },
    productUnitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_unit_id",
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    minStock: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      defaultValue: 0,
      field: "min_stock",
    },
    initialStock: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      defaultValue: 0,
      field: "initial_stock",
    },
    currentStock: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      defaultValue: 0,
      field: "current_stock",
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "purchase_price",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "ingredient",
    timestamps: true,
  }
);
