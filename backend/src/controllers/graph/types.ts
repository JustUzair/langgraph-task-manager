import { z } from "zod";

const StartSchema = z.object({
  input: z.string().min(1, "Input cannot be empty"),
});
const ApproveSchema = z.object({
  threadId: z.string().min(1, "threadId is required"),
  approve: z.boolean(),
});

export { StartSchema, ApproveSchema };
