"use client";
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import type { AppContext, RouteId } from "../types";
import { STATES } from "../components/Onboarding";

const NAV_ITEMS = [
  { id: "home",     label: "Overview",           k: "G H", path: "/" },
  { id: "timeline", label: "Election Journey",   k: "G T", path: "/timeline" },
  { id: "chat",     label: "Ask the Assistant",  k: "G A", path: "/chat", live: true },
  { id: "rescue",   label: "I Missed Something", k: "G M", path: "/rescue" },
  { id: "booth",    label: "Booth & Status",     k: "G B", path: "/booth" },
  { id: "dates",    label: "Key Dates",          k: "G D", path: "/dates" },
];

const TITLE_MAP: Record<string, string> = {
  "/":         "Overview",
  "/timeline": "Election Journey",
  "/chat":     "Ask the Assistant",
  "/rescue":   "Missed a step?",
  "/booth":    "Your booth & registration",
  "/dates":    "Key Dates",
};

export default function Shell() {
  const [ctx, setCtx] = useState<AppContext | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState("warm");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedCtx = localStorage.getItem("saksham_ctx");
    if (savedCtx) {
      setCtx(JSON.parse(savedCtx));
    }
    const savedTheme = localStorage.getItem("saksham_theme") || "warm";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (ctx) localStorage.setItem("saksham_ctx", JSON.stringify(ctx));
  }, [ctx]);

  // Redirect to onboarding if no ctx
  useEffect(() => {
    if (loaded && !ctx) {
      navigate("/onboarding");
    }
  }, [loaded, ctx, navigate]);

  const toggleTheme = () => {
    const next = theme === "warm" ? "midnight" : "warm";
    setTheme(next);
    localStorage.setItem("saksham_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const routeId = (
    location.pathname === "/" ? "home"
    : location.pathname.slice(1)
  ) as RouteId;

  if (!loaded || !ctx) return null;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">स</div>
          <div>
            <div className="brand-name">Saksham</div>
            <div className="brand-sub">Election Assistant · India</div>
          </div>
        </div>

        <div className="nav-section">Guide</div>
        {NAV_ITEMS.map((it) => (
          <button
            key={it.id}
            className={`nav-item ${routeId === it.id ? "active" : ""}`}
            onClick={() => navigate(it.path)}
          >
            {it.live && <span className="live-dot" />}
            <span>{it.label}</span>
            <span className="k">{it.k}</span>
          </button>
        ))}

        <div style={{ marginTop: "auto", fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
          <div style={{ marginBottom: 6 }}>Signed in as</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--ink)", fontWeight: 500, fontSize: 12 }}>
              {ctx.persona?.initials || "GV"}
            </div>
            <div>
              <div style={{ color: "var(--ink)", fontSize: 13 }}>{ctx.persona?.name || "Guest voter"}</div>
              <div>{ctx.state || "Choose state"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main>
        {/* Topbar */}
        <div className="topbar">
          <div className="crumb">
            Saksham <span style={{ opacity: 0.5, margin: "0 6px" }}>/</span>{" "}
            <b>{TITLE_MAP[location.pathname] || "—"}</b>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="chip"
              style={{ background: "transparent", border: "1px solid var(--line)", outline: "none", cursor: "pointer" }}
              value={ctx.state || "Karnataka"}
              onChange={(e) => setCtx({ ...ctx, state: e.target.value })}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="chip" onClick={toggleTheme}>
              {theme === "warm" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </div>

        {/* Page content */}
        <Outlet context={{ ctx, setCtx, navigate, routeId }} />

        {/* Floating assistant button (hidden on chat route) */}
        {routeId !== "chat" && (
          <div
            onClick={() => navigate("/chat")}
            style={{
              position: "fixed", bottom: 32, right: 32,
              background: "var(--ink)", color: "var(--bg)",
              padding: "16px 24px", borderRadius: 99,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              display: "flex", alignItems: "center", gap: 12,
              zIndex: 100, cursor: "pointer",
              animation: "fade-up 0.5s 1s backwards",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--leaf)", boxShadow: "0 0 12px var(--leaf)" }} />
            <div style={{ fontWeight: 500, fontSize: 15 }}>Ask Saksham</div>
          </div>
        )}
      </main>
    </div>
  );
}
