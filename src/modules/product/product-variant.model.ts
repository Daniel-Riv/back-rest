import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class ProductVariant extends Model {
  declare id: number;
  declare productId: number;
  declare name: string;
  declare additionalPrice: number;
  declare sortOrder: number;
  declare status: number;
}

ProductVariant.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    additionalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "additional_price",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "product_variant",
    timestamps: true,
  }
);
