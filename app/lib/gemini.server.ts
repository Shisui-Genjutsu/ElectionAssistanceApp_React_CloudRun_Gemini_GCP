// Server-only Gemini helpers
// This file is NEVER bundled into the client — API key stays on server

import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

export async function embedText(text: string): Promise<number[]> {
  const genAI = getGenAI();
  // text-embedding-004 is the current stable embedding model
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function generateAnswer(prompt: string): Promise<string> {
  const genAI = getGenAI();
  // gemini-2.5-flash is the current fast model for new AI Studio keys
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
