import type { SourceDocument } from "./ingestion.js";

// Illustrative fixtures. Source adapters will eventually map provider objects
// into the SourceDocument contract and propagate real authorization metadata.
export const fixtures:SourceDocument[]=[
  {tenantId:"acme",source:"drive",externalId:"policy-1",title:"Renewal Policy",
   readers:["alice","bob"],body:"Acme Logistics customer renewals are reviewed 45 days before contract expiry. Escalations with open severity-one incidents require a support owner review before renewal terms are proposed."},
  {tenantId:"acme",source:"sharepoint",externalId:"contract-1",title:"Acme Enterprise Contract",
   readers:["alice"],body:"The Acme Logistics enterprise contract includes a 12 percent discount through December 2026. After the promotional period pricing returns to the contracted base rate. Finance must authorize any new discount."},
  {tenantId:"acme",source:"slack",externalId:"thread-1",title:"Operations escalation thread",
   readers:["alice","bob"],body:"Operations discussed a failed nightly CRM sync affecting reporting. The team opened a critical investigation and assigned it to the integration owner. The root cause is not yet confirmed."},
  {tenantId:"othercorp",source:"drive",externalId:"secret-1",title:"Othercorp confidential plan",
   readers:["charlie"],body:"Othercorp confidential acquisition project named Orion. This must not appear in Acme results."},
];
