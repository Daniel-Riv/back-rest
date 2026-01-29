import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getLocale, t } from "../i18n/index.js";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    const locale = getLocale(req.headers["accept-language"] as string | undefined);
    return res.status(401).json({ message: t("auth.tokenRequired", locale) });  }

  try {
    const token = auth.split(" ")[1];
    (req as any).user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    const locale = getLocale(req.headers["accept-language"] as string | undefined);
    return res.status(401).json({ message: t("auth.invalidToken", locale) });
    }
}
