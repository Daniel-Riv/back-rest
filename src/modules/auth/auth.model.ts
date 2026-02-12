import { DataTypes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
import { Role } from "../rol/roles.model.js";

export type UserColors = {
  primary: string;
  secondary: string;
  tertiary: string;
};

export class User extends Model {
  declare id: number;
  declare email: string;
  declare password: string;
  declare name: string;
  declare lastName: string;
  declare phone: string | null;
  declare country: string;
  declare colors: UserColors;
  declare status: number;
  declare roles?: NonAttribute<Role[]>;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    lastName: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    country: { type: DataTypes.STRING(50), allowNull: false },
    colors: {
      type: DataTypes.JSON,
      allowNull: false,
      field: "colores",
      defaultValue: {
        primary: "#0EA5E9",
        secondary: "#111827",
        tertiary: "#F8FAFC",
      },
    },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);
