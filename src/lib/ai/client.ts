import "server-only";
import { google } from "@ai-sdk/google";

export const DEFAULT_MODEL = "gemini-2.5-flash";

export function getModel(modelId: string = DEFAULT_MODEL) {
  return google(modelId);
}
