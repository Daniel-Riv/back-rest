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
    "menu.nameRequired": "El nombre del menú es obligatorio",
    "menu.pathRequired": "La ruta del menú es obligatoria",
    "menu.pathTooLong": "La ruta no puede superar 255 caracteres",
    "menu.nameTooLong": "El nombre no puede superar 100 caracteres",
    "menu.iconTooLong": "El icono no puede superar 50 caracteres",
    "menu.invalidSortOrder": "El orden debe ser un número mayor o igual a 0",
    "menu.roleNotFound": "Rol no encontrado",
    "menu.invalidRoleId": "El id del rol debe ser un número entero positivo",
    "menu.menuIdsMustBeArray": "menuIds debe ser un array de números",
    "menu.menusNotFound": "Uno o más menús no existen",
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
    "menu.nameRequired": "Menu name is required",
    "menu.pathRequired": "Menu path is required",
    "menu.pathTooLong": "Path cannot exceed 255 characters",
    "menu.nameTooLong": "Name cannot exceed 100 characters",
    "menu.iconTooLong": "Icon cannot exceed 50 characters",
    "menu.invalidSortOrder": "Sort order must be a number greater than or equal to 0",
    "menu.roleNotFound": "Role not found",
    "menu.invalidRoleId": "Role id must be a positive integer",
    "menu.menuIdsMustBeArray": "menuIds must be an array of numbers",
    "menu.menusNotFound": "One or more menus do not exist",
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