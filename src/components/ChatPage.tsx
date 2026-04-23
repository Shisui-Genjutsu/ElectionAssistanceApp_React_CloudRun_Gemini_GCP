import { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AppContext } from '../types';

interface ChatPageProps {
  ctx: AppContext;
  compact?: boolean;
}

export function ChatPage({ ctx, compact }: ChatPageProps) {
  const [messages, setMessages] = useState<{role: string, content: string, sources?: {label: string, url?: string}[]}[]>(() => {
    const seed = window.__seedChat;
    window.__seedChat = null;
    const base = [{
      role: 'assistant',
      content: `Hi ${ctx.persona?.name?.split(' ')[0] || 'there'}. I'm Saksham. Ask me anything about the ${ctx.state || 'Indian'} elections — process, dates, deadlines, candidates, your rights as a voter. I'll cite sources and keep it plain. For sensitive civic actions (registering, filing grievances) I'll point you to the official portal.`,
      sources: [{ label: 'ECI Voter Helpline', url: 'voters.eci.gov.in' }],
    }];
    return seed ? [...base, { role: 'user', content: seed }] : base;
  });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [eli12, setEli12] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const suggested = [
    'I just turned 18 — am I automatically on the rolls?',
    'What is NOTA and does it do anything?',
    'How do VVPATs prove my vote was counted?',
    'What happens in a hung assembly?',
    "How do I vote if I'm abroad?",
    "I missed voter registration — what now?",
  ];

  const systemPrompt = useMemo(() => `You are Saksham, a neutral, factual Indian election assistant.
User context:
- Persona: ${ctx.persona?.name || 'general voter'}
- State: ${ctx.state || 'not specified'}
- Language preference: ${ctx.lang || 'en'}
- Plain-language (ELI12) mode: ${eli12 ? 'ON — explain like the user is 12' : 'OFF'}

Rules:
1. Be factual, neutral, and NEVER recommend a party or candidate.
2. Use short paragraphs. Cite ECI/state-CEO sources at the end.
3. If the user asks about a deadline, give both the general rule AND what they can still do if they missed it.
4. If something varies by state, say so and reference the user's state.
5. End with ONE actionable next step or follow-up question.
6. Keep responses under 180 words unless asked for depth.`, [ctx, eli12]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setBusy(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API key not found');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `${systemPrompt}\n\n---\n\nConversation so far:\n${next.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}\n\nRespond as ASSISTANT now. At the very end, on a new line, output "SOURCES:" followed by 1-3 short source labels separated by semicolons (e.g. "ECI Voter Services; RP Act 1951 §62").`;
      
      const result = await model.generateContent(prompt);
      let content = result.response.text() || 'Sorry — the assistant is momentarily unavailable. Try again in a moment.';
      let sources: {label: string, url?: string}[] = [];
      const m = content.match(/SOURCES:\s*(.+)$/s);
      if (m) {
        content = content.slice(0, m.index).trim();
        sources = m[1].split(/[;\n]+/).map(s => s.trim()).filter(Boolean).map(label => ({ label }));
      }
      setMessages([...next, { role: 'assistant', content, sources }]);
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: "I couldn't reach my sources just now. Try again in a moment — or jump to voters.eci.gov.in for the official answer.", sources: [] }]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, busy]);

  // auto-send seeded prompt
  useEffect(() => {
    if (messages.length === 2 && messages[1].role === 'user' && !busy) {
      send(messages[1].content);
    }
    // eslint-disable-next-line
  }, []);

  const highlightTerms = (text: string) => {
    const terms = Object.keys(window.GLOSSARY || {});
    if (!terms.length) return text;
    const re = new RegExp(`\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');
    const parts = [];
    let last = 0, key = 0;
    text.replace(re, (match, _m, offset) => {
      if (offset > last) parts.push(<span key={key++}>{text.slice(last, offset)}</span>);
      parts.push(<span key={key++} className="term" title={window.GLOSSARY[match as keyof typeof window.GLOSSARY]}>{match}</span>);
      last = offset + match.length;
      return match;
    });
    if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
    return parts;
  };

  if (compact) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div ref={scrollerRef} className="scroll" style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                background: m.role === 'user' ? 'var(--accent-soft)' : 'var(--ink)',
                color: m.role === 'user' ? 'var(--ink)' : 'var(--bg)',
                display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600,
              }}>{m.role === 'user' ? (ctx.persona?.name?.[0] || 'U') : 'स'}</div>
              <div style={{ maxWidth: '82%' }}>
                <div style={{
                  padding: '10px 12px', borderRadius: 10, fontSize: 13.5, lineHeight: 1.5,
                  background: m.role === 'user' ? 'var(--ink)' : 'var(--line-soft)',
                  color: m.role === 'user' ? 'var(--bg)' : 'var(--ink)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.role === 'assistant' ? highlightTerms(m.content) : m.content}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {m.sources.map((s, j) => (
                      <span key={j} className="chip" style={{ fontSize: 10.5, padding: '2px 6px' }}>{s.label}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--ink)', color: 'var(--bg)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>स</div>
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--line-soft)', display: 'flex', gap: 4, alignItems: 'center' }}>
                <span className="typing-dot" /><span className="typing-dot" style={{ animationDelay: '.15s' }} /><span className="typing-dot" style={{ animationDelay: '.3s' }} />
              </div>
            </div>
          )}
        </div>
        {messages.length <= 2 && (
          <div style={{ padding: '6px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {suggested.slice(0,3).map(q => (
              <button key={q} className="btn sm" style={{ fontSize: 11.5 }} onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--line)', padding: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask Saksham…"
            style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', fontSize: 13, outline: 'none' }} />
          <button className="btn sm" onClick={() => setEli12(!eli12)} style={{ background: eli12 ? 'var(--ink)' : 'var(--bg-elev)', color: eli12 ? 'var(--bg)' : 'var(--ink)', fontSize: 11 }} title="Explain like I'm 12">ELI12</button>
          <button className="btn primary sm" onClick={() => send()} disabled={busy}>Send</button>
        </div>
        <style>{`
          @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-4px); opacity: 1; } }
          .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); display: inline-block; animation: typing 1.2s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start', maxWidth: 1200 }}>
      <div>
        <div className="eyebrow">Ask the assistant</div>
        <h1 className="display" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }}>Say hi to <span className="accent-word">Saksham.</span></h1>

        <div className="card" style={{ marginTop: 20, padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: 400 }}>
          <div ref={scrollerRef} className="scroll" style={{ flex: 1, padding: 22, overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 18, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: m.role === 'user' ? 'var(--accent-soft)' : 'var(--ink)',
                  color: m.role === 'user' ? 'var(--ink)' : 'var(--bg)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>{m.role === 'user' ? (ctx.persona?.name?.[0] || 'U') : 'स'}</div>
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    padding: '12px 14px', borderRadius: 12, fontSize: 14.5, lineHeight: 1.55,
                    background: m.role === 'user' ? 'var(--ink)' : 'var(--line-soft)',
                    color: m.role === 'user' ? 'var(--bg)' : 'var(--ink)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.role === 'assistant' ? highlightTerms(m.content) : m.content}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {m.sources.map((s, j) => (
                        <span key={j} className="chip" style={{ fontSize: 11, padding: '3px 8px' }}>
                          <span style={{ fontWeight: 600 }}>¶</span> {s.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ink)', color: 'var(--bg)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>स</div>
                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--line-soft)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span className="typing-dot" /><span className="typing-dot" style={{ animationDelay: '.15s' }} /><span className="typing-dot" style={{ animationDelay: '.3s' }} />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div style={{ padding: '8px 20px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {suggested.map(q => (
                <button key={q} className="btn sm" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--line)', padding: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about registration, Form 26, booth locator, anything…"
              style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bg)', fontSize: 14, outline: 'none' }} />
            <button className="btn sm" onClick={() => setEli12(!eli12)} style={{ background: eli12 ? 'var(--ink)' : 'var(--bg-elev)', color: eli12 ? 'var(--bg)' : 'var(--ink)' }}>
              ELI12
            </button>
            <button className="btn sm" title="Voice input — mocked">🎙</button>
            <button className="btn primary sm" onClick={() => send()} disabled={busy}>Send</button>
          </div>
        </div>
      </div>

      <aside style={{ position: 'sticky', top: 80 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Tailored for</div>
          <div style={{ fontSize: 15, fontWeight: 500, marginTop: 6 }}>{ctx.persona?.name || 'General voter'}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{ctx.state || 'No state selected'}</div>
          <div className="sep" />
          <div className="eyebrow">What I'm good at</div>
          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            {['State-specific procedure', 'Form 6 / 7 / 8 guidance', 'Aadhaar auto-registration status', 'Deadline-missed fallbacks', 'Plain-language glossary', 'Hindi / regional reply'].map(x => (
              <li key={x} style={{ padding: '6px 0', borderBottom: '1px dashed var(--line)' }}>· {x}</li>
            ))}
          </ul>
          <div className="sep" />
          <div className="eyebrow">Privacy</div>
          <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 6 }}>
            Conversations aren't stored. For official actions we send you to voters.eci.gov.in.
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
