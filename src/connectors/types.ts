import type {SourceDocument} from "../ingestion.js";

// Each real SaaS connector should map its provider's records and grants into
// this normalized shape. No connector may invent reader ACLs.
export interface Connector {
  source:string;
  listChanges(cursor?:string):Promise<{documents:SourceDocument[];deleted:string[];nextCursor?:string}>;
}
