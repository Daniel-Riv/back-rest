import "dotenv/config";
import { sequelize } from "../config/sequelize.js";
import { initAssociations } from "../config/associations.js";
import { Role } from "../modules/rol/roles.model.js";

const ROLES = [
  { id: 1, name: "Admin", status: 1 },
  { id: 2, name: "Cocina", status: 1 },
  { id: 3, name: "Mesero", status: 1 },
];

async function seedRoles() {
  console.log("⏳ Conectando a la base de datos...");
  await sequelize.authenticate();
  initAssociations();
  console.log("⏳ Insertando roles...");
  await Role.bulkCreate(ROLES, {
    updateOnDuplicate: ["name", "status"],
  });
  console.log("✅ Roles creados:", ROLES.map((r) => r.name).join(", "));
  await sequelize.close();
}

seedRoles().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
