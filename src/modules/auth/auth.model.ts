import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";
import { Role } from "../rol/roles.model.js";
import { UserRole } from "./user-role.model.js";

export class User extends Model {
  declare id: number;
  declare email: string;
  declare password: string;
  declare nombre: string;
  declare apellidos: string;
  declare telefono: string | null;
  declare pais: string;
  declare estado: number;
  declare roles?: Role[];
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    apellidos: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    pais: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    estado: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "userId",
  otherKey: "roleId",
  as: "roles",
});
