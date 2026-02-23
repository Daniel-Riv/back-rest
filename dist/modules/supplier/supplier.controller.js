import { SupplierService } from "./supplier.service.js";
export class SupplierController {
    service;
    constructor(service = new SupplierService()) {
        this.service = service;
    }
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
    list = async (req, res, next) => {
        try {
            const search = typeof req.query.search === "string" ? req.query.search : undefined;
            const result = await this.service.findAll(search);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const result = await this.service.findById(id);
            res.json(result);
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
    remove = async (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const changedByUserId = Number(req.user?.sub) || null;
            const result = await this.service.remove(id, changedByUserId);
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
