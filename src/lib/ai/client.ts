import "server-only";
import { createGoogle } from "@ai-sdk/google";

export const DEFAULT_MODEL = "gemini-2.5-flash";

const provider = createGoogle({ apiKey: process.env.GEMINI_API_KEY });

export function getModel(modelId: string = DEFAULT_MODEL) {
  return provider(modelId);
}
