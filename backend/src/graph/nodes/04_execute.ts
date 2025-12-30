import { z } from "zod";
import { Model, makeModel } from "../../utils/model";
import { State } from "../types";

const NotesSchema = z.object({
  notes: z.array(z.string().min(1).max(500)).min(1).max(20),
});

type Notes = z.infer<typeof NotesSchema>;

function createHUmanPromptContent(steps: string[]) {
  const list = JSON.stringify(steps, null, 0);
  return [
    "you are a concise assistant.",
    'given a list of steps, return a json object {"notes":string[]}',
    "rules:",
    "notes.length must be equal to steps.length",
    "each note <=300 characters",
    "plain text, no md",
    "",
    `Steps= ${list}`,
  ].join("\n");
}
export async function ExecuteNode(state: State): Promise<Partial<State>> {
  if (!state.approved) return {};
  const steps = state.steps ?? [];
  if (steps.length == 0) return {};
  const model: Model = makeModel();
  const structured = model.withStructuredOutput(NotesSchema);
  const out: Notes = await structured.invoke([
    {
      role: "system",
      content: "Return only valid JSON matching the schema",
    },
    {
      role: "human",
      content: createHUmanPromptContent(steps),
    },
  ]);

  const count = Math.min(steps.length, out.notes.length);
  const results = Array.from(
    {
      length: count,
    },
    (_, i) => ({
      step: steps[i],
      note: out.notes[i],
    })
  );
  return {
    results,
    status: "done",
    message: `Executed ${results.length} step(s)`,
  };
}
