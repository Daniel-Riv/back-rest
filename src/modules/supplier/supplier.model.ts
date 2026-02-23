import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class Supplier extends Model {
  declare id: number;
  declare name: string;
  declare commercialName: string | null;
  declare document: string;
  declare email: string | null;
  declare phone: string | null;
  declare address: string | null;
  declare website: string | null;
  declare contact: string | null;
  declare note: string | null;
  declare status: number;
}

Supplier.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    commercialName: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: "commercial_name",
    },
    document: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "supplier",
    timestamps: true,
  }
);
