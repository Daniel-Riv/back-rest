import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository.js";
import { HttpError } from "../../shared/errors/HttpError.js";
import { DEFAULT_ROLE_IDS } from "../rol/role.constants.js";

export class AuthService {
  constructor(private readonly repo = new AuthRepository()) {}

  private validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !regex.test(email)) {
      throw new HttpError(400, "Email inválido");
    }
  }

  private validatePassword(password: string) {
    if (!password || password.length < 8) {
      throw new HttpError(400, "La contraseña debe tener mínimo 8 caracteres");
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new HttpError(
        400,
        "La contraseña debe contener una mayúscula y un número"
      );
    }
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    lastName: string;
    phone?: string;
    country: string;
  }) {
    const { email, password, name, lastName, phone, country } = data;

    this.validateEmail(email);
    this.validatePassword(password);

    if (!name || !lastName) {
      throw new HttpError(400, "Nombre y apellidos son obligatorios");
    }
    if (!country) {
      throw new HttpError(400, "El país es obligatorio");
    }

    const exists = await this.repo.findByEmail(email);
    if (exists) {
      throw new HttpError(409, "El usuario ya existe");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.repo.createUser({
      email,
      password: hashedPassword,
      name,
      lastName,
      phone,
      country,
    });

    // ✅ asignación por ID (correcto)
    await (user as any).$add("roles", DEFAULT_ROLE_IDS.MESERO);

    return this.generateAuthResponse(
      user.id,
      user.email,
      [DEFAULT_ROLE_IDS.MESERO]
    );
  }

  async login(email: string, password: string) {
    this.validateEmail(email);

    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new HttpError(401, "Credenciales inválidas");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new HttpError(401, "Credenciales inválidas");
    }

    const roleIds = (user.roles ?? []).map((r) => r.id);

    if (roleIds.length === 0) {
      throw new HttpError(403, "El usuario no tiene roles asignados");
    }

    return this.generateAuthResponse(user.id, user.email, roleIds);
  }

  private generateAuthResponse(
    userId: number,
    email: string,
    roleIds: number[]
  ) {
    const token = jwt.sign(
      {
        sub: userId,
        email,
        roleIds,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    return {
      token,
      user: {
        id: userId,
        email,
        roleIds,
      },
    };
  }
}
