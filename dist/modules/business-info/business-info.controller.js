import { BusinessInfoService } from "./business-info.service.js";
export class BusinessInfoController {
    service;
    constructor(service = new BusinessInfoService()) {
        this.service = service;
    }
    getCurrent = async (_req, res, next) => {
        try {
            const result = await this.service.getCurrent();
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    create = async (req, res, next) => {
        try {
            const changedByUserId = Number(req.user?.sub) || null;
            const result = await this.service.create(req.body, changedByUserId);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const changedByUserId = Number(req.user?.sub) || null;
            const result = await this.service.update(id, req.body, changedByUserId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    getHistory = async (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const result = await this.service.getHistory(id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
}
