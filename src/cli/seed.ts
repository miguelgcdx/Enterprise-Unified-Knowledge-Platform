import "dotenv/config";
import {fixtures} from "../fixtures.js";
import {ingest} from "../ingestion.js";
import {closeDb} from "../db.js";

try {
  for (const document of fixtures) {
    const result=await ingest(document);
    console.log(`${document.tenantId}/${document.source}/${document.externalId}: ${result.chunks} chunks`);
  }
} finally {
  await closeDb();
}
