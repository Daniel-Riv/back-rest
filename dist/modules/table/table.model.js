import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
export class RestaurantTable extends Model {
}
RestaurantTable.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    zoneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_zone",
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    accessCode: {
        type: DataTypes.STRING(60),
        allowNull: true,
        field: "access_code",
    },
    isDeliveryOrCash: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_delivery_or_cash",
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "sort_order",
    },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
}, {
    sequelize,
    tableName: "restaurant_tables",
    timestamps: false,
    indexes: [{ fields: ["id_zone", "sort_order"] }],
});
