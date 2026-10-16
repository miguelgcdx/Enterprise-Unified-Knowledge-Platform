import "dotenv/config";
import express from "express";
import { z } from "zod";
import { db } from "./db.js";
import { searchKnowledge } from "./retrieval.js";
import { answerQuestion } from "./answer.js";

const app=express();
app.use(express.json({limit:"32kb"}));

const questionSchema=z.object({question:z.string().min(3).max(1000)});
const searchSchema=z.object({query:z.string().min(2).max(1000)});

// A deliberate fail-closed local learning server, NOT deployable auth.
// Production requires verified sessions, company membership and source ACLs.
function localIdentity(req:express.Request,res:express.Response,next:express.NextFunction) {
  if (process.env.NODE_ENV !== "development") {
    res.status(503).json({error:"Configure production authentication before deploying"});
    return;
  }
  const tenantId=req.header("x-demo-tenant");
  const userId=req.header("x-demo-user");
  if (!tenantId || !userId) {
    res.status(401).json({error:"Use x-demo-tenant and x-demo-user locally"});
    return;
  }
  res.locals.identity={tenantId,userId};
  next();
}

app.get("/health",async (_req,res)=>{
  try {await db.query("SELECT 1");res.json({ok:true});}
  catch {res.status(503).json({ok:false});}
});

app.post("/search",localIdentity,async (req,res)=>{
  const parsed=searchSchema.safeParse(req.body);
  if (!parsed.success){res.status(400).json({error:"Invalid query"});return;}
  try {
    res.json({hits:await searchKnowledge({...res.locals.identity,query:parsed.data.query})});
  } catch(error) {
    console.error("search failed",error);
    res.status(500).json({error:"Search unavailable"});
  }
});

app.post("/ask",localIdentity,async(req,res)=>{
  const parsed=questionSchema.safeParse(req.body);
  if (!parsed.success){res.status(400).json({error:"Invalid question"});return;}
  try {
    res.json(await answerQuestion({...res.locals.identity,question:parsed.data.question}));
  } catch(error) {
    console.error("answer failed",error);
    res.status(500).json({error:"Answer unavailable"});
  }
});
const port=Number(process.env.PORT ?? 3001);
app.listen(port,()=>console.log(`Knowledge API listening on http://localhost:${port}`));
