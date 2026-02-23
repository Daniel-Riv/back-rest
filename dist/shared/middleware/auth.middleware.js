import jwt from "jsonwebtoken";
import { getLocale, t } from "../i18n/index.js";
export function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
        const locale = getLocale(req.headers["accept-language"]);
        return res.status(401).json({ message: t("auth.tokenRequired", locale) });
    }
    try {
        const token = auth.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch {
        const locale = getLocale(req.headers["accept-language"]);
        return res.status(401).json({ message: t("auth.invalidToken", locale) });
    }
}
