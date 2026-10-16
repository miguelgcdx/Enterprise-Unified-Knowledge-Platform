# Enterprise Unified Knowledge Platform

A TypeScript learning project for multi-source, permission-aware enterprise retrieval.

**Implemented now:** simulated Drive/SharePoint/Slack adapters via a normalized document contract, LangChain.js chunking, AI SDK/Ollama embeddings, PostgreSQL + pgvector storage, authorized keyword/vector search with RRF fusion, grounded answer generation, and a local Express API.

**Not yet implemented:** real provider OAuth/sync connectors, PDF/Word parsers, BullMQ/Redis workers, access control backed by verified user identity, permission change polling, reranking, eve runtime integration, Next.js dashboard, and production infrastructure. Do not deploy with real company information.

## Run (local learning environment)

Requires Node.js 22+, pnpm, Docker, and Ollama.

```bash
git clone https://github.com/miguelgcdx/Enterprise-Unified-Knowledge-Platform
cd Enterprise-Unified-Knowledge-Platform
pnpm install
cp .env.example .env
pnpm db:up
ollama pull nomic-embed-text
ollama pull llama3.2:3b
pnpm db:migrate
pnpm seed
pnpm api
```

Ollama must be running (in another terminal: `ollama serve` unless already running as a service).

Try retrieval:

```bash
pnpm search "CRM sync reporting issue"
```

Try authenticated-demo search (ONLY local):

```bash
curl -s http://localhost:3001/search -H 'Content-Type: application/json' -H 'x-demo-tenant: acme' -H 'x-demo-user: bob' -d '{"query":"enterprise contract discount"}'
```

Bob should **not** retrieve the restricted contract. Alice is granted that document:

```bash
curl -s http://localhost:3001/ask -H 'Content-Type: application/json' -H 'x-demo-tenant: acme' -H 'x-demo-user: alice' -d '{"question":"When does the enterprise discount end?"}'
```

```bash
pnpm typecheck
pnpm test
```

## Security boundary

- SQL queries require both tenant identity and a matching document grant.
- These two identities currently come from spoofable **demo headers** and are rejected when NODE_ENV is not development.
- Never ship this server to a public network without replacing the demo headers with verified identity, membership and revocation-aware source authorization.
- Provider connectors must preserve source ACLs and propagate deletions.
- Never make a vector DB a source of truth for transactional data.

## Architecture

```text
Ingestion adapter → SourceDocument → LangChain splitter → AI SDK embeddings
                                           ↓
                                Postgres + pgvector / FTS
                                           ↓
                      authorized hybrid retrieval + RRF
                                           ↓
                                AI SDK answer + citations
```

The `ingest()` replacement transaction is idempotent for a stable (tenant, source, externalId) and replaces outdated chunks and document grants. Embedding calls occur *before* the transaction and can be retried independently.
