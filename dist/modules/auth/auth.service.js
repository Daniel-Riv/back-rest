import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository.js";
import { HttpError } from "../../shared/errors/HttpError.js";
import { DEFAULT_ROLE_IDS } from "../rol/role.constants.js";
const DEFAULT_USER_COLORS = {
    primary: "#0EA5E9",
    secondary: "#111827",
    tertiary: "#F8FAFC",
};
export class AuthService {
    repo;
    constructor(repo = new AuthRepository()) {
        this.repo = repo;
    }
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !regex.test(email)) {
            throw new HttpError(400, "auth.invalidEmail");
        }
    }
    validatePassword(password) {
        if (!password || password.length < 8) {
            throw new HttpError(400, "auth.passwordMinLength");
        }
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            throw new HttpError(400, "auth.passwordRequiresUppercaseNumber");
        }
    }
    normalizeColors(colors) {
        const merged = {
            primary: colors?.primary ?? DEFAULT_USER_COLORS.primary,
            secondary: colors?.secondary ?? DEFAULT_USER_COLORS.secondary,
            tertiary: colors?.tertiary ?? DEFAULT_USER_COLORS.tertiary,
        };
        const isValidColor = (value) => /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value.trim());
        if (!isValidColor(merged.primary) ||
            !isValidColor(merged.secondary) ||
            !isValidColor(merged.tertiary)) {
            throw new HttpError(400, "auth.invalidColors");
        }
        return {
            primary: merged.primary.trim(),
            secondary: merged.secondary.trim(),
            tertiary: merged.tertiary.trim(),
        };
    }
    async register(data) {
        const { email, password, name, lastName, phone, country, colors } = data;
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
        const normalizedColors = this.normalizeColors(colors);
        const user = await this.repo.createUser({
            email,
            password: hashedPassword,
            name,
            lastName,
            phone,
            country,
            colors: normalizedColors,
        });
        await user.addRole(DEFAULT_ROLE_IDS.MESERO);
        return this.generateAuthResponse(user.id, user.email, [DEFAULT_ROLE_IDS.MESERO], user.colors);
    }
    async login(email, password) {
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
        return this.generateAuthResponse(user.id, user.email, roleIds, user.colors ?? DEFAULT_USER_COLORS);
    }
    generateAuthResponse(userId, email, roleIds, colors) {
        const token = jwt.sign({
            sub: userId,
            email,
            roleIds,
            colors,
        }, process.env.JWT_SECRET, { expiresIn: "8h" });
        return {
            token,
            user: {
                id: userId,
                email,
                roleIds,
                colors,
            },
        };
    }
}
