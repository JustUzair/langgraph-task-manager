import {
  Annotation,
  Command,
  END,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ValidateNode } from "./nodes/01_validate";
import { PlanNode } from "./nodes/02_plan";
import { ApproveNode } from "./nodes/03_approve";
import { ExecuteNode } from "./nodes/04_execute";
import { FinalizeNode } from "./nodes/05_finalize";
import { makeInitialState, State } from "./types";

const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  steps: Annotation<string[] | undefined>,
  approved: Annotation<boolean | undefined>,
  results: Annotation<Array<{ step: string; note: string } | undefined>>,
  status: Annotation<"planned" | "done" | "cancelled" | undefined>,
  message: Annotation<string | undefined>,
});

const builder = new StateGraph(StateAnnotation)
  .addNode("validate", ValidateNode)
  .addNode("plan", PlanNode)
  .addNode("approve", ApproveNode)
  .addNode("execute", ExecuteNode)
  .addNode("finalize", FinalizeNode);

builder
  .addEdge(START, "validate")
  .addEdge("validate", "plan")
  .addEdge("plan", "approve")
  .addConditionalEdges("approve", (s: typeof StateAnnotation.State) => {
    return s.approved ? "execute" : "finalize ";
  })
  .addEdge("execute", "finalize")
  .addEdge("finalize", END);

/* @Note for demo purposes, we use an in-memory checkpointer. 
In production, you would likely want to use a more durable storage solution
Refer to the following doc: https://docs.langchain.com/oss/javascript/langgraph/persistence#checkpointer-libraries
*/
const checkpointer = new MemorySaver();

const graph = await builder.compile({
  checkpointer,
});

function createThreadId() {
  return `t_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export async function startAgent(input: string): Promise<
  | {
      interrupt: {
        threadId: string;
        steps: string[];
      };
    }
  | { final: State }
> {
  const threadId = createThreadId();
  const config = {
    configurable: {
      thread_id: threadId,
    },
  };

  const result: any = await graph.invoke(makeInitialState(input), config);
  console.log(result.__interrupt__);
  if (result && result.__interrupt__) {
    const first = Array.isArray(result.__interrupt__)
      ? result.__interrupt__[0]
      : result.__interrupt__;

    const steps = (first?.value?.steps as string[]) ?? [];
    return {
      interrupt: {
        threadId,
        steps,
      },
    };
  }
  return {
    final: result as State,
  };
}

export async function resumeAgent(args: {
  threadId: string;
  approve: boolean;
}): Promise<State> {
  const { threadId, approve } = args;
  const config = {
    configurable: {
      thread_id: threadId,
    },
  };
  const finalState = (await graph.invoke(
    new Command({
      resume: { approve },
    }),
    config,
  )) as State;
  return finalState;
}
