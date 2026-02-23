import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
export class Submenu extends Model {
}
Submenu.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    menuId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_menu",
    },
    nameEs: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "name_es",
    },
    nameEn: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "name_en",
    },
    path: { type: DataTypes.STRING(255), allowNull: false },
    icon: { type: DataTypes.STRING(50), allowNull: true },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "sort_order",
    },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
}, {
    sequelize,
    tableName: "submenu",
    timestamps: false,
    indexes: [{ fields: ["id_menu", "sort_order"] }],
});
