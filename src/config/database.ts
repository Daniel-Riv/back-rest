import { sequelize } from "./sequelize.js";
import { initAssociations } from "./associations.js";

export async function initDb() {
  console.log("⏳ Conectando a la base de datos...");
  await sequelize.authenticate();
  initAssociations();
  await sequelize.sync({ alter: true });
  console.log("✅ Base de datos lista");
}
