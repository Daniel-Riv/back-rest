import { Sequelize } from "sequelize";
import 'dotenv/config';

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mariadb",
    logging: false,
  }
);

export async function initDb() {
  console.log("⏳ Conectando a la base de datos...");
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
}
