import { Request, Response, NextFunction } from "express";
import { MenuService } from "./menu.service.js";

export class MenuController {
  constructor(private readonly service = new MenuService()) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menu = await this.service.create(req.body);
      res.status(201).json(menu);
    } catch (error) {
      next(error);
    }
  };


  getMenusByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = Number(req.params.roleId);
      const result = await this.service.getMenusByRole(roleId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
  assignMenusToRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = Number(req.params.roleId);
      const { menuIds } = req.body as { menuIds?: number[] };
      const result = await this.service.assignMenusToRole(roleId, menuIds ?? []);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
