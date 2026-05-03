import { useState } from "react";
import type { AppContext, RouteId } from "../types";

interface OtherPagesProps {
  ctx: AppContext;
  setRoute?: (r: RouteId, options?: { prompt?: string }) => void;
}

export function BoothPage({ ctx, setRoute }: OtherPagesProps) {
  const [epic, setEpic] = useState("ABC1234567");
  const [checked, setChecked] = useState(true);

  return (
    <div className="page" style={{ animation: "fade-up 0.5s" }}>
      <div className="eyebrow">Booth & registration</div>
      <h1 className="display">Check your <span className="accent-word">status.</span> <br />Find your <span className="accent-word">booth.</span></h1>
      <p className="subhead" style={{ marginTop: 10 }}>
        We don't store anything. We read the public ECI roll and tell you what it says — including whether Aadhaar auto-enrollment added you.
      </p>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 28 }}>
        <div className="card">
          <div className="eyebrow">Look up by EPIC</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input value={epic} onChange={(e) => setEpic(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, letterSpacing: "0.08em" }} />
            <button className="btn primary" onClick={() => setChecked(true)}>Check</button>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Or search by name + DOB + state on ECI portal.</div>

          {checked && (
            <div style={{ marginTop: 18, padding: 16, border: "1px solid var(--line)", borderRadius: 12, background: "var(--bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                <span className="live-dot" /> Record found · verified against ECI roll
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14, fontSize: 13 }}>
                <div><div className="muted" style={{ fontSize: 11.5 }}>Name</div><div>{ctx.persona?.name || "Aarav Shetty"}</div></div>
                <div><div className="muted" style={{ fontSize: 11.5 }}>Age</div><div>26</div></div>
                <div><div className="muted" style={{ fontSize: 11.5 }}>Constituency</div><div>Bengaluru South (174)</div></div>
                <div><div className="muted" style={{ fontSize: 11.5 }}>Part No.</div><div>47</div></div>
                <div><div className="muted" style={{ fontSize: 11.5 }}>Serial</div><div>0234</div></div>
                <div><div className="muted" style={{ fontSize: 11.5 }}>Aadhaar</div><div style={{ color: "var(--leaf)" }}>● Linked</div></div>
              </div>
            </div>
          )}
        </div>

        <div className="card ink">
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.6 }}>Your polling booth</div>
          <div className="serif" style={{ fontSize: 34, lineHeight: 1.1, marginTop: 6 }}>Govt. Primary School</div>
          <div style={{ opacity: 0.7, fontSize: 13 }}>Jayanagar 4th Block · Bengaluru 560011</div>

          <div style={{ marginTop: 18, height: 160, borderRadius: 10, background:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 10px, rgba(255,255,255,0.07) 10px 20px)",
            position: "relative", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
              <div style={{ fontSize: 28 }}>◉</div>
            </div>
            <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: 10, opacity: 0.6, fontFamily: "ui-monospace, monospace" }}>12.9279° N, 77.5833° E</div>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12.5 }}>
            <div><div style={{ opacity: 0.55, fontSize: 11 }}>Polling hours</div><div>7:00 AM – 6:00 PM</div></div>
            <div><div style={{ opacity: 0.55, fontSize: 11 }}>Wait time (avg)</div><div>22 min</div></div>
            <div><div style={{ opacity: 0.55, fontSize: 11 }}>Accessible</div><div>● Ramp · wheelchair</div></div>
            <div><div style={{ opacity: 0.55, fontSize: 11 }}>Dist. from you</div><div>1.4 km</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn accent">Open in Maps</button>
            <button className="btn" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "var(--bg)" }}>Add to calendar</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 2", background: "var(--leaf-soft)", borderColor: "transparent" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--leaf)", color: "#fff", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 600 }}>✓</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 15 }}>You're good. You were auto-enrolled via Aadhaar linkage on 12 March 2026.</div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>If that address is wrong, file Form 8 before the final roll is published on 3 May.</div>
            </div>
            <button className="btn" onClick={() => setRoute?.("rescue")}>Something's off →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATE_DATES: Record<string, any[]> = {
  Karnataka: [
    { d: "21 Apr 2026", t: "Draft electoral roll published", tag: "Past", done: true },
    { d: "03 May 2026", t: "Claims & objections window closes · Form 8 deadline", tag: "Next", urgent: true },
    { d: "07 May 2026", t: "Final electoral roll published", tag: "Upcoming" },
    { d: "09 May 2026", t: "Silence period begins — no campaigning", tag: "Upcoming" },
    { d: "14 May 2026", t: "Poll day · 7 AM – 6 PM", tag: "Poll", hero: true },
    { d: "17 May 2026", t: "Counting & result declaration", tag: "Upcoming" },
    { d: "24 May 2026", t: "Last date to file election petition", tag: "Upcoming" },
  ],
  "Andhra Pradesh": [
    { d: "15 Apr 2026", t: "Draft electoral roll published", tag: "Past", done: true },
    { d: "28 Apr 2026", t: "Claims & objections window closes", tag: "Next", urgent: true },
    { d: "05 May 2026", t: "Final electoral roll published", tag: "Upcoming" },
    { d: "11 May 2026", t: "Silence period begins — no campaigning", tag: "Upcoming" },
    { d: "13 May 2026", t: "Poll day · 7 AM – 6 PM", tag: "Poll", hero: true },
    { d: "04 Jun 2026", t: "Counting & result declaration", tag: "Upcoming" },
    { d: "10 Jun 2026", t: "Last date to file election petition", tag: "Upcoming" },
  ],
  Telangana: [
    { d: "20 Apr 2026", t: "Draft electoral roll published", tag: "Past", done: true },
    { d: "01 May 2026", t: "Claims & objections window closes", tag: "Next", urgent: true },
    { d: "06 May 2026", t: "Final electoral roll published", tag: "Upcoming" },
    { d: "11 May 2026", t: "Silence period begins — no campaigning", tag: "Upcoming" },
    { d: "13 May 2026", t: "Poll day · 7 AM – 6 PM", tag: "Poll", hero: true },
    { d: "04 Jun 2026", t: "Counting & result declaration", tag: "Upcoming" },
    { d: "10 Jun 2026", t: "Last date to file election petition", tag: "Upcoming" },
  ],
};

