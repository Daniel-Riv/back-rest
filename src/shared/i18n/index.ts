export type Locale = "es" | "en";

const DEFAULT_LOCALE: Locale = "es";

const MESSAGES: Record<Locale, Record<string, string>> = {
  es: {
    "auth.tokenRequired": "Token requerido",
    "auth.invalidToken": "Token inválido o expirado",
    "auth.invalidEmail": "Email inválido",
    "auth.passwordMinLength": "La contraseña debe tener mínimo 8 caracteres",
    "auth.passwordRequiresUppercaseNumber":
      "La contraseña debe contener una mayúscula y un número",
    "auth.nameLastNameRequired": "Nombre y apellidos son obligatorios",
    "auth.countryRequired": "El país es obligatorio",
    "auth.userExists": "El usuario ya existe",
    "auth.invalidCredentials": "Credenciales inválidas",
    "auth.noRolesAssigned": "El usuario no tiene roles asignados",
    "errors.internal": "Error interno del servidor",
  },
  en: {
    "auth.tokenRequired": "Token required",
    "auth.invalidToken": "Invalid or expired token",
    "auth.invalidEmail": "Invalid email",
    "auth.passwordMinLength": "Password must be at least 8 characters",
    "auth.passwordRequiresUppercaseNumber":
      "Password must contain an uppercase letter and a number",
    "auth.nameLastNameRequired": "Name and last name are required",
    "auth.countryRequired": "Country is required",
    "auth.userExists": "User already exists",
    "auth.invalidCredentials": "Invalid credentials",
    "auth.noRolesAssigned": "User has no assigned roles",
    "errors.internal": "Internal server error",
  },
};

export function getLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  const lang = acceptLanguage.split(",")[0]?.trim().toLowerCase();
  if (!lang) {
    return DEFAULT_LOCALE;
  }

  if (lang.startsWith("en")) {
    return "en";
  }

  if (lang.startsWith("es")) {
    return "es";
  }

  return DEFAULT_LOCALE;
}

export function t(key: string, locale: Locale) {
  return MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
}