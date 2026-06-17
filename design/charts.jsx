// MKPainel — Dashboard charts + funnel + alerts
const { useState: useStateD, useEffect: useEffectD, useMemo: useMemoD, useRef: useRefD } = React;

// ─── Hourly spend chart ──────────────────────────────────────────
function SpendChart({ data, height = 240 }) {
  const max = Math.max(...data.map(d => d.google + d.meta)) * 1.15;
  const W = 720, H = height;
  const padL = 50, padR = 16, padT = 12, padB = 28;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const barW = innerW / data.length;

  const yTick = (v) => padT + innerH - (v / max) * innerH;

  // Y-axis ticks
  const ticks = [];
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    ticks.push({ y: yTick(v), label: "R$ " + (v >= 1000 ? (v/1000).toFixed(1) + "k" : Math.round(v)) });
  }

  // Line for total
  const linePts = data.map((d, i) => {
    const x = padL + i * barW + barW / 2;
    const y = yTick(d.google + d.meta);
    return [x, y];
  });
  const linePath = linePts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      <defs>
        <linearGradient id="googleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a73c2" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#1a73c2" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="metaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4267b2" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#4267b2" stopOpacity="0.7"/>
        </linearGradient>
      </defs>

      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke="#eef0f4" strokeDasharray={i === 0 ? "0" : "3 3"}/>
          <text x={padL - 8} y={t.y + 4} fontSize="11" fill="#98a2b3" textAnchor="end" fontFamily="var(--font-mono)">{t.label}</text>
        </g>
      ))}

      {data.map((d, i) => {
        const x = padL + i * barW + 4;
        const w = barW - 8;
        const gH = (d.google / max) * innerH;
        const mH = (d.meta / max) * innerH;
        return (
          <g key={i}>
            <rect x={x} y={padT + innerH - gH - mH} width={w} height={gH} fill="url(#googleGrad)" rx="2"/>
            <rect x={x} y={padT + innerH - mH} width={w} height={mH} fill="url(#metaGrad)" rx="2"/>
          </g>
        );
      })}

      {/* Total line */}
      <path d={linePath} fill="none" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4"/>
      {linePts.map((p, i) => i % 4 === 0 && (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#0f172a" opacity="0.5"/>
      ))}

      {/* X axis */}
      {data.map((d, i) => i % 3 === 0 && (
        <text key={i} x={padL + i * barW + barW / 2} y={H - 10} fontSize="11" fill="#98a2b3" textAnchor="middle" fontFamily="var(--font-mono)">{String(d.hour).padStart(2, "0")}h</text>
      ))}

      {/* Now indicator */}
      <line x1={padL + 16 * barW + barW / 2} y1={padT} x2={padL + 16 * barW + barW / 2} y2={padT + innerH} stroke="#12b76a" strokeWidth="1.5" strokeDasharray="4 3"/>
      <rect x={padL + 16 * barW + barW / 2 - 18} y={padT - 2} width="36" height="16" rx="3" fill="#12b76a"/>
      <text x={padL + 16 * barW + barW / 2} y={padT + 9} fontSize="10" fill="#fff" textAnchor="middle" fontWeight="600">AGORA</text>
    </svg>
  );
}

// ─── Funnel ──────────────────────────────────────────
function FunnelBlock({ data }) {
  const max = data[0].value;
  return (
    <div className="funnel">
      {data.map((row, i) => {
        const pct = (row.value / max) * 100;
        return (
          <div key={row.key} className="funnel-row">
            <div className={`funnel-bar f-${i + 1}`} style={{ width: `${pct}%` }}/>
            <div className="funnel-content">
              <span className="funnel-label">{row.label}</span>
              <span className="funnel-value">{row.value.toLocaleString("pt-BR")}</span>
            </div>
            {row.rate != null && (
              <div style={{ position: "absolute", right: -8, top: 0, transform: "translateX(100%)", paddingLeft: 12, height: "100%", display: "flex", alignItems: "center" }}>
                <span className="funnel-rate"><span className="mono">{row.rate.toFixed(2)}%</span> taxa</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Alerts list ──────────────────────────────────────────
function AlertsBlock({ items }) {
  const iconMap = {
    alert: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    "trend-down": <Icon.TrendDown/>,
    "trend-up": <Icon.TrendUp/>,
    plus: <Icon.Plus/>,
  };
  return (
    <div className="alerts-stack">
      {items.map(a => (
        <div key={a.id} className={`alert ${a.type}`}>
          <div className="alert-icon">{iconMap[a.icon] || iconMap.alert}</div>
          <div className="alert-body">
            <div className="alert-title">{a.title}</div>
            <div className="alert-msg">{a.msg}</div>
            <div className="alert-time">{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AI insights ──────────────────────────────────────────
function AIBlock({ items }) {
  return (
    <div className="ai-card">
      <div className="ai-head">
        <div className="ai-mark"><Icon.Sparkle/></div>
        <span className="ai-label">Otimizações sugeridas pela IA</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>atualizado há 4 min</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-3)" }}>3 ações de alto impacto detectadas nas últimas 24h</div>
      <div className="ai-list">
        {items.map(it => (
          <div key={it.id} className="ai-item">
            <div className="ai-item-icon"><Icon.Bolt/></div>
            <div className="ai-item-body">
              <div className="ai-item-title">{it.title}</div>
              <div className="ai-item-msg">{it.msg}</div>
              <div className="ai-item-impact">⚡ {it.impact}</div>
              <div className="ai-item-actions">
                <button className="ai-action-btn">Aplicar</button>
                <button className="ai-action-btn ghost">Ver detalhes</button>
                <button className="ai-action-btn ghost">Dispensar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SpendChart, FunnelBlock, AlertsBlock, AIBlock });
