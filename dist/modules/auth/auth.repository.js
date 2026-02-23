import { User } from "./auth.model.js";
import { Role } from "../rol/roles.model.js";
export class AuthRepository {
    async findByEmail(email) {
        return User.findOne({
            where: { email, status: 1 },
            include: [
                {
                    model: Role,
                    as: "roles",
                    attributes: ["id", "name"],
                    through: { attributes: [] },
                    required: false,
                },
            ],
        });
    }
    async createUser(data) {
        return User.create({
            email: data.email,
            password: data.password,
            name: data.name,
            lastName: data.lastName,
            phone: data.phone ?? null,
            country: data.country,
            colors: data.colors,
            status: 1,
        });
    }
    async findRoleByName(name) {
        return Role.findOne({ where: { name, status: 1 } });
    }
}
