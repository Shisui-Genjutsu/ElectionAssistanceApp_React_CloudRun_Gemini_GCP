import type { AppContext, RouteId } from '../types';

interface SidebarProps {
  route: RouteId;
  setRoute: (route: RouteId) => void;
  ctx: AppContext;
}

export function Sidebar({ route, setRoute, ctx }: SidebarProps) {
  const items = [
    { id: 'home',      label: 'Overview',         k: 'G H' },
    { id: 'timeline',  label: 'Election Journey', k: 'G T' },
    { id: 'chat',      label: 'Ask the Assistant',k: 'G A', live: true },
    { id: 'rescue',    label: 'I Missed Something',k: 'G M' },
    { id: 'booth',     label: 'Booth & Status',   k: 'G B' },
    { id: 'dates',     label: 'Key Dates',        k: 'G D' },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">स</div>
        <div>
          <div className="brand-name">Saksham</div>
          <div className="brand-sub">Election Assistant · India</div>
        </div>
      </div>

      <div className="nav-section">Guide</div>
      {items.map(it => (
        <button key={it.id}
          className={`nav-item ${route === it.id ? 'active' : ''}`}
          onClick={() => setRoute(it.id as RouteId)}>
          {it.live && <span className="live-dot" />}
          <span>{it.label}</span>
          <span className="k">{it.k}</span>
        </button>
      ))}

      <div style={{ marginTop: 'auto', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        <div style={{ marginBottom: 6 }}>Signed in as</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--ink)', fontWeight: 500, fontSize: 12 }}>
            {ctx.persona?.initials || 'GV'}
          </div>
          <div>
            <div style={{ color: 'var(--ink)', fontSize: 13 }}>{ctx.persona?.name || 'Guest voter'}</div>
            <div>{ctx.state || 'Choose state'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface TopbarProps {
  route: RouteId;
  ctx: AppContext;
  setCtx: (ctx: AppContext) => void;
}

import { useState, useEffect } from 'react';

export function Topbar({ route, ctx, setCtx }: TopbarProps) {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'warm');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const titleMap: Record<RouteId, string> = {
    home: 'Overview', timeline: 'Election Journey', chat: 'Ask the Assistant',
    rescue: 'Missed a step?', booth: 'Your booth & registration', dates: 'Key Dates',
  };
  return (
    <div className="topbar">
      <div className="crumb">Saksham <span style={{ opacity: .5, margin: '0 6px' }}>/</span> <b>{titleMap[route]}</b></div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div className="chip dot">Election Commission live feed · verified</div>
        
        <button className="chip" onClick={() => setTheme(t => t === 'warm' ? 'midnight' : 'warm')}>
          {theme === 'warm' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <button className="chip" onClick={() => {
          const sizes = ['md', 'lg', 'xl'];
          const cur = document.documentElement.getAttribute('data-size') || 'md';
          const nxt = sizes[(sizes.indexOf(cur) + 1) % sizes.length];
          document.documentElement.setAttribute('data-size', nxt);
        }}>Aa · large text</button>
        <div className="chip">
          <select value={ctx.lang} onChange={e => setCtx({ ...ctx, lang: e.target.value })}
            style={{ background: 'transparent', border: 0, outline: 'none', fontSize: 12 }}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="ta">தமிழ்</option>
            <option value="te">తెలుగు</option>
            <option value="bn">বাংলা</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
      </div>
    </div>
  );
}
