import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class BusinessInfo extends Model {
  declare id: number;
  declare currentPlan: string | null;
  declare name: string;
  declare taxId: string;
  declare contact: string | null;
  declare email: string | null;
  declare address: string | null;
  declare country: string | null;
  declare department: string | null;
  declare city: string | null;
  declare phone: string | null;
  declare website: string | null;
  declare handlesElectronicInvoicing: boolean;
  declare hasIngredientProducts: boolean;
  declare usesTables: boolean;
  declare hasDelivery: boolean;
  declare logoUrl: string | null;
  declare status: number;
}

BusinessInfo.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    currentPlan: {
      type: DataTypes.STRING(80),
      allowNull: true,
      field: "current_plan",
    },
    name: { type: DataTypes.STRING(150), allowNull: false },
    taxId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "tax_id",
    },
    contact: { type: DataTypes.STRING(120), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: true },
    country: { type: DataTypes.STRING(80), allowNull: true },
    department: { type: DataTypes.STRING(80), allowNull: true },
    city: { type: DataTypes.STRING(80), allowNull: true },
    phone: { type: DataTypes.STRING(40), allowNull: true },
    website: { type: DataTypes.STRING(255), allowNull: true },
    handlesElectronicInvoicing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "handles_electronic_invoicing",
    },
    hasIngredientProducts: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "has_ingredient_products",
    },
    usesTables: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "uses_tables",
    },
    hasDelivery: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "has_delivery",
    },
    logoUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "logo_url",
    },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  },
  {
    sequelize,
    tableName: "business_info",
    timestamps: true,
  }
);
