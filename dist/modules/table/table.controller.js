import { TableService } from "./table.service.js";
export class TableController {
    service;
    constructor(service = new TableService()) {
        this.service = service;
    }
    getWorkspace = async (_req, res, next) => {
        try {
            const result = await this.service.getWorkspace();
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    createZone = async (req, res, next) => {
        try {
            const result = await this.service.createZone(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    };
    updateZone = async (req, res, next) => {
        try {
            const zoneId = Number(req.params.zoneId);
            const result = await this.service.updateZone(zoneId, req.body);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    deleteZone = async (req, res, next) => {
        try {
            const zoneId = Number(req.params.zoneId);
            const result = await this.service.deleteZone(zoneId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    createTable = async (req, res, next) => {
        try {
            const result = await this.service.createTable(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    };
    updateTable = async (req, res, next) => {
        try {
            const tableId = Number(req.params.tableId);
            const result = await this.service.updateTable(tableId, req.body);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    deleteTable = async (req, res, next) => {
        try {
            const tableId = Number(req.params.tableId);
            const result = await this.service.deleteTable(tableId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
}
