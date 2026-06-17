// MKPainel — Dashboard screen
const { useState: useStateDash, useEffect: useEffectDash, useMemo: useMemoDash } = React;

function Dashboard({ onLogout, tweaks, onNavigate }) {
  const dataState = tweaks?.dataState || "populated";
  const [active, setActive] = useStateDash("dashboard");

  const handleNav = (id) => {
    if (id === "alerts") return onNavigate?.("alerts");
    if (id === "accounts") return onNavigate?.("accounts");
    setActive(id);
  };
  const [range, setRange] = useStateDash("today");
  const [platform, setPlatform] = useStateDash("all");

  // Live-updating numbers
  const [tickedSpend, setTickedSpend] = useStateDash(167284.50);
  const [tickedConv, setTickedConv] = useStateDash(2148);
  const [tickedClicks, setTickedClicks] = useStateDash(48420);
  const [tickedCtr, setTickedCtr] = useStateDash(2.84);

  useEffectDash(() => {
    if (!tweaks?.live) return;
    const tick = setInterval(() => {
      setTickedSpend(v => v + Math.random() * 80 + 20);
      setTickedConv(v => v + (Math.random() > 0.55 ? 1 : 0));
      setTickedClicks(v => v + Math.floor(Math.random() * 18 + 4));
      setTickedCtr(v => Math.max(2.4, Math.min(3.4, v + (Math.random() - 0.5) * 0.04)));
    }, 2200);
    return () => clearInterval(tick);
  }, [tweaks?.live]);

  const hourly = useMemoDash(() => window.genHourlySpend(), []);

  const accountsList = window.MOCK_ACCOUNTS;
  const platformFilter = (a) => platform === "all" || a.platform === platform;
  const filteredAccounts = accountsList.filter(platformFilter);

  // Low funds — accounts with daysLeft <= 7, sorted by urgency
  const lowFunds = useMemoDash(() => {
    return accountsList
      .filter(a => a.dailyBurn > 0 && a.balance / a.dailyBurn <= 7)
      .map(a => ({ ...a, daysLeft: a.balance / a.dailyBurn }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 8);
  }, []);
  const criticalCount = lowFunds.filter(a => a.daysLeft <= 1).length;

  // Group accounts by client name for the table
  const grouped = useMemoDash(() => {
    const m = new Map();
    for (const a of filteredAccounts) {
      if (!m.has(a.name)) m.set(a.name, { name: a.name, accounts: [], spent: 0, conv: 0, ctr: 0, ctrCount: 0, roas: 0, statuses: [] });
      const g = m.get(a.name);
      g.accounts.push(a);
      g.spent += a.spent;
      g.conv += a.conv;
      g.ctr += a.ctr;
      g.ctrCount += 1;
      g.roas += a.roas;
      g.statuses.push(a.status);
    }
    return Array.from(m.values()).map(g => ({
      ...g,
      ctr: g.ctr / g.ctrCount,
      roas: g.roas / g.accounts.length,
      status: g.statuses.includes("warning") ? "warning" : g.statuses.includes("paused") ? "paused" : "active",
    })).sort((a, b) => b.spent - a.spent);
  }, [platform]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className={`variant-${tweaks?.variant || "default"}`}>
      <Sidebar active={active} onNav={handleNav} alertCount={window.ALERTS.length}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">Visão Geral</div>
            <div className="topbar-sub">20 contas · 142 campanhas ativas</div>
          </div>
          <div className="topbar-spacer"/>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "#fff", fontSize: 13 }}>
            <Icon.Calendar/>
            <span>Hoje · 1 mai 2026</span>
          </div>
          <button className="btn btn-secondary btn-sm"><Icon.Download/> Exportar</button>
          <button className="btn btn-ghost btn-sm" onClick={onLogout} title="Sair"><Icon.Logout/></button>
        </div>

        <div className="main">
          {dataState === "error" && (
            <div className="card" style={{ padding: 0 }}>
              <window.EmptyState
                kind="error"
                title="Não conseguimos sincronizar com as plataformas"
                message="Tivemos um problema ao buscar dados do Google Ads e Meta Ads. Suas campanhas continuam rodando normalmente."
                primaryAction={{ label: "Tentar novamente", onClick: () => {} }}
                secondaryAction={{ label: "Ver status do sistema", onClick: () => {} }}
              />
            </div>
          )}

          {dataState === "empty" && (
            <div className="card" style={{ padding: 0 }}>
              <window.EmptyState
                kind="empty"
                title="Conecte sua primeira conta de anúncios"
                message="Assim que você conectar uma conta do Google Ads ou Meta Ads, os KPIs, gráficos e alertas vão aparecer aqui — em tempo real."
                primaryAction={{ label: "Conectar conta", onClick: () => {} }}
                secondaryAction={{ label: "Importar planilha", onClick: () => {} }}
                ghostRows={3}
              />
            </div>
          )}

          {dataState !== "empty" && dataState !== "error" && tweaks?.live && (
            <div className="tickbar">
              <span className="live-dot"/>
              <strong style={{ color: "var(--green-700)" }}>Em tempo real</strong>
              <span style={{ color: "var(--ink-3)" }}>· Dados sincronizados a cada 30 segundos com Google Ads e Meta Ads</span>
              <span className="tickbar-meta">última sync: agora</span>
            </div>
          )}

          {(dataState === "empty" || dataState === "error") ? null : (<>
          {/* Filters */}
          <div className="filter-bar">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4 }}>Plataforma</div>
            <div className={`filter-chip ${platform === "all" ? "active" : ""}`} onClick={() => setPlatform("all")}>Todas</div>
            <div className={`filter-chip ${platform === "google" ? "active" : ""}`} onClick={() => setPlatform("google")}>
              <span className="platform-dot google"/> Google Ads
            </div>
            <div className={`filter-chip ${platform === "meta" ? "active" : ""}`} onClick={() => setPlatform("meta")}>
              <span className="platform-dot meta"/> Meta Ads
            </div>
            <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 6px" }}/>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4 }}>Período</div>
            {["Hoje", "7d", "30d", "90d"].map((r, i) => (
              <div key={r} className={`filter-chip ${i === 0 ? "active" : ""}`}>{r}</div>
            ))}
            <div style={{ flex: 1 }}/>
            <div className="filter-chip"><Icon.Filter/> Mais filtros</div>
          </div>

          {/* Low funds panel — saldo das contas próximo de acabar */}
          {lowFunds.length > 0 && (
            <div className="lowfunds-card">
              <div className="lowfunds-head">
                <div className="lowfunds-head-icon"><Icon.Bolt/></div>
                <div style={{ flex: 1 }}>
                  <h2>Saldo das contas — atenção</h2>
                  <div className="lowfunds-head-sub">{criticalCount > 0 ? <><strong style={{ color: "var(--red-700)" }}>{criticalCount} {criticalCount === 1 ? "conta crítica" : "contas críticas"}</strong> · </> : null}{lowFunds.length} contas com fundos para até 7 dias</div>
                </div>
                <button className="btn btn-secondary btn-sm">Ver todas</button>
                <button className="btn btn-primary btn-sm"><Icon.Plus/> Adicionar fundos</button>
              </div>
              <div className="lowfunds-grid">
                {lowFunds.map(a => {
                  const days = a.daysLeft;
                  const tier = days <= 1 ? "red" : days <= 3 ? "amber" : "green";
                  const pct = Math.min(100, (days / 7) * 100);
                  const daysLabel = days < 1
                    ? `${Math.round(days * 24)}h restantes`
                    : days < 2
                    ? "1 dia"
                    : `${Math.floor(days)} dias`;
                  return (
                    <div key={a.id} className={`lowfunds-item ${tier === "red" ? "critical" : ""}`} onClick={() => onNavigate?.("account", a.name)}>
                      <div className="lowfunds-row1">
                        {a.platform === "google" ? <GoogleAdsMark size={16}/> : <MetaAdsMark size={16}/>}
                        <div className="lowfunds-name">{a.name}</div>
                        <span className={`lowfunds-days-pill ${tier}`}>
                          {tier === "red" && "⚠ "}{daysLabel}
                        </span>
                      </div>
                      <div className="lowfunds-balance">R$ {a.balance.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                      <div className="lowfunds-meta">
                        <span>queima R$ {a.dailyBurn.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/dia</span>
                      </div>
                      <div className="lowfunds-bar">
                        <div className={`lowfunds-bar-fill ${tier}`} style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="lowfunds-foot">
                <span className="live-dot"/>
                <span>Atualizado <strong>agora</strong> · Estimativas baseadas no consumo médio dos últimos 3 dias</span>
                <div style={{ flex: 1 }}/>
                <span style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>clique numa conta para abrir</span>
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="kpi-grid">
            <KPI
              label="Gasto hoje"
              value={<AnimNumber value={tickedSpend} format="currency-int"/>}
              delta={{ dir: "up", value: "+12.4%" }}
              note="vs. ontem"
              trend="up"
              accent="brand"
            />
            <KPI
              label="Conversões"
              value={<AnimNumber value={tickedConv} format="int"/>}
              delta={{ dir: "up", value: "+8.2%" }}
              note="vs. ontem"
              trend="up"
              accent="green"
            />
            <KPI
              label="Cliques"
              value={<AnimNumber value={tickedClicks} format="int"/>}
              delta={{ dir: "up", value: "+5.1%" }}
              note="vs. ontem"
              trend="up"
            />
            <KPI
              label="CTR médio"
              value={<AnimNumber value={tickedCtr} format="pct"/>}
              delta={{ dir: "down", value: "-0.18%" }}
              note="vs. ontem"
              trend="down"
              accent="amber"
            />
          </div>

          {/* Spend chart + Funnel */}
          <div className="chart-grid">
            <div className="chart-card">
              <div className="chart-head">
                <div>
                  <h3 className="chart-title">Gasto por hora · hoje</h3>
                  <div className="chart-sub">Distribuição entre Google Ads e Meta Ads · atualizado em tempo real</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
                  <Legend color="#1a73c2" label="Google Ads"/>
                  <Legend color="#4267b2" label="Meta Ads"/>
                </div>
              </div>
              <SpendChart data={hourly}/>
            </div>

            <div className="chart-card">
              <div className="chart-head">
                <div>
                  <h3 className="chart-title">Funil de conversão</h3>
                  <div className="chart-sub">Últimos 30 dias</div>
                </div>
              </div>
              <FunnelBlock data={window.FUNNEL}/>
              <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 8, fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
                <strong>Retenção em 30 dias:</strong> <span className="mono" style={{ color: "var(--green-700)", fontWeight: 600 }}>59.86%</span> — acima da média do setor (47%).
              </div>
            </div>
          </div>

          {/* AI + Alerts */}
          <div className="chart-grid">
            <AIBlock items={window.AI_INSIGHTS}/>
            <div className="chart-card">
              <div className="chart-head">
                <div>
                  <h3 className="chart-title">Alertas</h3>
                  <div className="chart-sub">5 não lidos</div>
                </div>
                <a href="#" style={{ marginLeft: "auto", fontSize: 12, color: "var(--brand-600)", fontWeight: 600, textDecoration: "none" }}>Ver todos</a>
              </div>
              <AlertsBlock items={window.ALERTS}/>
            </div>
          </div>

          {/* Accounts table */}
          <div className="section-h">
            <h2>Contas geridas</h2>
            <span className="section-h-sub">{grouped.length} clientes · {filteredAccounts.length} contas conectadas</span>
            <div className="section-h-spacer"/>
            <button className="btn btn-secondary btn-sm"><Icon.Plus/> Conectar conta</button>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Plataformas</th>
                  <th style={{ textAlign: "right" }}>Gasto (mês)</th>
                  <th style={{ textAlign: "right" }}>Conversões</th>
                  <th style={{ textAlign: "right" }}>CTR</th>
                  <th style={{ textAlign: "right" }}>ROAS</th>
                  <th>Tendência</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((g, i) => (
                  <tr key={g.name} onClick={() => onNavigate?.("account", g.name)}>
                    <td>
                      <div className="acct-cell">
                        <div className="acct-logo">{g.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                        <div>
                          <div className="acct-name">{g.name}</div>
                          <div className="acct-meta">{g.accounts.length} {g.accounts.length === 1 ? "conta" : "contas"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {g.accounts.find(a => a.platform === "google") && <span className="platform-pill"><span className="platform-dot google"/> G</span>}
                        {g.accounts.find(a => a.platform === "meta") && <span className="platform-pill"><span className="platform-dot meta"/> M</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }} className="mono"><strong>R$ {g.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    <td style={{ textAlign: "right" }} className="mono">{g.conv.toLocaleString("pt-BR")}</td>
                    <td style={{ textAlign: "right" }} className="mono">{g.ctr.toFixed(2)}%</td>
                    <td style={{ textAlign: "right" }} className="mono">
                      <span style={{ color: g.roas >= 4 ? "var(--green-700)" : g.roas >= 2.5 ? "var(--ink-1)" : "var(--red-700)", fontWeight: 600 }}>
                        {g.roas.toFixed(1)}x
                      </span>
                    </td>
                    <td><Sparkline trend={g.roas >= 3.5 ? "up" : "down"} width={80} height={28}/></td>
                    <td>
                      {g.status === "active" && <span className="badge badge-green">● Ativa</span>}
                      {g.status === "warning" && <span className="badge badge-amber">● Atenção</span>}
                      {g.status === "paused" && <span className="badge badge-gray">● Pausada</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ height: 40 }}/>
          </>)}
        </div>
      </main>
    </div>
  );
}

function KPI({ label, value, delta, note, trend, accent }) {
  const accentColor = accent === "brand" ? "#2e5bff" : accent === "green" ? "#12b76a" : accent === "amber" ? "#f79009" : "#667085";
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        <span className={`kpi-delta ${delta.dir}`}>
          {delta.dir === "up" ? <Icon.ArrowUp/> : <Icon.ArrowDown/>}
          {delta.value}
        </span>
        <span>{note}</span>
      </div>
      <svg className="kpi-spark" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d={window.genSparkline(10, trend)} fill="none" stroke={accentColor} strokeWidth="1.6" style={{ transform: "scaleY(0.5) translateY(40px)", transformOrigin: "bottom" }}/>
      </svg>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-2)" }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }}/>
      {label}
    </span>
  );
}

window.Dashboard = Dashboard;
