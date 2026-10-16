import "dotenv/config";
import { deleteSourceDocument } from "../ingestion.js";
import {closeDb} from "../db.js";

const [tenantId,source,externalId]=process.argv.slice(2);
if (!tenantId || !source || !externalId) {
  console.error("Usage: pnpm delete <tenant> <source> <externalId>");
  process.exit(1);
}
try {
  // A connector's deletion feed should call this when a source disappears.
  await deleteSourceDocument(tenantId,source,externalId);
  console.log("Deleted indexed document and access grants");
} finally {
  await closeDb();
}
