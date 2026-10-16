import { readFile } from "node:fs/promises";
import { db, closeDb } from "../db.js";
const sql = await readFile(new URL("../schema.sql", import.meta.url), "utf8");
try {
  await db.query(sql);
  console.log("Schema ready");
} finally {
  await closeDb();
}
