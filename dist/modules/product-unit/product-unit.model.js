import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
export class ProductUnit extends Model {
}
ProductUnit.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(80), allowNull: false },
    shortName: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "short_name",
    },
    description: {
        type: DataTypes.STRING(255),
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
}, {
    sequelize,
    tableName: "product_unit",
    timestamps: true,
});
