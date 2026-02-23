import { User } from "../modules/auth/auth.model.js";
import { Role } from "../modules/rol/roles.model.js";
import { UserRole } from "../modules/auth/user-role.model.js";
import { Menu } from "../modules/menu/menu.model.js";
import { RoleMenu } from "../modules/menu/role-menu.model.js";
import { Submenu } from "../modules/menu/submenu.model.js";
import { Zone } from "../modules/table/zone.model.js";
import { RestaurantTable } from "../modules/table/table.model.js";
import { BusinessInfo } from "../modules/business-info/business-info.model.js";
import { BusinessInfoHistory } from "../modules/business-info/business-info-history.model.js";
import { ProductCategory } from "../modules/product-category/product-category.model.js";
import { ProductCategoryHistory } from "../modules/product-category/product-category-history.model.js";
import { ProductUnit } from "../modules/product-unit/product-unit.model.js";
import { ProductUnitHistory } from "../modules/product-unit/product-unit-history.model.js";
import { Ingredient } from "../modules/ingredient/ingredient.model.js";
import { IngredientHistory } from "../modules/ingredient/ingredient-history.model.js";
import { Supplier } from "../modules/supplier/supplier.model.js";
import { SupplierHistory } from "../modules/supplier/supplier-history.model.js";
import { Product } from "../modules/product/product.model.js";
import { ProductVariant } from "../modules/product/product-variant.model.js";
import { ProductHistory } from "../modules/product/product-history.model.js";
export function initAssociations() {
    User.belongsToMany(Role, {
        through: UserRole,
        foreignKey: "userId",
        otherKey: "roleId",
        as: "roles",
    });
    Role.belongsToMany(User, {
        through: UserRole,
        foreignKey: "roleId",
        otherKey: "userId",
        as: "users",
    });
    Role.belongsToMany(Menu, {
        through: RoleMenu,
        foreignKey: "roleId",
        otherKey: "menuId",
        as: "menus",
    });
    Menu.belongsToMany(Role, {
        through: RoleMenu,
        foreignKey: "menuId",
        otherKey: "roleId",
        as: "roles",
    });
    Menu.belongsTo(Menu, { foreignKey: "parentId", as: "parent" });
    Menu.hasMany(Menu, { foreignKey: "parentId", as: "children" });
    Menu.hasMany(Submenu, { foreignKey: "menuId", as: "submenus" });
    Submenu.belongsTo(Menu, { foreignKey: "menuId", as: "menu" });
    Zone.hasMany(RestaurantTable, { foreignKey: "zoneId", as: "tables" });
    RestaurantTable.belongsTo(Zone, { foreignKey: "zoneId", as: "zone" });
    BusinessInfo.hasMany(BusinessInfoHistory, {
        foreignKey: "businessInfoId",
        as: "history",
    });
    BusinessInfoHistory.belongsTo(BusinessInfo, {
        foreignKey: "businessInfoId",
        as: "businessInfo",
    });
    User.hasMany(BusinessInfoHistory, {
        foreignKey: "changedByUserId",
        as: "businessInfoChanges",
    });
    BusinessInfoHistory.belongsTo(User, {
        foreignKey: "changedByUserId",
        as: "changedBy",
    });
    ProductCategory.hasMany(ProductCategoryHistory, {
        foreignKey: "productCategoryId",
        as: "history",
    });
    ProductCategoryHistory.belongsTo(ProductCategory, {
        foreignKey: "productCategoryId",
        as: "productCategory",
    });
    User.hasMany(ProductCategoryHistory, {
        foreignKey: "changedByUserId",
        as: "productCategoryChanges",
    });
    ProductCategoryHistory.belongsTo(User, {
        foreignKey: "changedByUserId",
        as: "changedBy",
    });
    ProductUnit.hasMany(ProductUnitHistory, {
        foreignKey: "productUnitId",
        as: "history",
    });
    ProductUnitHistory.belongsTo(ProductUnit, {
        foreignKey: "productUnitId",
        as: "productUnit",
    });
    User.hasMany(ProductUnitHistory, {
        foreignKey: "changedByUserId",
        as: "productUnitChanges",
    });
    ProductUnitHistory.belongsTo(User, {
        foreignKey: "changedByUserId",
        as: "changedBy",
    });
    ProductCategory.hasMany(Ingredient, {
        foreignKey: "productCategoryId",
        as: "ingredients",
    });
    Ingredient.belongsTo(ProductCategory, {
        foreignKey: "productCategoryId",
        as: "category",
    });
    ProductUnit.hasMany(Ingredient, {
        foreignKey: "productUnitId",
        as: "ingredients",
    });
    Ingredient.belongsTo(ProductUnit, {
        foreignKey: "productUnitId",
        as: "unit",
    });
    Ingredient.hasMany(IngredientHistory, {
        foreignKey: "ingredientId",
        as: "history",
    });
    IngredientHistory.belongsTo(Ingredient, {
        foreignKey: "ingredientId",
        as: "ingredient",
    });
    User.hasMany(IngredientHistory, {
        foreignKey: "changedByUserId",
        as: "ingredientChanges",
    });
    IngredientHistory.belongsTo(User, {
        foreignKey: "changedByUserId",
        as: "changedBy",
    });
    Supplier.hasMany(SupplierHistory, {
        foreignKey: "supplierId",
        as: "history",
    });
    SupplierHistory.belongsTo(Supplier, {
        foreignKey: "supplierId",
        as: "supplier",
    });
    User.hasMany(SupplierHistory, {
        foreignKey: "changedByUserId",
        as: "supplierChanges",
    });
    SupplierHistory.belongsTo(User, {
        foreignKey: "changedByUserId",
        as: "changedBy",
    });
    ProductCategory.hasMany(Product, {
        foreignKey: "productCategoryId",
        as: "products",
    });
    Product.belongsTo(ProductCategory, {
        foreignKey: "productCategoryId",
        as: "category",
    });
    Product.hasMany(ProductVariant, {
        foreignKey: "productId",
        as: "variants",
    });
    ProductVariant.belongsTo(Product, {
        foreignKey: "productId",
        as: "product",
    });
    Product.hasMany(ProductHistory, {
        foreignKey: "productId",
        as: "history",
    });
    ProductHistory.belongsTo(Product, {
        foreignKey: "productId",
        as: "product",
    });
    User.hasMany(ProductHistory, {
        foreignKey: "changedByUserId",
        as: "productChanges",
    });
    ProductHistory.belongsTo(User, {
        foreignKey: "changedByUserId",
        as: "changedBy",
    });
}
