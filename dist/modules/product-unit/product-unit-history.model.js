import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
export class ProductUnitHistory extends Model {
}
ProductUnitHistory.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productUnitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "product_unit_id",
    },
    changedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "changed_by_user_id",
    },
    action: {
        type: DataTypes.ENUM("create", "update", "delete"),
        allowNull: false,
    },
    changedFields: {
        type: DataTypes.JSON,
        allowNull: false,
        field: "changed_fields",
    },
    snapshot: {
        type: DataTypes.JSON,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "product_unit_history",
    updatedAt: false,
});
