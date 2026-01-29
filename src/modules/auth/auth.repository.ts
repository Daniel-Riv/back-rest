import { User } from "./auth.model.js";
import { Role } from "../rol/roles.model.js";

export class AuthRepository {
  async findByEmail(email: string) {
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

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    lastName: string;
    phone?: string;
    country: string;
  }) {
    return User.create({
      email: data.email,
      password: data.password,
      name: data.name,
      lastName: data.lastName,
      phone: data.phone ?? null,
      country: data.country,
      status: 1,
    });
  }
}
