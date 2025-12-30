import { z } from "zod";

import type { State } from "../types";
import { Model, makeModel } from "../../utils/model";

const PlanSchema = z.object({
  steps: z
    .array(
      z
        .string()
        .min(3, "Keep each step a short sentence")
        .max(150, "Keep each step concise")
    )
    .min(1)
    .max(10),
});

type Plan = z.infer<typeof PlanSchema>;

const System = [
  "You are a helpful planner.",
  "Return only JSON that matches the schema.",
  "Keep steps concrete, actionable and beginner friendly.",
].join("\n");

function userPrompt(input: string) {
  return [
    `User Goal: "${input}"`,
    "Draft a small plan with 3-5 steps",
    "Each step should be a short, clear and to-the-point sentence",
  ].join("\n");
}

function takeFirstN(arr: string[], n = 5): string[] {
  return Array.isArray(arr) ? arr.slice(0, Math.max(0, n)) : [];
}
export async function PlanNode(state: State): Promise<Partial<State>> {
  if (state.status == "cancelled") return {};
  const model: Model = makeModel();
  const structured = model.withStructuredOutput(PlanSchema);
  const plan = await structured.invoke([
    {
      role: "system",
      content: System,
    },
    {
      role: "human",
      content: userPrompt(state.input),
    },
  ]);

  const steps = takeFirstN(plan.steps, 5);
  return {
    steps,
    status: "planned",
  };
}
