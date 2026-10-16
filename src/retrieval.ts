import { db } from "./db.js";
import { embedQuery, pgVector } from "./embeddings.js";

export type SearchHit = {
  id: number; source: string; externalId: string;
  title: string; content: string; score: number;
};

// Reciprocal Rank Fusion combines independently ranked keyword/vector results.
// It avoids assuming their raw scoring scales are compatible.
export function fuseRanks<T extends {id: number}>(groups: T[][], limit=8) {
  const scores = new Map<number,{item:T;score:number}>();
  for (const group of groups) {
    group.forEach((item,index) => {
      const old = scores.get(item.id);
      scores.set(item.id,{item,score:(old?.score ?? 0)+1/(60+index+1)});
    });
  }
  return [...scores.values()]
    .sort((a,b)=>b.score-a.score)
    .slice(0,limit)
    .map(({item,score})=>({...item,score}));
}

type RawHit = Omit<SearchHit,"score">;

// EVERY query joins access_grants before results are returned.
// Never rely on the LLM to obey document permissions.
const allowed = `
  FROM chunks c
  JOIN documents d ON d.tenant_id=c.tenant_id
    AND d.source=c.source AND d.external_id=c.external_id
  JOIN access_grants a ON a.tenant_id=c.tenant_id
    AND a.source=c.source AND a.external_id=c.external_id
  WHERE c.tenant_id=$1 AND a.user_id=$2 AND d.deleted_at IS NULL
`;

const selected = `
  SELECT c.id,d.source,d.external_id AS "externalId",d.title,c.content
`;

export async function searchKnowledge(input:{
  tenantId:string; userId:string; query:string; limit?:number
}):Promise<SearchHit[]> {
  const {tenantId,userId,query} = input;
  const limit=Math.min(Math.max(input.limit ?? 6,1),20);
  const embedding=pgVector(await embedQuery(query));
  const [semantic,lexical]=await Promise.all([
    db.query<RawHit>(
      selected + allowed + ` ORDER BY c.embedding <=> $3::vector LIMIT $4`,
      [tenantId,userId,embedding,limit*3],
    ),
    db.query<RawHit>(
      selected + allowed + `
      AND c.search_vector @@ websearch_to_tsquery('english',$3)
      ORDER BY ts_rank_cd(c.search_vector,websearch_to_tsquery('english',$3)) DESC
      LIMIT $4`,
      [tenantId,userId,query,limit*3],
    ),
  ]);
  return fuseRanks([lexical.rows,semantic.rows],limit);
}
