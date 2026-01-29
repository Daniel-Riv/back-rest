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
      throw new HttpError(400, "auth.invalidEmail");
    }
  }

  private validatePassword(password: string) {
    if (!password || password.length < 8) {
      throw new HttpError(400, "auth.passwordMinLength");
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new HttpError(400, "auth.passwordRequiresUppercaseNumber");
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
      throw new HttpError(400, "auth.nameLastNameRequired");
    }
    if (!country) {
      throw new HttpError(400, "auth.countryRequired");
    }

    const exists = await this.repo.findByEmail(email);
    if (exists) {
      throw new HttpError(409, "auth.userExists");
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

    await (user as any).addRole(DEFAULT_ROLE_IDS.MESERO);

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
      throw new HttpError(401, "auth.invalidCredentials");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new HttpError(401, "auth.invalidCredentials");
    }

    const roleIds = (user.roles ?? []).map((r) => r.id);

    if (roleIds.length === 0) {
      throw new HttpError(403, "auth.noRolesAssigned");
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
