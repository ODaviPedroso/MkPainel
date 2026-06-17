// MKPainel — Empty & error state components
// Reusable, shared across screens. Driven by a global `dataState` tweak:
// "populated" | "empty" | "error" | "noresults"

// ── Inline icons ──────────────────────────────────────────────
function EmptyBoxIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <defs>
        <linearGradient id="empty-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef2ff"/>
          <stop offset="100%" stopColor="#e0e7ff"/>
        </linearGradient>
      </defs>
      <rect x="8" y="18" width="40" height="30" rx="4" fill="url(#empty-grad)" stroke="#c7d2fe" strokeWidth="1.5"/>
      <path d="M8 22 L28 32 L48 22" stroke="#6366f1" strokeWidth="1.5" fill="none"/>
      <path d="M16 12 L28 18 L40 12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="28" cy="32" r="2" fill="#6366f1"/>
    </svg>
  );
}

function ErrorBoltIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="22" fill="#fef2f2" stroke="#fecaca" strokeWidth="1.5"/>
      <path d="M30 14 L20 30 L27 30 L25 42 L36 24 L29 24 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  );
}

function NoResultsIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="24" cy="24" r="14" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5"/>
      <line x1="34" y1="34" x2="44" y2="44" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
      <path d="M19 19 L29 29 M29 19 L19 29" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CelebrateIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="22" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5"/>
      <path d="M20 28 L26 34 L38 22" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

// ── Main EmptyState component ────────────────────────────────
function EmptyState({
  kind = "empty",         // "empty" | "error" | "noresults" | "success"
  title,
  message,
  primaryAction,           // { label, onClick }
  secondaryAction,
  compact = false,
  ghostRows = 0,           // skeleton ghost rows shown above the empty state
}) {
  const Icon = {
    empty: EmptyBoxIcon,
    error: ErrorBoltIcon,
    noresults: NoResultsIcon,
    success: CelebrateIcon,
  }[kind];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center",
      padding: compact ? "32px 24px" : "56px 24px",
      textAlign: "center",
      gap: 4,
    }}>
      {ghostRows > 0 && (
        <div style={{ width: "100%", maxWidth: 480, marginBottom: 18, display: "flex", flexDirection: "column", gap: 8, opacity: 0.5 }}>
          {Array.from({ length: ghostRows }).map((_, i) => (
            <div key={i} style={{
              height: 14, borderRadius: 4,
              background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
              backgroundSize: "200% 100%",
              animation: "ghostShimmer 1.6s linear infinite",
              width: `${80 - i * 12}%`,
            }}/>
          ))}
        </div>
      )}
      <div style={{ marginBottom: 14 }}><Icon/></div>
      <div style={{
        fontSize: compact ? 14 : 16, fontWeight: 600, color: "var(--ink-1)",
        marginBottom: 4, letterSpacing: "-0.005em",
      }}>{title}</div>
      <div style={{
        fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55,
        maxWidth: 380, marginBottom: 18,
      }}>{message}</div>
      {(primaryAction || secondaryAction) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {primaryAction && (
            <button className="btn btn-primary btn-sm" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button className="btn btn-secondary btn-sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Ghost row used as a loading affordance inside tables ─────
function GhostRow({ cols = 5 }) {
  return (
    <tr className="ghost-row">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{
            height: 12, borderRadius: 4,
            background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
            backgroundSize: "200% 100%",
            animation: "ghostShimmer 1.6s linear infinite",
            width: `${50 + Math.random() * 40}%`,
          }}/>
        </td>
      ))}
    </tr>
  );
}

// Inject keyframes once
if (typeof document !== "undefined" && !document.getElementById("__ghostkeyframes")) {
  const s = document.createElement("style");
  s.id = "__ghostkeyframes";
  s.textContent = `
    @keyframes ghostShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .ghost-row { background: #fff; }
  `;
  document.head.appendChild(s);
}

window.EmptyState = EmptyState;
window.GhostRow = GhostRow;
