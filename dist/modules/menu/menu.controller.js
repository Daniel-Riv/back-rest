import { MenuService } from "./menu.service.js";
export class MenuController {
    service;
    constructor(service = new MenuService()) {
        this.service = service;
    }
    create = async (req, res, next) => {
        try {
            const menu = await this.service.create(req.body);
            res.status(201).json(menu);
        }
        catch (error) {
            next(error);
        }
    };
    getMenusByRole = async (req, res, next) => {
        try {
            const roleId = Number(req.params.roleId);
            const result = await this.service.getMenusByRole(roleId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    assignMenusToRole = async (req, res, next) => {
        try {
            const roleId = Number(req.params.roleId);
            const { menuIds } = req.body;
            const result = await this.service.assignMenusToRole(roleId, menuIds ?? []);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
}
