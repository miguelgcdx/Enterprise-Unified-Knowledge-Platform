import "dotenv/config";
import pg from "pg";

export const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? "postgres://knowledge:knowledge@localhost:5432/knowledge",
  max: 10,
});

// Parameterize values in SQL; never interpolate user strings into statements.
export async function closeDb() {
  await db.end();
}
