import { NextFunction, Request, Response } from "express";
import { ProductService } from "./product.service.js";

export class ProductController {
  constructor(private readonly service = new ProductService()) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const changedByUserId = Number((req as any).user?.sub) || null;
      const result = await this.service.create(req.body, changedByUserId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const result = await this.service.findAll(search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.findById(id);
      res.json(result);
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

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const changedByUserId = Number((req as any).user?.sub) || null;
      const result = await this.service.remove(id, changedByUserId);
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
