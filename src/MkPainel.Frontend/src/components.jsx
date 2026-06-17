import React, { useState, useEffect, useRef } from 'react';

// ─── Logo mark ──────────────────────────────────────────
export function LogoMark({ size = 32, radius = 8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "block", borderRadius: radius }}>
      <defs>
        <linearGradient id={`mklogo-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2e5bff"/>
          <stop offset="1" stopColor="#1a3bbf"/>
        </linearGradient>
      </defs>
      <rect x="5" y="8" width="38" height="32" rx="8" fill={`url(#mklogo-${size})`}/>
      <rect x="5" y="8" width="38" height="8" rx="8" fill="#fff" fillOpacity="0.13"/>
      <circle cx="10.5" cy="12" r="1.4" fill="#fff" fillOpacity="0.7"/>
      <circle cx="15" cy="12" r="1.4" fill="#fff" fillOpacity="0.45"/>
      <g fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="11,34 11,20 17,27 23,20 23,34"/>
        <path d="M29 20 L29 34"/>
        <path d="M37 20 L29 27 L37 34"/>
      </g>
    </svg>
  );
}

// ─── Icons (inline, original) ──────────────────────────────────────────
export const Icon = {
  Dashboard: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  Accounts: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Campaigns: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l18-5v12L3 13z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  Funnel: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>,
  Bell: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Settings: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Search: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  ArrowUp: (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  ArrowDown: (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Sparkle: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z"/><path d="M19 14l.9 2.4L22 17l-2.1.6L19 20l-.9-2.4L16 17l2.1-.6z"/></svg>,
  Bolt: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  TrendUp: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Logout: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Calendar: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Filter: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Download: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Versus: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 4h6v16H3z"/><path d="M15 4h6v16h-6z"/><path d="M11 12h2"/></svg>,
  Report: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
  WhatsApp: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Send: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Eye: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// ─── Platform marks ──────────────────────────────────────────
export function GoogleAdsMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="13" width="4" height="8" rx="1" fill="#4a8ad9"/>
      <rect x="10" y="8" width="4" height="13" rx="1" fill="#1a73c2"/>
      <rect x="17" y="3" width="4" height="18" rx="1" fill="#0d4e8a"/>
    </svg>
  );
}

export function MetaAdsMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="12" height="12" rx="2.5" fill="#4267b2"/>
      <rect x="9" y="9" width="12" height="12" rx="2.5" fill="#7e9bd6" opacity="0.95"/>
    </svg>
  );
}

// ─── Animated number ──────────────────────────────────────────
export function AnimNumber({ value, format = "currency", className = "" }) {
  const prev = useRef(value);
  const [dir, setDir] = useState(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (value !== prev.current) {
      setDir(value > prev.current ? "up" : "down");
      setKey(k => k + 1);
      prev.current = value;
    }
  }, [value]);

  let str;
  if (format === "currency") {
    str = "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (format === "currency-int") {
    str = "R$ " + Math.round(value).toLocaleString("pt-BR");
  } else if (format === "int") {
    str = Math.round(value).toLocaleString("pt-BR");
  } else if (format === "pct") {
    str = value.toFixed(2) + "%";
  } else if (format === "x") {
    str = value.toFixed(1) + "x";
  } else {
    str = String(value);
  }

  return (
    <span key={key} className={`num-pulse ${dir || ""} ${className}`}>{str}</span>
  );
}

// Helper for generating sparkline SVGs
export function genSparkline(points = 12, trend = "up") {
  const pts = [];
  let y = 50 + Math.random() * 20;
  for (let i = 0; i < points; i++) {
    const drift = trend === "up" ? -2 : trend === "down" ? 2 : 0;
    y += (Math.random() - 0.5) * 12 + drift;
    y = Math.max(5, Math.min(75, y));
    pts.push([i * (100 / (points - 1)), y]);
  }
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
}

// ─── Sparkline ──────────────────────────────────────────
export function Sparkline({ trend = "up", color, width = 100, height = 32 }) {
  const path = useRef(genSparkline(14, trend)).current;
  const stroke = color || (trend === "up" ? "#12b76a" : trend === "down" ? "#f04438" : "#667085");
  return (
    <svg viewBox="0 0 100 80" width={width} height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${trend}-${stroke.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={stroke} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L 100 80 L 0 80 Z`} fill={`url(#spark-${trend}-${stroke.slice(1)})`}/>
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Sidebar ──────────────────────────────────────────
export function Sidebar({ active, onNav, alertCount }) {
  const [open, setOpen] = useState(false);
  const userName = localStorage.getItem('mkpainel_user_name') || 'Davi Silva';
  const userEmail = localStorage.getItem('mkpainel_user_email') || 'admin@agenciaorbita.com.br';
  const userInitials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Close drawer on resize back to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNav = (id) => {
    setOpen(false);
    onNav?.(id);
  };

  const items = [
    { id: "dashboard", label: "Visão Geral", icon: Icon.Dashboard },
    { id: "accounts", label: "Contas", icon: Icon.Accounts },
    { id: "campaigns", label: "Campanhas", icon: Icon.Campaigns },
    { id: "whatsapp", label: "WhatsApp", icon: Icon.WhatsApp },
  ];
  const items2 = [
    { id: "alerts", label: "Alertas", icon: Icon.Bell, count: alertCount },
    { id: "settings", label: "Configurações", icon: Icon.Settings },
  ];

  return (
    <>
      {/* Mobile-only hamburger trigger */}
      <button className="sidebar-mobile-trigger" onClick={() => setOpen(true)} aria-label="Abrir menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)}/>}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          <LogoMark size={32}/>
          <div className="sidebar-logo-text">MKPainel</div>
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Workspace</div>
          {items.map(it => {
            const I = it.icon;
            return (
              <div key={it.id} className={`nav-item ${active === it.id ? "active" : ""}`} onClick={() => handleNav(it.id)}>
                <I/>
                <span>{it.label}</span>
                {it.count != null && <span className="nav-count">{it.count}</span>}
              </div>
            );
          })}

          <div className="nav-section-label">Operação</div>
          {items2.map(it => {
            const I = it.icon;
            return (
              <div key={it.id} className={`nav-item ${active === it.id ? "active" : ""}`} onClick={() => handleNav(it.id)}>
                <I/>
                <span>{it.label}</span>
                {it.count != null && <span className="nav-count">{it.count}</span>}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="avatar">{userInitials}</div>
          <div className="sidebar-foot-info">
            <div className="sidebar-foot-name">{userName}</div>
            <div className="sidebar-foot-mail">{userEmail}</div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Empty state helper ──────────────────────────────────────────
export function EmptyState({ kind, title, message, primaryAction, secondaryAction, ghostRows }) {
  const isError = kind === 'error';
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: isError ? 'var(--red-50)' : 'var(--brand-50)',
        color: isError ? 'var(--red-500)' : 'var(--brand-600)',
        display: 'grid', placeItems: 'center', marginBottom: 16
      }}>
        {isError ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        )}
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--ink-3)', maxWidth: 400, lineHeight: 1.5 }}>{message}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {secondaryAction && (
          <button className="btn btn-secondary btn-sm" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </button>
        )}
        {primaryAction && (
          <button className="btn btn-primary btn-sm" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
