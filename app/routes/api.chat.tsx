// Server-only API route: POST /api/chat
// Proxies to Gemini — API key NEVER leaves the server

import { data } from "react-router";
import type { Route } from "./+types/api.chat";
import { embedText, generateAnswer } from "../lib/gemini.server";
import { searchKnowledgeBase } from "../lib/firebase.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { query, history, ctx, eli5 } = body as {
      query: string;
      history: { role: string; content: string }[];
      ctx: { persona?: { name?: string }; state?: string; lang?: string };
      eli5: boolean;
    };

    if (!query?.trim()) {
      return data({ error: "No query provided" }, { status: 400 });
    }

    // 1. Build system prompt
    const systemPrompt = `You are Saksham, a neutral, factual Indian election assistant.
User context:
- Persona: ${ctx?.persona?.name || "general voter"}
- State: ${ctx?.state || "not specified"}
- Language preference: ${ctx?.lang || "en"}
- Plain-language (ELI5) mode: ${eli5 ? "ON — explain like the user is 5" : "OFF"}

Rules:
1. Be factual, neutral, and NEVER recommend a party or candidate.
2. Use short paragraphs. Cite ECI/state-CEO sources at the end.
3. If the user asks about a deadline, give both the general rule AND what they can still do if they missed it.
4. If something varies by state, say so and reference the user's state.
5. End with ONE actionable next step or follow-up question.
6. Keep responses under 180 words unless asked for depth.`;

    // 2. Try RAG — embed query and search Firestore (graceful fallback)
    let contextStr = "";
    try {
      const queryEmbedding = await embedText(query);
      const relevantDocs = await searchKnowledgeBase(queryEmbedding);
      if (relevantDocs.length > 0) {
        contextStr =
          "\n\nRelevant Context from Knowledge Base:\n" +
          relevantDocs
            .map((d) => `[${d.title}] (${d.source}): ${d.content}`)
            .join("\n\n");
      }
    } catch (err) {
      console.error("RAG search failed, continuing without context:", err);
    }

    // 3. Compose prompt with full conversation history
    const historyStr = [...history, { role: "user", content: query }]
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const fullPrompt = `${systemPrompt}${contextStr}

---

Conversation so far:
${historyStr}

Respond as ASSISTANT now. Use the provided Relevant Context to ground your answer if it applies. At the very end, on a new line, output "SOURCES:" followed by 1-3 short source labels separated by semicolons (e.g. "ECI Voter Services; RP Act 1951 §62").`;

    // 4. Generate response
    const rawText = await generateAnswer(fullPrompt);

    // 5. Parse sources
    let content = rawText || "Sorry — the assistant is momentarily unavailable. Try again in a moment.";
    let sources: { label: string }[] = [];
    const sourceMatch = content.match(/SOURCES:\s*(.+)$/s);
    if (sourceMatch) {
      content = content.slice(0, sourceMatch.index).trim();
      sources = sourceMatch[1]
        .split(/[;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label) => ({ label }));
    }

    return data({ content, sources });
  } catch (error) {
    console.error("Chat API error:", error);
    return data(
      { content: "I couldn't reach my sources just now. Try again in a moment — or jump to voters.eci.gov.in for the official answer.", sources: [] },
      { status: 500 }
    );
  }
}
