import { sequelize } from "./sequelize.js";
import { initAssociations } from "./associations.js";

export async function initDb() {
  console.log("⏳ Conectando a la base de datos...");
  await sequelize.authenticate();
  initAssociations();
  const shouldAlter = process.env.DB_SYNC_ALTER === "true";
  await sequelize.sync(shouldAlter ? { alter: true } : undefined);
  console.log("✅ Base de datos lista");
}