function getGoogleCalendarUrl(dateStr: string, title: string) {
  const months: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
  const parts = dateStr.split(" ");
  if (parts.length !== 3) return "#";
  const [dd, mon, yyyy] = parts;
  const mm = months[mon];
  if (!mm) return "#";
  const start = `${yyyy}${mm}${dd}`;
  const d = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
  d.setDate(d.getDate() + 1);
  const end = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(`Reminder for: ${title} on ${dateStr}`)}`;
}

export function DatesPage({ setRoute, ctx }: { setRoute?: (route: RouteId, options?: { prompt?: string }) => void; ctx: AppContext }) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const datesToRender = STATE_DATES[ctx.state] || STATE_DATES["Karnataka"];

  return (
    <div className="page" style={{ animation: "fade-up 0.5s" }}>
      <div className="eyebrow">What's coming up</div>
      <h1 className="display">Your calendar for the <span className="accent-word">{ctx.state} assembly.</span></h1>
      <p className="subhead" style={{ marginTop: 10 }}>All dates are pulled from the Election Commission's gazette notification for {ctx.state}. Tap a date to set a reminder.</p>

      <div className="card" style={{ marginTop: 28, padding: 0, overflow: "hidden" }}>
        {datesToRender.map((ev, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "160px 1fr auto", gap: 16,
            padding: "18px 22px",
            borderBottom: i < datesToRender.length - 1 ? "1px solid var(--line)" : "none",
            background: ev.hero ? "var(--ink)" : (ev.urgent ? "var(--accent-soft)" : "transparent"),
            color: ev.hero ? "var(--bg)" : "var(--ink)",
            alignItems: "center",
          }}>
            <div>
              <div className="mono" style={{ fontSize: 11, opacity: 0.6 }}>{ev.tag.toUpperCase()}</div>
              <div className="serif" style={{ fontSize: 24, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{ev.d}</div>
            </div>
            <div style={{ fontSize: 15, textDecoration: ev.done ? "line-through" : "none", opacity: ev.done ? 0.5 : 1 }}>
              {ev.t}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {ev.urgent && <span className="chip accent">Act now</span>}
              {!ev.done && <button className="btn sm" onClick={() => setSelectedEvent(ev)} style={ev.hero ? { background: "rgba(255,255,255,0.1)", color: "var(--bg)", borderColor: "rgba(255,255,255,0.18)" } : {}}>Remind me</button>}
              {!ev.done && <button className="btn sm" onClick={() => setRoute?.("chat", { prompt: `What happens on ${ev.d} for "${ev.t}"? What do I need to do or prepare?` })} style={ev.hero ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : {}}>Explain</button>}
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "grid", placeItems: "center", padding: 20
        }} onClick={() => setSelectedEvent(null)}>
          <div style={{
            background: "var(--bg)", padding: 24, borderRadius: 16, width: "100%", maxWidth: 360,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)", border: "1px solid var(--line)"
          }} onClick={(e) => e.stopPropagation()}>
            <div className="eyebrow">Set Reminder</div>
            <h3 style={{ marginTop: 8, fontSize: 18 }}>{selectedEvent.t}</h3>
            <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>{selectedEvent.d}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
              <a href={getGoogleCalendarUrl(selectedEvent.d, selectedEvent.t)} target="_blank" rel="noreferrer"
                className="btn primary" style={{ width: "100%", textAlign: "center", display: "block", textDecoration: "none" }}
                onClick={() => setSelectedEvent(null)}>
                Add to Google Calendar
              </a>
              <button className="btn" style={{ width: "100%" }} onClick={() => setSelectedEvent(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
