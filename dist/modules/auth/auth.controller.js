import { AuthService } from "./auth.service.js";
export class AuthController {
    service;
    constructor(service = new AuthService()) {
        this.service = service;
    }
    register = async (req, res, next) => {
        try {
            const result = await this.service.register(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await this.service.login(email, password);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    };
}
