import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class ProductCategory extends Model {
  declare id: number;
  declare nameEs: string;
  declare nameEn: string | null;
  declare description: string | null;
  declare icon: string | null;
  declare color: string | null;
  declare sortOrder: number;
  declare status: number;
}

ProductCategory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nameEs: {
      type: DataTypes.STRING(120),
      allowNull: false,
      field: "name_es",
    },
    nameEn: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: "name_en",
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
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
    tableName: "product_category",
    timestamps: true,
  }
);
