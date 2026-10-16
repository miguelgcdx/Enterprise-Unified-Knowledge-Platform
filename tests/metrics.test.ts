import {expect,it} from "vitest";
import {precisionAtK,recallAtK} from "../src/metrics.js";

it("calculates retrieval precision and recall",()=>{
  const relevant=new Set(["a","b","c"]);
  expect(precisionAtK(["a","x","b"],relevant,3)).toBeCloseTo(2/3);
  expect(recallAtK(["a","x","b"],relevant,3)).toBeCloseTo(2/3);
});
