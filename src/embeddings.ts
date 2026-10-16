import { embed, embedMany } from "ai";
import { ollama } from "ollama-ai-provider-v2";

const model = ollama.embedding(process.env.EMBEDDING_MODEL ?? "nomic-embed-text");

// nomic-embed-text convention: different prefixes for stored passages and searches.
export async function embedDocuments(texts: string[]) {
  if (!texts.length) return [];
  const { embeddings } = await embedMany({
    model,
    values: texts.map(text => "search_document: " + text),
  });
  return embeddings;
}

export async function embedQuery(query: string) {
  const { embedding } = await embed({ model, value: "search_query: " + query });
  return embedding;
}

export function pgVector(embedding: number[]): string {
  if (embedding.length !== 768 || embedding.some(x => !Number.isFinite(x))) {
    throw new Error("Expected a finite 768-dimensional nomic-embed-text vector");
  }
  return "[" + embedding.join(",") + "]";
}
