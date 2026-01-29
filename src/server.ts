import 'dotenv/config';
import { createApp } from "./app.js";
import { initDb } from "./config/database.js";

async function bootstrap() {
  await initDb();
  const app = createApp();
  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}
bootstrap().catch(err => {
  console.error("❌ Error starting server:", err);
});