import { Menu } from "./menu.model.js";
import { Op } from "sequelize";
import { Submenu } from "./submenu.model.js";
export class MenuRepository {
    async create(data) {
        return Menu.create({
            name: data.name,
            path: data.path,
            icon: data.icon ?? null,
            parentId: data.parentId ?? null,
            sortOrder: data.sortOrder ?? 0,
            status: 1,
        });
    }
    async findByIds(ids) {
        if (ids.length === 0) {
            return [];
        }
        return Menu.findAll({
            where: { id: { [Op.in]: ids } },
            include: [
                {
                    model: Submenu,
                    as: "submenus",
                    required: false,
                },
            ],
            order: [
                ["sortOrder", "ASC"],
                ["id", "ASC"],
                [{ model: Submenu, as: "submenus" }, "sortOrder", "ASC"],
                [{ model: Submenu, as: "submenus" }, "id", "ASC"],
            ],
        });
    }
}
