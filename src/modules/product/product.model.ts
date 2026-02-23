import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class Product extends Model {
  declare id: number;
  declare productCategoryId: number | null;
  declare code: string | null;
  declare name: string;
  declare description: string | null;
  declare basePrice: number;
  declare status: number;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "product_category_id",
    },
    code: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    basePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "base_price",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "product",
    timestamps: true,
  }
);
