import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { ValidateNode } from "./nodes/01_validate";
import { PlanNode } from "./nodes/02_plan";
import { ApproveNode } from "./nodes/03_approve";
import { ExecuteNode } from "./nodes/04_execute";
import { FinalizeNode } from "./nodes/05_finalize";

const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  steps: Annotation<string[] | undefined>,
  approved: Annotation<boolean | undefined>,
  results: Annotation < Array<{ step: string; note: string } | undefined>,
  status: Annotation<"planned" | "done" | "cancelled" | undefined>,
  message: Annotation<string | undefined>,
});

const builder = new StateGraph(StateAnnotation)
  .addNode("validate", ValidateNode)
  .addNode("plan", PlanNode)
  .addNode("approve", ApproveNode)
  .addNode("execute", ExecuteNode)
  .addNode("finalize", FinalizeNode);

builder.addEdge(START, "validate");
builder.addEdge("validate", "plan");
builder.addEdge("plan", "approve");
builder.addConditionalEdges("approve", (s: typeof StateAnnotation.State) => {
  return s.approved ? "execute" : "finalize ";
});
builder.addEdge("execute", "finalize");
builder.addEdge("finalize", END);
