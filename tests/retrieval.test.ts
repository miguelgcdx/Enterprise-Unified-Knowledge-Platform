import {describe,it,expect} from "vitest";
import {fuseRanks} from "../src/retrieval.js";

describe("RRF retrieval fusion",()=>{
  it("rewards candidates found by both searches",()=>{
    const hits=fuseRanks([[{id:1},{id:2}],[{id:2},{id:3}]],3);
    expect(hits[0].id).toBe(2);
  });
  it("respects the result limit",()=>{
    expect(fuseRanks([[{id:1},{id:2},{id:3}]],2)).toHaveLength(2);
  });
});
