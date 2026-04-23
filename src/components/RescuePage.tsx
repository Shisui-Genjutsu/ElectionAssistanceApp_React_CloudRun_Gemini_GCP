import { useState } from 'react';
import type { AppContext } from '../types';

interface RescuePageProps {
  ctx: AppContext;
  setRoute?: (route: string) => void;
}

const RESCUE_SCENARIOS = [
  {
    id: 'reg', label: 'Voter registration',
    q: "I missed the voter registration deadline.",
    status: 'Closed 10 days ago',
    canStillDo: [
      { t: 'Continuous updation is still open', d: "Voter rolls are updated year-round via Form 6. You'll miss THIS election but be on the next roll.", action: 'Start Form 6 on Voter Portal' },
      { t: 'Check Aadhaar auto-enrollment', d: "Some states now auto-add 18-year-olds via Aadhaar linkage. You may already be registered without knowing.", action: 'Search your name at voters.eci.gov.in' },
      { t: 'Claim & objection window', d: "If the draft roll was published recently in your state, the 30-day claims window may still be open. Check your state CEO site.", action: 'Check your state CEO' },
    ],
    cannotDo: "Vote in THIS election if polling is within 10 days — the final roll is already published.",
  },
  {
    id: 'move', label: 'Address change',
    q: "I moved but didn't update my address.",
    status: 'Form 8 deadline passed',
    canStillDo: [
      { t: 'Vote at your OLD booth this time', d: "Your old entry is still valid. Carry any of the 12 accepted IDs to the polling booth at your old address.", action: 'Find old booth' },
      { t: 'File Form 8 for next election', d: "Submit Form 8 now — it takes 2–4 weeks to reflect but your new address will be on the next roll.", action: 'Start Form 8' },
      { t: 'Tatkal transfer in some states', d: "A few states (e.g. Karnataka, Delhi) allow expedited transfer for recent movers. Ask the assistant for your state's policy.", action: 'Ask Saksham' },
    ],
    cannotDo: "Vote at your NEW booth unless you filed Form 8 before the final roll cutoff.",
  },
  {
    id: 'postal', label: 'Postal ballot (NRI / service)',
    q: "I'm abroad and the ETPBS window closed.",
    status: 'Closed',
    canStillDo: [
      { t: 'Fly back & vote in person', d: "If your name is on the roll, you can show up with a passport at your constituency's booth.", action: 'Find your booth' },
      { t: 'Register for next cycle', d: "File Form 6A now for Overseas Electors — valid for the next general election.", action: 'Form 6A' },
      { t: 'Proxy voting (service voters only)', d: "If you're defence / CAPF, you may be eligible for a Classified Service Voter designation letting a family member proxy-vote.", action: 'Check eligibility' },
    ],
    cannotDo: "Mail in a postal ballot for this cycle — ETPBS deadlines are strict and not extendable.",
  },
  {
    id: 'nom', label: 'Candidate nomination',
    q: "I wanted to contest but missed nomination filing.",
    status: 'Closed',
    canStillDo: [
      { t: 'File on the last hour of the last day', d: "If the deadline hasn't actually passed, the RO accepts nominations until 3 PM on the last day — arrive early with papers & deposit.", action: 'Nomination checklist' },
      { t: 'Support as a proposer / agent', d: "You can still be a proposer for another candidate or serve as a polling agent on election day.", action: 'Agent form' },
      { t: 'By-election / next cycle', d: "By-elections for vacated seats are announced throughout the term. Stay ready — Form 26, affidavit, deposit.", action: 'Prepare Form 26' },
    ],
    cannotDo: "Contest this election — once scrutiny is done, no late nominations are accepted.",
  },
];

export function RescuePage({ setRoute }: RescuePageProps) {
  const [active, setActive] = useState(RESCUE_SCENARIOS[0].id);
  const s = RESCUE_SCENARIOS.find(x => x.id === active)!;

  return (
    <div className="page" style={{ animation: 'fade-up 0.5s' }}>
      <div className="eyebrow" style={{ color: 'var(--warn)' }}>The one no other guide covers</div>
      <h1 className="display">
        Missed a deadline? <br/>You probably still have <span className="accent-word">options.</span>
      </h1>
      <p className="subhead" style={{ marginTop: 10 }}>
        Every guide explains the happy path. This one handles the case most voters actually show up with — "I think I'm too late."
        Tell us what you missed. We'll tell you what you can still do.
      </p>

      <div style={{ display: 'flex', gap: 8, marginTop: 26, flexWrap: 'wrap' }}>
        {RESCUE_SCENARIOS.map(x => (
          <button key={x.id}
            onClick={() => setActive(x.id)}
            className="btn"
            style={{
              background: active === x.id ? 'var(--ink)' : 'var(--bg-elev)',
              color: active === x.id ? 'var(--bg)' : 'var(--ink)',
              borderColor: active === x.id ? 'var(--ink)' : 'var(--line)',
            }}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 22, padding: 28, borderLeft: '4px solid var(--warn)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="chip" style={{ background: 'color-mix(in oklab, var(--warn) 15%, transparent)', border: '1px solid color-mix(in oklab, var(--warn) 40%, transparent)', color: 'var(--warn)' }}>
            {s.status}
          </span>
        </div>
        <div className="serif" style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.01em' }}>"{s.q}"</div>

        <div className="sep" />

        <div className="eyebrow">What you can still do</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          {s.canStillDo.map((o, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 14,
              padding: 16, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bg)',
              alignItems: 'center',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--leaf-soft)', color: 'var(--leaf)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, marginBottom: 3 }}>{o.t}</div>
                <div className="muted" style={{ fontSize: 13 }}>{o.d}</div>
              </div>
              <button className="btn sm">{o.action} →</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: 14, background: 'color-mix(in oklab, var(--warn) 8%, transparent)', borderRadius: 10, fontSize: 13.5, lineHeight: 1.5 }}>
          <b style={{ color: 'var(--warn)' }}>Honest truth: </b>
          {s.cannotDo}
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button className="btn primary" onClick={() => { (window as any).__seedChat = s.q; setRoute?.('chat'); }}>Discuss with Saksham →</button>
          <button className="btn" onClick={() => setRoute?.('dates')}>See all upcoming deadlines</button>
        </div>
      </div>
    </div>
  );
}
