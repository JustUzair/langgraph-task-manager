import { z } from "zod";

import type { State } from "../types";
import { Model, makeModel } from "../../utils/model";

const PlanSchema = z.object({
  steps: z
    .array(
      z
        .string()
        .min(3, "Keep each step a short sentence")
        .max(150, "Keep each step concise"),
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
    "Draft a small plan with 5-10 steps as needed",
    "Each step should be clear and to-the-point sentence, you can expand or elaborate if needed.",
  ].join("\n");
}

function takeFirstN(arr: string[], n = 5): string[] {
  return Array.isArray(arr) ? arr.slice(0, Math.max(0, n)) : [];
}
export async function PlanNode(state: State): Promise<Partial<State>> {
  if (state.status == "cancelled") return {};
  const model: Model = makeModel();
  const structured = model.withStructuredOutput(PlanSchema);

  try {
    const plan = await structured.invoke(
      [
        {
          role: "system",
          content: System,
        },
        {
          role: "human",
          content: userPrompt(state.input),
        },
      ],
      {
        timeout: 10000,
      },
    );
    console.log(plan);

    const steps = takeFirstN(plan.steps, 10);
    return {
      steps,
      status: "planned",
    };
  } catch (e) {
    console.error("PlanNode Error:", e);
    // Return a failed state so the UI knows to stop loading
    return { status: "error" as any };
  }
}
