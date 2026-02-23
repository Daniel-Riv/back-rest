import { HttpError } from "../errors/HttpError.js";
import { getLocale, t } from "../i18n/index.js";
export function errorHandler(err, req, res, next) {
    const locale = getLocale(req.headers["accept-language"]);
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            message: t(err.message, locale),
        });
    }
    console.error(err);
    void next;
    return res.status(500).json({
        message: t("errors.internal", locale),
    });
}
