import type {SearchHit} from "./retrieval.js";

// Retrieval quality is measured against known relevant chunk/document IDs,
// not by asking the answer model whether it sounds plausible.
export function precisionAtK(returned:string[],relevant:Set<string>,k:number) {
  if (k < 1) throw new Error("k must be positive");
  return returned.slice(0,k).filter(x=>relevant.has(x)).length/k;
}
export function recallAtK(returned:string[],relevant:Set<string>,k:number) {
  if (k < 1) throw new Error("k must be positive");
  if (!relevant.size) return 1;
  return returned.slice(0,k).filter(x=>relevant.has(x)).length/relevant.size;
}

export function sourceIds(hits:SearchHit[]) {
  return hits.map(x=>x.source+":"+x.externalId);
}
