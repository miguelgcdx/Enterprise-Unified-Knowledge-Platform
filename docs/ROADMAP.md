# Implementation roadmap

## Stage 1 — Storage ✅
- pgvector + full-text schema
- per-tenant documents, stable external IDs, source ACL grants

## Stage 2 — Ingestion foundation ✅
- normalized source contract
- LangChain.js text splitting
- local Ollama embeddings via AI SDK
- replacement/deletion functions
- simulated Drive/SharePoint/Slack documents

## Stage 3 — Retrieval foundation ✅
- tenant + reader filtered lexical/vector search
- RRF fusion and grounded answer endpoint
- deterministic rank fusion and metric tests

## Stage 4 — Real connectors (TODO)
- provider-specific OAuth and paginated API access
- mapping actual ACLs and incremental provider cursors
- ingestion of PDFs, Word, websites, emails and files
- robust content extraction and source metadata
- connector verification and backfill jobs

## Stage 5 — Production synchronization (TODO)
- BullMQ workers, retries and dead-letter handling
- source deletions and permission revocation pipelines
- quotas, incremental sync, webhook deduplication
- SQL/analytics retrieval alongside document retrieval

## Stage 6 — Product surface (TODO)
- Next.js authenticated dashboard and search
- source configuration, job history, audit trail
- integration with eve through tools/MCP
- human review, reranking providers, eval datasets
- CI/CD and secure deployment

**This is a learning foundation, not a finished enterprise platform.** 
