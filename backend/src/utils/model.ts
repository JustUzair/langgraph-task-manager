import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "../../utils/env";

export type Model = ChatGoogleGenerativeAI | ChatGroq | ChatOpenAI;

export function makeModel() {
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
