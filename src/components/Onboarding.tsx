import { useState } from 'react';
import type { AppContext, Persona, RouteId } from '../types';

export const PERSONAS: Persona[] = [
  { id: 'first',    name: 'First-time voter',    initials: 'FV', blurb: 'Turned 18 recently. Show me the basics, end-to-end.', icon: '◐' },
  { id: 'return',   name: 'Returning voter',     initials: 'RV', blurb: 'I\'ve voted before. Just what changed this election.', icon: '◉' },
  { id: 'nri',      name: 'NRI / Overseas',      initials: 'NR', blurb: 'I live abroad. Explain postal ballot, ETPBS, FPCA equivalents.', icon: '◑' },
  { id: 'candidate',name: 'Candidate / worker',  initials: 'CW', blurb: 'I\'m contesting or helping a campaign. Show nomination & MCC rules.', icon: '◎' },
  { id: 'press',    name: 'Journalist / researcher', initials: 'JR', blurb: 'Give me source-cited facts, not a chatbot summary.', icon: '◇' },
  { id: 'pwd',      name: 'Person with disability',  initials: 'PD', blurb: 'Accessible polling, companion voting, home voting (Form 12D).', icon: '◈' },
];

export const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh',
  'Jammu & Kashmir','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal'
];

interface OnboardingProps {
  onDone: (res: AppContext & { startAt: RouteId }) => void;
}

export function Onboarding({ onDone }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [state, setState] = useState('');
  const [pin, setPin] = useState('');

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background:
      'radial-gradient(1200px 600px at 15% -10%, color-mix(in oklab, var(--accent-soft) 80%, transparent), transparent 60%), radial-gradient(900px 500px at 110% 120%, color-mix(in oklab, var(--leaf-soft) 70%, transparent), transparent 60%), var(--bg)' }}>
      <div style={{ width: 'min(960px, 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div className="brand-mark">स</div>
          <div>
            <div className="brand-name" style={{ fontSize: 26 }}>Saksham</div>
            <div className="brand-sub">Your election, explained simply</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 22, height: 3, borderRadius: 2, background: i <= step ? 'var(--ink)' : 'var(--line)' }} />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div>
            <div className="eyebrow">Step 01 · Who you are</div>
            <h1 className="display">First — <span className="accent-word">who</span> is asking?</h1>
            <p className="subhead" style={{ marginTop: 8, marginBottom: 28 }}>
              The election process looks different for a first-time voter in Kerala, a candidate in Bihar, and an NRI in Dubai.
              Tell us your situation once — every answer after this is tailored to you.
            </p>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {PERSONAS.map(p => (
                <button key={p.id}
                  onClick={() => setPersona(p)}
                  style={{
                    textAlign: 'left', padding: 18, borderRadius: 14,
                    border: '1px solid var(--line)',
                    background: persona?.id === p.id ? 'var(--ink)' : 'var(--bg-elev)',
                    color: persona?.id === p.id ? 'var(--bg)' : 'var(--ink)',
                    transition: 'all .18s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <span style={{ fontSize: 15.5, fontWeight: 500 }}>{p.name}</span>
                  </div>
                  <div style={{ fontSize: 13, opacity: .72, lineHeight: 1.4 }}>{p.blurb}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 28, alignItems: 'center' }}>
              <button className="btn primary" disabled={!persona} onClick={() => setStep(1)}
                style={{ opacity: persona ? 1 : .4 }}>
                Continue →
              </button>
              <span className="muted" style={{ fontSize: 12.5 }}>No login. Nothing stored. You can change this anytime.</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="eyebrow">Step 02 · Where you vote</div>
            <h1 className="display">Which <span className="accent-word">state</span> is your voter ID from?</h1>
            <p className="subhead" style={{ marginTop: 8, marginBottom: 24 }}>
              We use this to surface your state election schedule, constituency rules, and local Electoral Officer contacts.
              Your PIN is optional — it helps us find your polling booth.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '4px 4px 10px' }}>State / UT</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6, maxHeight: 280, overflow: 'auto' }} className="scroll">
                  {STATES.map(s => (
                    <button key={s}
                      onClick={() => setState(s)}
                      style={{
                        textAlign: 'left', padding: '8px 10px', borderRadius: 8,
                        fontSize: 13, border: '1px solid transparent',
                        background: state === s ? 'var(--ink)' : 'transparent',
                        color: state === s ? 'var(--bg)' : 'var(--ink-soft)',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>PIN (optional)</div>
                <input
                  value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="560001" inputMode="numeric"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', fontSize: 15, letterSpacing: '0.1em' }} />
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.5 }}>
                  Used only to find your polling booth on the ECI locator. Never leaves your browser.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn" onClick={() => setStep(0)}>← Back</button>
              <button className="btn primary" disabled={!state} onClick={() => setStep(2)}
                style={{ opacity: state ? 1 : .4 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="eyebrow">Step 03 · What you care about</div>
            <h1 className="display">What brought you here <span className="accent-word">today?</span></h1>
            <p className="subhead" style={{ marginTop: 8, marginBottom: 24 }}>
              Pick one. We'll land you on the right screen — you can explore the rest after.
            </p>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {[
                { id: 'home', icon: '◐', t: "I'm just getting oriented", s: "Show me the overview." },
                { id: 'timeline', icon: '◑', t: "Walk me through the process", s: "The 8 stages, start to finish." },
                { id: 'booth', icon: '◈', t: "Am I registered? Where's my booth?", s: "Check status, find booth, Aadhaar linkage." },
                { id: 'rescue', icon: '◇', t: "I think I missed a deadline", s: "What can I still do?" },
                { id: 'chat', icon: '◉', t: "I have a specific question", s: "Jump straight into the assistant." },
                { id: 'dates', icon: '◎', t: "Show me what's coming up", s: "Calendar of dates and reminders." },
              ].map(o => (
                <button key={o.id} className="card"
                  onClick={() => onDone({ persona, state, pin, lang: 'en', startAt: o.id as RouteId })}
                  style={{ textAlign: 'left', cursor: 'pointer', transition: 'transform .1s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = ''}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{o.icon}</div>
                  <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{o.t}</div>
                  <div className="muted" style={{ fontSize: 13 }}>{o.s}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn" onClick={() => setStep(1)}>← Back</button>
              <button className="btn ghost" onClick={() => onDone({ persona, state, pin, lang: 'en', startAt: 'home' })}>Skip, just take me in →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
