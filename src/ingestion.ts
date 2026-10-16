import { createHash } from "node:crypto";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { db } from "./db.js";
import { embedDocuments, pgVector } from "./embeddings.js";

export type SourceDocument = {
  tenantId: string; source: string; externalId: string;
  title: string; body: string; readers: string[];
  metadata?: Record<string, unknown>;
};

const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 120 });

export async function ingest(document: SourceDocument) {
  if (!document.body.trim()) throw new Error("Empty source document");
  // The source ID is stable: reruns replace obsolete chunks instead of duplicating data.
  const version = createHash("sha256").update(document.body).digest("hex");
  const parts = await splitter.splitText(document.body);
  const vectors = await embedDocuments(parts);
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO tenants(id,name) VALUES ($1,$1) ON CONFLICT (id) DO NOTHING`,
      [document.tenantId],
    );
    await client.query(
      `INSERT INTO documents(tenant_id,source,external_id,title,body,metadata,version,deleted_at)
       VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,NULL)
       ON CONFLICT(tenant_id,source,external_id) DO UPDATE
       SET title=EXCLUDED.title,body=EXCLUDED.body,metadata=EXCLUDED.metadata,
           version=EXCLUDED.version,updated_at=now(),deleted_at=NULL`,
      [document.tenantId, document.source, document.externalId, document.title,
       document.body, JSON.stringify(document.metadata ?? {}),version],
    );
    await client.query(
      "DELETE FROM chunks WHERE tenant_id=$1 AND source=$2 AND external_id=$3",
      [document.tenantId,document.source,document.externalId],
    );
    for (let i=0;i<parts.length;i++) {
      await client.query(
        `INSERT INTO chunks(tenant_id,source,external_id,chunk_index,content,embedding)
         VALUES($1,$2,$3,$4,$5,$6::vector)`,
        [document.tenantId,document.source,document.externalId,i,parts[i],pgVector(vectors[i])],
      );
    }
    await client.query(
      "DELETE FROM access_grants WHERE tenant_id=$1 AND source=$2 AND external_id=$3",
      [document.tenantId,document.source,document.externalId],
    );
    for (const userId of new Set(document.readers)) {
      await client.query(
        `INSERT INTO access_grants(tenant_id,user_id,source,external_id)
         VALUES($1,$2,$3,$4)`,
        [document.tenantId,userId,document.source,document.externalId],
      );
    }
    await client.query("COMMIT");
    return { version, chunks:parts.length };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export async function deleteSourceDocument(tenantId:string,source:string,externalId:string) {
  // Deleting a document also cascades its chunks and grants.
  await db.query("DELETE FROM documents WHERE tenant_id=$1 AND source=$2 AND external_id=$3",
    [tenantId,source,externalId]);
}
