import { ExecutionStatus } from "./types";
import { z } from "zod";

export const ExecutionStatus = z.enum(["planned", "done", "cancelled"]);
export type ExecutionStatus = z.infer<typeof ExecutionStatus>;

export const StepResult = z.object({
  step: z.string(),
  note: z.string(),
});

export const State = z.object({
  input: z.string(),
  steps: z.array(z.string()).optional(),
  approved: z.boolean().optional(),
  results: z.array(StepResult).optional(),
  status: ExecutionStatus.optional(),
  message: z.string().optional(),
});

export type State = z.infer<typeof State>;

// Initial State helper

export function makeInitialState(input: string): State {
  return {
    input,
    status: "planned",
  };
}
