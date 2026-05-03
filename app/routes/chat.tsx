import { useState, useEffect, useRef, useMemo } from "react";
import { useOutletContext, useLocation, useNavigate, useFetcher } from "react-router";
import type { AppContext } from "../types";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { label: string; url?: string }[];
}

export default function ChatRoute() {
  const { ctx } = useOutletContext<{ ctx: AppContext }>();
  const location = useLocation();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      role: "assistant",
      content: `Hi ${ctx?.persona?.name?.split(" ")[0] || "there"}. I'm Saksham. Ask me anything about the ${ctx?.state || "Indian"} elections — process, dates, deadlines, candidates, your rights as a voter. I'll cite sources and keep it plain. For sensitive civic actions (registering, filing grievances) I'll point you to the official portal.`,
      sources: [{ label: "ECI Voter Helpline", url: "voters.eci.gov.in" }],
    },
  ]);
  const [input, setInput] = useState("");
  const [eli5, setEli5] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  // Guard: prevent seeded prompt from firing twice (React StrictMode double-invokes effects)
  const seededRef = useRef(false);

  const busy = fetcher.state !== "idle";

  const suggested = [
    "I just turned 18 — am I automatically on the rolls?",
    "What is NOTA and does it do anything?",
    "How do VVPATs prove my vote was counted?",
    "What happens in a hung assembly?",
    "How do I vote if I'm abroad?",
    "I missed voter registration — what now?",
  ];

  // Build history for server (exclude system greeting to save tokens)
  const historyForServer = useMemo(
    () => messages.slice(1).map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setPendingQuery(q);

    // POST to /api/chat — server handles Gemini call
    fetcher.submit(
      JSON.stringify({ query: q, history: historyForServer, ctx, eli5 }),
      {
        method: "POST",
        action: "/api/chat",
        encType: "application/json",
      }
    );
  }

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && pendingQuery) {
      const { content, sources } = fetcher.data as { content: string; sources: { label: string }[] };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content, sources: sources || [] },
      ]);
      setPendingQuery(null);
    }
  }, [fetcher.state, fetcher.data, pendingQuery]);

  // Auto-scroll
  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, busy]);

  // Auto-send seeded prompt from router state (once only)
  useEffect(() => {
    const seed = location.state?.prompt;
    if (seed && !seededRef.current) {
      seededRef.current = true;          // block any re-runs (StrictMode, etc.)
      navigate(location.pathname, { replace: true, state: {} }); // clear URL state first
      // defer send by one tick so navigate has committed
      setTimeout(() => send(seed), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.prompt]);

  const highlightTerms = (text: string) => {
    const glossary = typeof window !== "undefined" ? (window as any).GLOSSARY : null;
    if (!glossary) return text;
    const terms = Object.keys(glossary);
    if (!terms.length) return text;
    const re = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "g");
    const parts: React.ReactNode[] = [];
    let last = 0, key = 0;
    text.replace(re, (match, _m, offset) => {
      if (offset > last) parts.push(<span key={key++}>{text.slice(last, offset)}</span>);
      parts.push(<span key={key++} className="term" title={glossary[match]}>{match}</span>);
      last = offset + match.length;
      return match;
    });
    if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
    return parts.length ? parts : text;
  };

  return (
    <div className="page" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start", maxWidth: 1200 }}>
      <div>
        <div className="eyebrow">Ask the assistant</div>
        <h1 className="display" style={{ fontSize: "clamp(26px, 3vw, 36px)" }}>Say hi to <span className="accent-word">Saksham.</span></h1>

        <div className="card" style={{ marginTop: 20, padding: 0, display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", minHeight: 400 }}>
          <div ref={scrollerRef} className="scroll" style={{ flex: 1, padding: 22, overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 18, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: m.role === "user" ? "var(--accent-soft)" : "var(--ink)",
                  color: m.role === "user" ? "var(--ink)" : "var(--bg)",
                  display: "grid", placeItems: "center",
                  fontSize: 12, fontWeight: 600,
                }}>{m.role === "user" ? (ctx?.persona?.name?.[0] || "U") : "स"}</div>
                <div style={{ maxWidth: "78%" }}>
                  <div style={{
                    padding: "12px 14px", borderRadius: 12, fontSize: 14.5, lineHeight: 1.55,
                    background: m.role === "user" ? "var(--ink)" : "var(--line-soft)",
                    color: m.role === "user" ? "var(--bg)" : "var(--ink)",
                    whiteSpace: "pre-wrap",
                  }}>
                    {m.role === "assistant" ? highlightTerms(m.content) : m.content}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {m.sources.map((s, j) => (
                        <span key={j} className="chip" style={{ fontSize: 11, padding: "3px 8px" }}>
                          <span style={{ fontWeight: 600 }}>¶</span> {s.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>स</div>
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--line-soft)", display: "flex", gap: 4, alignItems: "center" }}>
                  <span className="typing-dot" /><span className="typing-dot" style={{ animationDelay: ".15s" }} /><span className="typing-dot" style={{ animationDelay: ".3s" }} />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div style={{ padding: "8px 20px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {suggested.map((q) => (
                <button key={q} className="btn sm" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px solid var(--line)", padding: 14, display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about registration, Form 26, booth locator, anything…"
              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, outline: "none" }} />
            <button className="btn sm" onClick={() => setEli5(!eli5)} style={{ background: eli5 ? "var(--ink)" : "var(--bg-elev)", color: eli5 ? "var(--bg)" : "var(--ink)" }}>
              ELI5
            </button>
            <button className="btn sm" title="Voice input — coming soon">🎙</button>
            <button className="btn primary sm" onClick={() => send()} disabled={busy}>Send</button>
          </div>
        </div>
      </div>

      <aside style={{ position: "sticky", top: 80 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Tailored for</div>
          <div style={{ fontSize: 15, fontWeight: 500, marginTop: 6 }}>{ctx?.persona?.name || "General voter"}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{ctx?.state || "No state selected"}</div>
          <div className="sep" />
          <div className="eyebrow">What I'm good at</div>
          <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", fontSize: 13.5, color: "var(--ink-soft)" }}>
            {["State-specific procedure", "Form 6 / 7 / 8 guidance", "Aadhaar auto-registration status", "Deadline-missed fallbacks", "Plain-language glossary", "Hindi / regional reply"].map((x) => (
              <li key={x} style={{ padding: "6px 0", borderBottom: "1px dashed var(--line)" }}>· {x}</li>
            ))}
          </ul>
          <div className="sep" />
          <div className="eyebrow">Privacy</div>
          <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 6 }}>
            Conversations aren't stored. Your API key stays on the server — never sent to your browser. For official actions we send you to voters.eci.gov.in.
          </p>
        </div>
      </aside>

      <style>{`
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-4px); opacity: 1; } }
        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); display: inline-block; animation: typing 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
