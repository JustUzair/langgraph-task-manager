import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../../utils/env";
import { ChatOpenAI } from "@langchain/openai";
import type { State } from "../types";

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

type Model = ChatGoogleGenerativeAI | ChatGroq | ChatOpenAI;
type Plan = z.infer<typeof PlanSchema>;

function makeModel() {
  if (env.GOOGLE_API_KEY)
    return new ChatGoogleGenerativeAI({
      apiKey: env.GOOGLE_API_KEY,
      model: env.GEMINI_MODEL,
      temperature: 0.3,
    });

  if (env.GROQ_API_KEY)
    return new ChatGroq({
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_MODEL,
      temperature: 0.3,
    });

  return new ChatOpenAI({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    temperature: 0.3,
  });
}

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
