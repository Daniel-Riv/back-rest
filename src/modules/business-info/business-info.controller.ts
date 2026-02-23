import { NextFunction, Request, Response } from "express";
import { BusinessInfoService } from "./business-info.service.js";

export class BusinessInfoController {
  constructor(private readonly service = new BusinessInfoService()) {}

  getCurrent = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getCurrent();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const changedByUserId = Number((req as any).user?.sub) || null;
      const result = await this.service.create(req.body, changedByUserId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const changedByUserId = Number((req as any).user?.sub) || null;
      const result = await this.service.update(id, req.body, changedByUserId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.getHistory(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
