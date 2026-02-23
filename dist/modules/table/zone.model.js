import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
export class Zone extends Model {
}
Zone.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    color: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "#38BDF8" },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "sort_order",
    },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
}, {
    sequelize,
    tableName: "zones",
    timestamps: false,
});
