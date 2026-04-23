import { useState } from 'react';
import type { AppContext, RouteId } from '../types';

interface TimelinePageProps {
  ctx?: AppContext;
  setRoute: (r: RouteId) => void;
}

const STAGES = [
  { id: 1, t: 'Announcement', when: 'D–60 to D–45', icon: '◐',
    body: "The Election Commission of India announces the schedule. The moment this happens, the Model Code of Conduct kicks in — governments can't announce new schemes or transfer officers.",
    terms: ['Model Code of Conduct', 'Election Commission of India'] },
  { id: 2, t: 'Nominations', when: 'D–30 to D–22', icon: '◑',
    body: "Candidates file nomination papers with the Returning Officer, pay the security deposit, and submit Form 26 — the affidavit declaring assets, liabilities, and criminal cases.",
    terms: ['Returning Officer', 'Form 26'] },
  { id: 3, t: 'Scrutiny & Withdrawal', when: 'D–21 to D–19', icon: '◒',
    body: "The RO scrutinises every nomination. Candidates who filed can withdraw within two days — often part of last-minute coalition arithmetic.",
    terms: ['Returning Officer'] },
  { id: 4, t: 'Campaigning', when: 'D–18 to D–2', icon: '◓',
    body: "The noisy part. Rallies, door-to-door, social media. Expenditure is capped per candidate and monitored by EEMS. Silence period begins 48 hours before polling.",
    terms: ['EEMS', 'Silence Period'] },
  { id: 5, t: 'Poll Day', when: 'D–Day', icon: '●',
    body: "You show up between 7 AM and 6 PM with an ID. Vote on the EVM. The VVPAT prints a paper slip visible for 7 seconds — your receipt that the machine recorded you correctly.",
    terms: ['EVM', 'VVPAT', 'NOTA'] },
  { id: 6, t: 'Counting', when: 'D+1 to D+3', icon: '◕',
    body: "EVMs are brought to counting centres under CCTV. Postal ballots are counted first, then EVM rounds. VVPAT slips from 5 randomly-chosen booths per assembly segment are matched against EVM counts.",
    terms: ['VVPAT', 'Postal Ballot'] },
  { id: 7, t: 'Declaration', when: 'D+3', icon: '◖',
    body: "The RO signs Form 21C/21E declaring the winner. If no single party crosses the majority, the Governor invites the largest party or coalition — a hung assembly scenario.",
    terms: ['Hung Assembly', 'Form 21C'] },
  { id: 8, t: 'Oath & Formation', when: 'D+7 to D+14', icon: '◗',
    body: "Elected members take oath. The CM-designate proves majority on the floor. If anyone disputes the result, they can file an Election Petition in the High Court within 45 days.",
    terms: ['Election Petition', 'Floor Test'] },
];

const GLOSSARY: Record<string, string> = {
  'Model Code of Conduct': "Rules of conduct for parties, candidates and governments from the day elections are announced until results. Prohibits new schemes, abuse of official machinery, and communal appeals.",
  'Election Commission of India': "Autonomous constitutional authority under Article 324 that administers elections to Parliament, state legislatures, and the offices of President & Vice-President.",
  'Returning Officer': "A senior civil servant (usually District Magistrate) in charge of conducting the election for a constituency — receives nominations, supervises counting, declares results.",
  'Form 26': "The affidavit every candidate must file disclosing assets, liabilities, educational qualifications, and pending criminal cases. Filing a false Form 26 is a criminal offence.",
  'EEMS': "Election Expenditure Monitoring System — the ECI's portal that tracks candidate campaign spending against the legal cap (₹95 lakh for LS, ₹40 lakh for Assembly in most states).",
  'Silence Period': "The 48-hour window before polling closes during which no public campaigning, ads, exit polls, or campaign-related SMS/calls are allowed.",
  'EVM': "Electronic Voting Machine — a standalone, non-networked device with a Ballot Unit (where you press) and a Control Unit (which stores the vote).",
  'VVPAT': "Voter Verifiable Paper Audit Trail — a printer attached to the EVM. Prints a slip showing your vote for 7 seconds behind a glass panel, then drops it in a sealed box as an audit record.",
  'NOTA': "None Of The Above — the last option on every EVM. Lets you formally record a vote without choosing any candidate. Counted and reported publicly.",
  'Postal Ballot': "Ballot sent by mail. Used by service voters, election-duty staff, senior citizens (80+), persons with disability, and COVID-positive voters who opt in via Form 12D.",
  'Hung Assembly': "When no party or pre-poll coalition wins more than half the seats. The Governor invites the largest party/coalition to prove majority on the floor of the House.",
  'Form 21C': "The statutory form the Returning Officer signs to formally declare the winning candidate for a constituency.",
  'Election Petition': "A legal challenge to the election of a candidate, filed in the High Court within 45 days of the declaration of results.",
  'Floor Test': "A vote in the legislature where the government of the day must prove it commands a majority — head-counted, often live-televised.",
};

window.GLOSSARY = GLOSSARY;

