import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(
    private readonly service = new AuthService()
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
  

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
