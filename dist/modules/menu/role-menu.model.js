import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
export class RoleMenu extends Model {
}
RoleMenu.init({
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_role",
    },
    menuId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_menu",
    },
}, {
    sequelize,
    tableName: "role_menu",
    timestamps: false,
    indexes: [{ unique: true, fields: ["id_role", "id_menu"] }],
});
