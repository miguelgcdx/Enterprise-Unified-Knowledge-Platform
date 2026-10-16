import "dotenv/config";
import {searchKnowledge} from "../retrieval.js";
import {closeDb} from "../db.js";
const query=process.argv.slice(2).join(" ") || "Why is Acme at risk of renewal?";
try {
  const results=await searchKnowledge({tenantId:"acme",userId:"bob",query});
  console.log(JSON.stringify(results,null,2));
} finally {
  await closeDb();
}
