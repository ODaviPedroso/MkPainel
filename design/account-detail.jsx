// MKPainel — Account drill-down screen
const { useState: useStateAcc, useEffect: useEffectAcc, useMemo: useMemoAcc } = React;

function AccountDetail({ clientName, onBack, tweaks, onCampaign, onClientView }) {
  const accounts = window.MOCK_ACCOUNTS.filter(a => a.name === clientName);
  const totalSpent = accounts.reduce((s, a) => s + a.spent, 0);
  const totalConv = accounts.reduce((s, a) => s + a.conv, 0);
  const avgCtr = accounts.reduce((s, a) => s + a.ctr, 0) / accounts.length;
  const avgRoas = accounts.reduce((s, a) => s + a.roas, 0) / accounts.length;

  const [tab, setTab] = useStateAcc("overview");
  const [liveSpent, setLiveSpent] = useStateAcc(totalSpent);

  useEffectAcc(() => {
    if (!tweaks?.live) return;
    const t = setInterval(() => setLiveSpent(v => v + Math.random() * 12 + 4), 2200);
    return () => clearInterval(t);
  }, [tweaks?.live]);

  const hourly = useMemoAcc(() => window.genHourlySpend().map(d => ({ ...d, google: d.google * 0.18, meta: d.meta * 0.18 })), [clientName]);
  const initials = clientName.split(" ").map(w => w[0]).join("").slice(0, 2);

  // Mock campaigns for this client
  const campaigns = useMemoAcc(() => {
    const types = ["Search", "Performance Max", "Display", "Advantage+ Shopping", "Reels", "Conversões", "Tráfego"];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      name: `${["BR ", "Performance ", "Remarketing ", "Branded ", "Geral "][i % 5]}· ${types[i % types.length]}`,
      platform: i % 3 === 0 ? "meta" : "google",
      spent: 800 + Math.random() * 4200,
      conv: Math.floor(20 + Math.random() * 180),
      ctr: 1.4 + Math.random() * 4,
      roas: 1.6 + Math.random() * 6,
      status: Math.random() > 0.85 ? "warning" : Math.random() > 0.92 ? "paused" : "active",
    })).sort((a, b) => b.spent - a.spent);
  }, [clientName]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="accounts" onNav={() => onBack?.()} alertCount={window.ALERTS.length}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar" style={{ height: "auto", padding: "16px 28px", flexDirection: "column", alignItems: "stretch", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: "4px 10px" }}>← Voltar</button>
            <span style={{ color: "var(--ink-4)" }}>/</span>
            <a href="#" style={{ color: "var(--ink-3)", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); onBack?.(); }}>Contas</a>
            <span style={{ color: "var(--ink-4)" }}>/</span>
            <span style={{ color: "var(--ink-1)", fontWeight: 600 }}>{clientName}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="acct-logo" style={{ width: 56, height: 56, fontSize: 18, background: "linear-gradient(135deg, #d1e0ff, #2e5bff)", color: "#fff" }}>{initials}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>{clientName}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center", fontSize: 13, color: "var(--ink-3)" }}>
                <span>{accounts.length} {accounts.length === 1 ? "conta" : "contas"} conectadas</span>
                <span>·</span>
                {accounts.find(a => a.platform === "google") && <span className="platform-pill"><span className="platform-dot google"/> Google Ads</span>}
                {accounts.find(a => a.platform === "meta") && <span className="platform-pill"><span className="platform-dot meta"/> Meta Ads</span>}
                <span>·</span>
                <span className="badge badge-green">● Ativa</span>
              </div>
            </div>
            <div style={{ flex: 1 }}/>
            <button className="btn btn-secondary btn-sm" onClick={() => onClientView?.(clientName)} title="Visualizar como o cliente vê">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Compartilhar com cliente
            </button>
            <button className="btn btn-secondary btn-sm"><Icon.Download/> Relatório</button>
            <button className="btn btn-primary btn-sm">Otimizar com IA</button>
          </div>

          <div style={{ display: "flex", gap: 4, borderBottom: "1px solid transparent", marginTop: 4 }}>
            {[
              { id: "overview", label: "Visão geral" },
              { id: "campaigns", label: `Campanhas (${campaigns.length})` },
              { id: "audience", label: "Audiência" },
              { id: "creatives", label: "Criativos" },
              { id: "settings", label: "Configurações" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "8px 14px", fontSize: 13, fontWeight: 600,
                color: tab === t.id ? "var(--brand-700)" : "var(--ink-3)",
                borderBottom: tab === t.id ? "2px solid var(--brand-600)" : "2px solid transparent",
                marginBottom: -1,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="main">
          {tab === "overview" && (
            <>
              {tweaks?.live && (
                <div className="tickbar">
                  <span className="live-dot"/>
                  <strong style={{ color: "var(--green-700)" }}>Em tempo real</strong>
                  <span style={{ color: "var(--ink-3)" }}>· Última sincronização há 8 segundos</span>
                  <span className="tickbar-meta">{clientName}</span>
                </div>
              )}

              <div className="kpi-grid">
                <KPIDetail label="Gasto (mês)" value={<AnimNumber value={liveSpent} format="currency-int"/>} delta="+R$ 412 hoje" trend="up" accent="brand"/>
                <KPIDetail label="Conversões" value={totalConv.toLocaleString("pt-BR")} delta="+18 ontem" trend="up" accent="green"/>
                <KPIDetail label="CTR médio" value={avgCtr.toFixed(2) + "%"} delta="-0.12%" trend="down" accent="amber"/>
                <KPIDetail label="ROAS" value={avgRoas.toFixed(1) + "x"} delta="+0.3x" trend="up" accent="green"/>
              </div>

              <div className="chart-grid">
                <div className="chart-card">
                  <div className="chart-head">
                    <div>
                      <h3 className="chart-title">Gasto por hora · hoje</h3>
                      <div className="chart-sub">{clientName}</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                      <Legend color="#1a73c2" label="Google"/>
                      <Legend color="#4267b2" label="Meta"/>
                    </div>
                  </div>
                  <SpendChart data={hourly}/>
                </div>

                <AIBlock items={window.AI_INSIGHTS.slice(0, 2).map(i => ({ ...i, title: i.title.replace(/(de|para) [^,]+/, m => m.split(" ")[0] + " " + clientName) }))}/>
              </div>

              {/* Per-platform breakdown */}
              <div className="section-h"><h2>Desempenho por plataforma</h2></div>
              <div className="kpi-grid" style={{ gridTemplateColumns: `repeat(${accounts.length}, 1fr)` }}>
                {accounts.map(a => (
                  <div className="kpi" key={a.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      {a.platform === "google" ? <GoogleAdsMark size={20}/> : <MetaAdsMark size={20}/>}
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{a.platform === "google" ? "Google Ads" : "Meta Ads"}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>#{1000 + a.id}-XX-{a.id * 7}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>R$ {a.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <Stat label="Conv." value={a.conv}/>
                      <Stat label="CTR" value={a.ctr.toFixed(2) + "%"}/>
                      <Stat label="ROAS" value={a.roas.toFixed(1) + "x"} positive={a.roas >= 4}/>
                    </div>
                  </div>
                ))}
              </div>

              <div className="section-h"><h2>Campanhas ativas</h2><span className="section-h-sub">{campaigns.length} campanhas</span></div>
              <div className="card" style={{ overflow: "hidden" }}>
                <table className="table">
                  <thead><tr>
                    <th>Campanha</th><th>Plataforma</th>
                    <th style={{ textAlign: "right" }}>Gasto</th>
                    <th style={{ textAlign: "right" }}>Conv.</th>
                    <th style={{ textAlign: "right" }}>CTR</th>
                    <th style={{ textAlign: "right" }}>ROAS</th>
                    <th>Status</th>
                  </tr></thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => onCampaign?.(clientName, c.platform, c.name)}>
                        <td><strong>{c.name}</strong></td>
                        <td><span className="platform-pill"><span className={`platform-dot ${c.platform}`}/> {c.platform === "google" ? "Google" : "Meta"}</span></td>
                        <td style={{ textAlign: "right" }} className="mono">R$ {c.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ textAlign: "right" }} className="mono">{c.conv}</td>
                        <td style={{ textAlign: "right" }} className="mono">{c.ctr.toFixed(2)}%</td>
                        <td className="mono" style={{ textAlign: "right", color: c.roas >= 4 ? "var(--green-700)" : c.roas >= 2.5 ? "var(--ink-1)" : "var(--red-700)", fontWeight: 600 }}>{c.roas.toFixed(1)}x</td>
                        <td>
                          {c.status === "active" && <span className="badge badge-green">● Ativa</span>}
                          {c.status === "warning" && <span className="badge badge-amber">● Atenção</span>}
                          {c.status === "paused" && <span className="badge badge-gray">● Pausada</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ height: 40 }}/>
            </>
          )}

          {tab !== "overview" && (
            <div className="chart-card" style={{ padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "var(--ink-3)" }}>Aba <strong>{tab}</strong> em construção neste protótipo.</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => setTab("overview")}>← Voltar para visão geral</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function KPIDetail({ label, value, delta, trend, accent }) {
  const accentColor = accent === "brand" ? "#2e5bff" : accent === "green" ? "#12b76a" : accent === "amber" ? "#f79009" : "#667085";
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        <span className={`kpi-delta ${trend}`}>
          {trend === "up" ? <Icon.ArrowUp/> : <Icon.ArrowDown/>} {delta}
        </span>
      </div>
      <svg className="kpi-spark" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d={window.genSparkline(10, trend)} fill="none" stroke={accentColor} strokeWidth="1.6" style={{ transform: "scaleY(0.5) translateY(40px)", transformOrigin: "bottom" }}/>
      </svg>
    </div>
  );
}

function Stat({ label, value, positive }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{label}</div>
      <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 2, color: positive ? "var(--green-700)" : "var(--ink-1)" }}>{value}</div>
    </div>
  );
}

window.AccountDetail = AccountDetail;
