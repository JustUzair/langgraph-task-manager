import { START } from "@langchain/langgraph";
import type { State } from "../types";

export async function ValidateNode(state: State): Promise<Partial<State>> {
  const raw = state.input ?? "";
  const trimmedInput = raw.trim();
  if (trimmedInput.length == 0)
    return {
      status: "cancelled",
      message: "Input is empty. Please provide a task to start",
    };

  const MAX = 300;
  const safeInput =
    trimmedInput.length > MAX
      ? trimmedInput.slice(0, MAX) + "..."
      : trimmedInput;

  return {
    input: safeInput,
  };
}
