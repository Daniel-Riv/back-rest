import { User } from "./auth.model.js";

interface CreateUserInput {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    telefono?: string;
    pais: string;
  }
export class AuthRepository {

  findByEmail(email: string) {
    return User.findOne({ where: { email, estado: 1 } });
  }

  createUser(data: CreateUserInput) {
    return User.create({
      ...data,
      estado: 1,
    });
  }

}
