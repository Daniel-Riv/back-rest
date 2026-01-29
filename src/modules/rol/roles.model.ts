import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

export class Role extends Model {
  declare id: number;
  declare name: string;
  declare status: number;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: false,
  }
);
