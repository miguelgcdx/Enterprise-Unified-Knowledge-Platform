CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS tenants (
  id text PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  tenant_id text NOT NULL REFERENCES tenants(id),
  source text NOT NULL,
  external_id text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  version text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  PRIMARY KEY(tenant_id,source,external_id)
);

-- Each chunk inherits the source document ACL; retrieval checks membership
-- BEFORE any result leaves PostgreSQL.
CREATE TABLE IF NOT EXISTS chunks (
  id bigserial PRIMARY KEY,
  tenant_id text NOT NULL,
  source text NOT NULL,
  external_id text NOT NULL,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(768) NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english',content)) STORED,
  UNIQUE(tenant_id,source,external_id,chunk_index),
  FOREIGN KEY(tenant_id,source,external_id)
    REFERENCES documents(tenant_id,source,external_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS chunks_vector_hnsw ON chunks USING hnsw(embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS chunks_full_text ON chunks USING gin(search_vector);
CREATE INDEX IF NOT EXISTS chunks_scope ON chunks(tenant_id,source,external_id);

CREATE TABLE IF NOT EXISTS access_grants (
  tenant_id text NOT NULL REFERENCES tenants(id),
  user_id text NOT NULL,
  source text NOT NULL,
  external_id text NOT NULL,
  PRIMARY KEY (tenant_id,user_id,source,external_id),
  FOREIGN KEY(tenant_id,source,external_id)
    REFERENCES documents(tenant_id,source,external_id) ON DELETE CASCADE
);
