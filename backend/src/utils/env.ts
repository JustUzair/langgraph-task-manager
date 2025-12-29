import dotenv from "dotenv";

dotenv.config();

import { z } from "zod";

const EnvSchema = z
  .object({
    OPENAI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    GOOGLE_API_KEY: z.string().optional(),

    OPENAI_MODEL: z.string().default("gpt-4o-mini"),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash-lite"),
    GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),

    PORT: z.string().default("5555"),
  })
  .refine(
    env =>
      Boolean(env.OPENAI_API_KEY || env.GROQ_API_KEY || env.GOOGLE_API_KEY),
    {
      message:
        "At least one API key must be provided: OPENAI_API_KEY, GROQ_API_KEY, or GOOGLE_API_KEY",
    }
  );

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.log("ENV Schema Error...");
  throw new Error("ENV Schema Error...");
}

const raw = parsed.data;

export const env = Object.freeze({
  OPENAI_API_KEY: raw.OPENAI_API_KEY,
  GROQ_API_KEY: raw.GROQ_API_KEY,
  GOOGLE_API_KEY: raw.GOOGLE_API_KEY,

  OPENAI_MODEL: raw.OPENAI_MODEL,
  GEMINI_MODEL: raw.GEMINI_MODEL,
  GROQ_MODEL: raw.GROQ_MODEL,

  PORT: raw.PORT,
});
