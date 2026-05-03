import type { AppContext, RouteId } from "../types";

interface HomePageProps {
  ctx: AppContext;
  setRoute: (r: RouteId, options?: { prompt?: string }) => void;
}

export function HomePage({ ctx, setRoute }: HomePageProps) {
  const electionDate = new Date("2026-05-14");
  const today = new Date();
  const daysOut = Math.max(1, Math.ceil((electionDate.getTime() - today.getTime()) / 86400000));
  const nextDeadline = {
    label: "Voter roll updates close",
    date: "May 3, 2026",
    days: Math.max(1, Math.ceil((new Date("2026-05-03").getTime() - today.getTime()) / 86400000)),
  };

  return (
    <div className="page" style={{ animation: "fade-up 0.5s" }}>
      <div className="eyebrow">Your election, at a glance</div>
      <h1 className="display">
        Hello, {ctx.persona?.name?.toLowerCase().split(" ")[0] || "voter"}. <br />
        You have <b className="accent-word">{daysOut} days</b> until you vote.
      </h1>
      <p className="subhead" style={{ marginTop: 10 }}>
        General elections to the {ctx.state || "Karnataka"} Legislative Assembly · polling on{" "}
        <b style={{ color: "var(--ink)" }}>14 May 2026</b>.
        Here's where you stand and what's next.
      </p>

      <div className="grid" style={{ gridTemplateColumns: "repeat(12, 1fr)", marginTop: 28 }}>
        {/* Countdown card */}
        <div className="card ink" style={{ gridColumn: "span 7", padding: 26, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 240, height: 240, borderRadius: "50%", border: "1px dashed rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", right: -70, top: -70, width: 320, height: 320, borderRadius: "50%", border: "1px dashed rgba(255,255,255,0.07)" }} />
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.6 }}>Polling day</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 84, lineHeight: 1, marginTop: 8, letterSpacing: "-0.04em" }}>
            {daysOut}<span style={{ fontSize: 24, opacity: 0.6, marginLeft: 8 }}>days</span>
          </div>
          <div style={{ marginTop: 18, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (1 - daysOut / 120) * 100)}%`, height: "100%", background: "var(--accent)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11.5, opacity: 0.6 }}>
            <span>Announcement</span><span>Nominations</span><span>Campaigning</span><span>Poll day</span><span>Counting</span>
          </div>
          <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
            <button className="btn accent" onClick={() => setRoute("timeline")}>Walk me through it →</button>
            <button className="btn" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "var(--bg)" }} onClick={() => setRoute("dates")}>See calendar</button>
          </div>
        </div>

        {/* Status card */}
        <div className="card" style={{ gridColumn: "span 5" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div className="meta" style={{ marginBottom: 6 }}>Your registration status</div>
              <div style={{ fontSize: 20, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                <span className="live-dot" /> Enrolled · Verified
              </div>
            </div>
            <span className="chip dot" style={{ fontSize: 11 }}>ECI · April 21</span>
          </div>
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
            <div><div className="muted" style={{ fontSize: 11.5 }}>EPIC No.</div><div className="mono">ABC1234567</div></div>
            <div><div className="muted" style={{ fontSize: 11.5 }}>Aadhaar link</div><div>● Linked</div></div>
            <div><div className="muted" style={{ fontSize: 11.5 }}>Constituency</div><div>Bengaluru South (174)</div></div>
            <div><div className="muted" style={{ fontSize: 11.5 }}>Booth #</div><div>47 · Govt. Primary, Jayanagar</div></div>
          </div>
          <div className="sep" />
          <button className="btn block" onClick={() => setRoute("booth")}>Open full details →</button>
        </div>

        {/* Next deadline */}
        <div className="card" style={{ gridColumn: "span 5" }}>
          <div className="meta" style={{ marginBottom: 6 }}>Next up</div>
          <div className="serif" style={{ fontSize: 28, lineHeight: 1.1, marginBottom: 4 }}>{nextDeadline.label}</div>
          <div className="muted" style={{ fontSize: 13 }}>{nextDeadline.date} · in {nextDeadline.days} days</div>
          <div style={{ marginTop: 14, padding: 12, background: "var(--accent-soft)", borderRadius: 10, fontSize: 13, lineHeight: 1.5 }}>
            <b>What this means for you:</b> if your address changed recently, submit Form 8 before this date so your updated address is on the final roll.
          </div>
          <button className="btn sm" style={{ marginTop: 12 }} onClick={() => setRoute("chat", { prompt: "Can you explain Form 8 for address changes on voter rolls? What's the deadline and how do I file it?" })}>Ask the assistant about Form 8 →</button>
        </div>

        {/* Quick ask grid */}
        <div className="card" style={{ gridColumn: "span 7", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: "var(--leaf)" }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>Ask Saksham anything</div>
            <div className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>Powered by Gemini · cites ECI & state sources</div>
          </div>
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(2, 1fr)" }}>
            {[
              "Am I auto-registered through Aadhaar?",
              "What is NOTA and when should I use it?",
              "How do EVMs and VVPATs work together?",
              "I turned 18 last month — can I still vote?",
              "What is the Model Code of Conduct?",
              "How is a hung assembly resolved?",
            ].map((q) => (
              <button key={q} className="btn" style={{ justifyContent: "flex-start", fontSize: 13, textAlign: "left" }}
                onClick={() => setRoute("chat", { prompt: q })}>
                <span style={{ color: "var(--muted)" }}>↗</span> {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Edge-case highlights */}
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">Things most guides skip</div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 10 }}>
          {[
            { t: "I missed a deadline", s: "Don't give up — there are often fallback paths.", r: "rescue", accent: "var(--warn)" },
            { t: "Aadhaar auto-registration", s: "Was I automatically added to the rolls?", r: "booth", accent: "var(--leaf)" },
            { t: "Disputed results & hung assemblies", s: "What happens if no one wins outright?", r: "chat", accent: "var(--lilac)", prompt: "Can you explain what happens during disputed results and hung assemblies in Indian elections?" },
            { t: "NRI postal voting (ETPBS)", s: "Voting from abroad — step by step.", r: "chat", accent: "var(--accent)", prompt: "Can you explain the step-by-step process for NRI postal voting (ETPBS) in India?" },
          ].map((c) => (
            <button key={c.t} className="card flat" style={{ textAlign: "left", border: "1px solid var(--line)", cursor: "pointer" }}
              onClick={() => setRoute(c.r as RouteId, c.r === "chat" ? { prompt: c.prompt || c.t } : undefined)}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: c.accent, marginBottom: 10 }} />
              <div style={{ fontSize: 14.5, fontWeight: 500, marginBottom: 4 }}>{c.t}</div>
              <div className="muted" style={{ fontSize: 13 }}>{c.s}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
