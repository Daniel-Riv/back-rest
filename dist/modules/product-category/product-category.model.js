import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
export class ProductCategory extends Model {
}
ProductCategory.init({
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
}, {
    sequelize,
    tableName: "product_category",
    timestamps: true,
});