function eli12Rewrite(s: typeof STAGES[0]) {
  const map: Record<number, string> = {
    1: "The referee (Election Commission) blows the whistle. From this moment, governments can't announce shiny new schemes to win votes.",
    2: "People who want to run for office go to the referee's office and fill out the paperwork, including a sworn form saying what they own, what they owe, and whether they've been charged with crimes.",
    3: "The referee checks the paperwork. Anyone who changed their mind has 2 days to pull out.",
    4: "Everyone runs around asking for votes. Each person has a spending limit — like a monopoly budget — and someone's counting. Two days before the vote, all noise stops.",
    5: "Show up, show an ID, press a button on a machine. A small slip falls into a locked box so there's proof of your vote.",
    6: "All the machines are brought to one room. Postal votes are counted first, then the machine votes. They also check the paper slips from a few random booths just to be sure.",
    7: "The referee announces the winner in a form. If no one has a majority, the Governor invites the largest group and asks them to prove they have enough support.",
    8: "The winners take an oath. The new government has to prove on the floor of the house it has majority. If anyone thinks something was unfair, they have 45 days to go to the High Court.",
  };
  return map[s.id] || s.body;
}

export function TimelinePage({ setRoute }: TimelinePageProps) {
  const [active, setActive] = useState(5);
  const [termOpen, setTermOpen] = useState<string | null>(null);
  const [eli12, setEli12] = useState(false);

  const stage = STAGES.find(s => s.id === active)!;

  const renderBody = (body: string, terms: string[]) => {
    const parts: React.ReactNode[] = [];
    let key = 0;
    const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    body.split(regex).forEach(seg => {
      if (terms.includes(seg)) {
        parts.push(<span key={key++} className="term" onClick={() => setTermOpen(seg)}>{seg}</span>);
      } else {
        parts.push(<span key={key++}>{seg}</span>);
      }
    });
    return parts;
  };

  return (
    <div className="page" style={{ animation: 'fade-up 0.5s' }}>
      <div className="eyebrow">The journey · 8 stages</div>
      <h1 className="display">From <span className="accent-word">announcement</span> to <span className="accent-word">formation of government.</span></h1>
      <p className="subhead" style={{ marginTop: 10 }}>
        Every Indian election follows the same eight stages. Click any stage to zoom in.
        Words in <span className="term">amber highlight</span> are the jargon — click to translate.
      </p>

      {/* rail */}
      <div style={{ marginTop: 32, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 24, left: 0, right: 0, height: 1, background: 'var(--line)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 4 }}>
          {STAGES.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{ textAlign: 'center', padding: '0 2px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', margin: '0 auto',
                background: active === s.id ? 'var(--ink)' : 'var(--bg-elev)',
                color: active === s.id ? 'var(--bg)' : 'var(--ink)',
                border: `1px solid ${active === s.id ? 'var(--ink)' : 'var(--line)'}`,
                display: 'grid', placeItems: 'center',
                fontSize: 20, fontWeight: 500,
                transition: 'all .2s', position: 'relative', zIndex: 1,
              }}>{s.icon}</div>
              <div style={{ fontSize: 12, marginTop: 10, fontWeight: active === s.id ? 500 : 400, color: active === s.id ? 'var(--ink)' : 'var(--muted)' }}>
                {s.t}
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{s.when}</div>
            </button>
          ))}
        </div>
      </div>

      {/* active stage */}
      <div className="card" style={{ marginTop: 36, padding: 32, display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 36 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>STAGE {String(stage.id).padStart(2, '0')} · {stage.when}</div>
          <div style={{ fontFamily: "'Geist', sans-serif", fontWeight: 600, fontSize: 44, lineHeight: 1.1, marginTop: 8, letterSpacing: '-0.02em' }}>{stage.t}</div>
          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12 }}>Plain language</span>
            <button onClick={() => setEli12(!eli12)} style={{
              width: 36, height: 20, borderRadius: 999,
              background: eli12 ? 'var(--ink)' : 'var(--line)', position: 'relative', transition: '.15s',
            }}>
              <span style={{ position: 'absolute', top: 2, left: eli12 ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: '.15s' }} />
            </button>
            <span className="muted" style={{ fontSize: 12 }}>ELI12 mode</span>
          </div>
        </div>
        <div style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
          {eli12 ? <span className="serif" style={{ fontSize: 20 }}>{eli12Rewrite(stage)}</span> : renderBody(stage.body, stage.terms)}
          <div style={{ marginTop: 26, display: 'flex', gap: 10 }}>
            <button className="btn primary" onClick={() => {
              window.__seedChat = `Tell me more about ${stage.t}`;
              setRoute('chat');
            }}>Ask about {stage.t} →</button>
            <button className="btn" onClick={() => setActive(Math.min(STAGES.length, stage.id + 1))}>Next stage →</button>
          </div>
        </div>
      </div>

      {/* glossary popup */}
      {termOpen && (
        <div onClick={() => setTermOpen(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(22,26,46,0.35)', zIndex: 200,
          display: 'grid', placeItems: 'center', padding: 20,
        }}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, padding: 28, animation: 'fade-up 0.2s' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>GLOSSARY</div>
            <div className="serif" style={{ fontSize: 34, lineHeight: 1.1, marginTop: 4 }}>{termOpen}</div>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-soft)', marginTop: 14 }}>{GLOSSARY[termOpen] || 'Definition coming soon.'}</p>
            <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
              <button className="btn primary" onClick={() => { setTermOpen(null); setRoute('chat'); window.__seedChat = `Tell me more about ${termOpen}`; }}>Explain further →</button>
              <button className="btn" onClick={() => setTermOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
