import React, { useState, useEffect, useMemo } from 'react';
import { api } from './api';
import { Sidebar, Icon, AnimNumber, Sparkline, GoogleAdsMark, MetaAdsMark, EmptyState } from './components';

export function Dashboard({ onLogout, onNavigate, initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [range, setRange] = useState("today");
  const [platform, setPlatform] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Olá! Sou seu assistente de tráfego. Posso analisar suas campanhas, encontrar gargalos e propor pausas ou realocações de orçamento. O que deseja fazer hoje?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Load dashboard, campaigns, suggestions
  const loadData = async () => {
    try {
      setError(null);
      const [dash, camps, sugs] = await Promise.all([
        api.getDashboard(),
        api.getCampaigns(),
        api.getSuggestions('PendingApproval')
      ]);
      setDashboardData(dash);
      setCampaigns(camps);
      setSuggestions(sugs);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync campaigns for a specific account or the first connected account
  const handleSync = async () => {
    if (!dashboardData?.connectedAccounts?.length) return;
    setSyncing(true);
    try {
      // Sync the first account for simplicity, or all of them
      for (const acct of dashboardData.connectedAccounts) {
        await api.syncCampaigns(acct.id);
      }
      await loadData();
    } catch (err) {
      alert(err.message || 'Erro ao sincronizar dados.');
    } finally {
      setSyncing(false);
    }
  };

  // Approve AI recommendation
  const handleApproveSuggestion = async (id) => {
    try {
      await api.approveSuggestion(id);
      await loadData(); // Reload stats and campaigns
      alert('Sugestão aprovada e executada com sucesso!');
    } catch (err) {
      alert(err.message || 'Erro ao aprovar sugestão.');
    }
  };

  // Reject AI recommendation
  const handleRejectSuggestion = async (id) => {
    try {
      await api.rejectSuggestion(id);
      await loadData();
      alert('Sugestão recusada.');
    } catch (err) {
      alert(err.message || 'Erro ao recusar sugestão.');
    }
  };

  // Send message to AI assistant
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await api.promptChat(userMsg);
      setChatMessages(prev => [...prev, { role: 'assistant', text: res.response }]);
      // Reload suggestions since the chat might have proposed a new pause/budget adjust
      const newSugs = await api.getSuggestions('PendingApproval');
      setSuggestions(newSugs);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Desculpe, ocorreu um erro ao processar sua solicitação.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Low funds calculation from connectedAccounts
  const lowFunds = useMemo(() => {
    if (!dashboardData?.connectedAccounts) return [];
    return dashboardData.connectedAccounts
      .filter(a => a.dailyBurn > 0 && a.balance / a.dailyBurn <= 7)
      .map(a => ({ ...a, daysLeft: a.balance / a.dailyBurn }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 8);
  }, [dashboardData]);

  const criticalCount = lowFunds.filter(a => a.daysLeft <= 1).length;

  // Group campaigns by client name (accountName) for the main table
  const groupedClients = useMemo(() => {
    if (!campaigns.length) return [];
    
    // Filter campaigns first
    const filteredCamps = campaigns.filter(c => {
      const matchPlat = platform === 'all' || 
        (platform === 'google' && c.platform === 'GoogleAds') ||
        (platform === 'meta' && c.platform === 'MetaAds');
      const matchSearch = !searchTerm || c.accountName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchPlat && matchSearch;
    });

    const m = new Map();
    for (const c of filteredCamps) {
      if (!m.has(c.accountName)) {
        m.set(c.accountName, {
          name: c.accountName,
          spent: 0,
          conv: 0,
          ctr: 0,
          ctrCount: 0,
          roas: 0,
          roasCount: 0,
          platforms: new Set(),
          status: 'active',
          statuses: []
        });
      }
      const g = m.get(c.accountName);
      g.spent += c.spent;
      g.conv += c.conversions;
      g.ctr += c.ctr;
      g.ctrCount += 1;
      g.roas += c.roas;
      g.roasCount += 1;
      g.platforms.add(c.platform);
      g.statuses.push(c.status);
    }

    return Array.from(m.values()).map(g => ({
      ...g,
      ctr: g.ctrCount ? g.ctr / g.ctrCount : 0,
      roas: g.roasCount ? g.roas / g.roasCount : 0,
      status: g.statuses.includes('warning') ? 'warning' : g.statuses.includes('paused') ? 'paused' : 'active',
    })).sort((a, b) => b.spent - a.spent);
  }, [campaigns, platform, searchTerm]);

  // Fallback / mock graph values for spent hourly
  const hourlySpend = [
    { hour: 0, google: 120, meta: 80 }, { hour: 2, google: 60, meta: 40 },
    { hour: 4, google: 40, meta: 30 }, { hour: 6, google: 90, meta: 60 },
    { hour: 8, google: 450, meta: 300 }, { hour: 10, google: 980, meta: 650 },
    { hour: 12, google: 1450, meta: 980 }, { hour: 14, google: 1850, meta: 1200 },
    { hour: 16, google: 2200, meta: 1540 }, { hour: 18, google: 2400, meta: 1720 },
    { hour: 20, google: 1900, meta: 1300 }, { hour: 22, google: 800, meta: 520 },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Carregando MKPainel...</div>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || { spent: 0, conversions: 0, clicks: 0, avgRoas: 0 };
  const hasAccounts = dashboardData?.connectedAccounts?.length > 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="dashboard" onNav={onNavigate} alertCount={dashboardData?.warnings?.length || 0}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">Visão Geral</div>
            <div className="topbar-sub">
              {dashboardData?.connectedAccounts?.length || 0} contas · {campaigns.length} campanhas
            </div>
          </div>
          <div className="topbar-spacer"/>
          <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Sincronizando...' : 'Sincronizar APIs'}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "#fff", fontSize: 13 }}>
            <Icon.Calendar/>
            <span>Hoje · {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout} title="Sair"><Icon.Logout/></button>
        </div>

        <div className="main">
          {!hasAccounts ? (
            <div className="card" style={{ padding: 0 }}>
              <EmptyState
                kind="empty"
                title="Conecte sua primeira conta de anúncios"
                message="Assim que você conectar uma conta do Google Ads ou Meta Ads no Onboarding, os KPIs, gráficos e alertas vão aparecer aqui — em tempo real."
                primaryAction={{ label: "Ir para Conexão", onClick: () => onNavigate('onboarding') }}
              />
            </div>
          ) : (
            <>
              {syncing && (
                <div className="tickbar">
                  <span className="live-dot"/>
                  <strong style={{ color: "var(--green-700)" }}>Sincronizando</strong>
                  <span style={{ color: "var(--ink-3)" }}>· Buscando métricas recentes do Google Ads e Meta Ads...</span>
                </div>
              )}

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
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4 }}>Pesquisa</div>
                <input
                  type="text"
                  placeholder="Pesquisar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '4px 12px', border: '1px solid var(--border-strong)',
                    borderRadius: 999, fontSize: 12, width: 180, outline: 'none'
                  }}
                />
              </div>

              {/* Low funds panel */}
              {lowFunds.length > 0 && (
                <div className="lowfunds-card">
                  <div className="lowfunds-head">
                    <div className="lowfunds-head-icon"><Icon.Bolt/></div>
                    <div style={{ flex: 1 }}>
                      <h2>Saldo das contas — atenção</h2>
                      <div className="lowfunds-head-sub">
                        {criticalCount > 0 ? <><strong style={{ color: "var(--red-700)" }}>{criticalCount} {criticalCount === 1 ? "conta crítica" : "contas críticas"}</strong> · </> : null}
                        {lowFunds.length} contas com fundos para até 7 dias
                      </div>
                    </div>
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
                        <div key={a.id} className={`lowfunds-item ${tier === "red" ? "critical" : ""}`} onClick={() => onNavigate('account', a.name)}>
                          <div className="lowfunds-row1">
                            {a.platform === "GoogleAds" ? <GoogleAdsMark size={16}/> : <MetaAdsMark size={16}/>}
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
                </div>
              )}

              {/* KPIs */}
              <div className="kpi-grid">
                <KPI
                  label="Investimento Total"
                  value={<AnimNumber value={kpis.spent} format="currency-int"/>}
                  delta={{ dir: "up", value: "+12.4%" }}
                  note="vs. período anterior"
                  trend="up"
                  accent="brand"
                />
                <KPI
                  label="Conversões"
                  value={<AnimNumber value={kpis.conversions} format="int"/>}
                  delta={{ dir: "up", value: "+8.2%" }}
                  note="vs. período anterior"
                  trend="up"
                  accent="green"
                />
                <KPI
                  label="Cliques"
                  value={<AnimNumber value={kpis.clicks} format="int"/>}
                  delta={{ dir: "up", value: "+5.1%" }}
                  note="vs. período anterior"
                  trend="up"
                />
                <KPI
                  label="ROAS Médio"
                  value={<AnimNumber value={kpis.avgRoas} format="x"/>}
                  delta={{ dir: "up", value: "+0.2" }}
                  note="vs. anterior"
                  trend="up"
                  accent="green"
                />
              </div>

              {/* Spend chart + Funnel */}
              <div className="chart-grid">
                <div className="chart-card">
                  <div className="chart-head">
                    <div>
                      <h3 className="chart-title">Curva de Gasto Diário</h3>
                      <div className="chart-sub">Distribuição horária consolidada entre as redes</div>
                    </div>
                  </div>
                  <SpendChart data={hourlySpend}/>
                </div>

                <div className="chart-card">
                  <div className="chart-head">
                    <div>
                      <h3 className="chart-title">Funil de Conversão</h3>
                      <div className="chart-sub">Métricas acumuladas</div>
                    </div>
                  </div>
                  <FunnelBlock kpis={kpis}/>
                </div>
              </div>

              {/* AI Suggestion + Warnings */}
              <div className="chart-grid">
                {/* AI Chat Suggestions Panel */}
                <div className="chart-card">
                  <div className="ai-head" style={{ marginBottom: 12 }}>
                    <div className="ai-mark"><Icon.Sparkle/></div>
                    <span className="ai-label">Assistente de Tráfego IA</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto', padding: 12, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 12 }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.role === 'user' ? 'var(--brand-600)' : '#fff',
                        color: msg.role === 'user' ? '#fff' : 'var(--ink-1)',
                        padding: '8px 12px', borderRadius: 8, maxWidth: '85%', fontSize: 13,
                        boxShadow: 'var(--shadow-xs)', border: msg.role === 'user' ? 'none' : '1px solid var(--border)'
                      }}>
                        {msg.text}
                      </div>
                    ))}
                    {chatLoading && <div style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>IA está analisando suas campanhas...</div>}
                  </div>

                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <input
                      className="input"
                      type="text"
                      placeholder="Ex: pausar campanha de menor ROAS..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                    />
                    <button type="submit" className="btn btn-primary" disabled={chatLoading} style={{ padding: '0 18px' }}>
                      <Icon.Send/>
                    </button>
                  </form>

                  {/* Recommendation Cards */}
                  {suggestions.length > 0 && (
                    <div className="ai-list">
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-700)', textTransform: 'uppercase', marginBottom: 4 }}>Recomendações Criadas pela IA:</div>
                      {suggestions.map(s => (
                        <div key={s.id} className="ai-item" style={{ flexDirection: 'column', background: '#fff', border: '1px solid var(--brand-100)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div className="ai-item-title" style={{ color: 'var(--ink-1)' }}>{s.campaignName}</div>
                            <span className="badge badge-amber">{s.platform === 'GoogleAds' ? 'Google' : 'Meta'}</span>
                          </div>
                          <div className="ai-item-msg" style={{ marginTop: 4 }}>{s.reasoning}</div>
                          <div className="ai-item-impact" style={{ marginTop: 6, color: 'var(--green-700)', fontWeight: 600 }}>Impacto: {s.projectedImpact}</div>
                          <div className="ai-item-actions" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleApproveSuggestion(s.id)}>Aprovar Alteração</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleRejectSuggestion(s.id)}>Ignorar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Warnings Stack */}
                <div className="chart-card">
                  <div className="chart-head">
                    <div>
                      <h3 className="chart-title">Alertas e Anomalias</h3>
                      <div className="chart-sub">{dashboardData.warnings?.length || 0} não resolvidos</div>
                    </div>
                  </div>
                  <div className="alerts-stack" style={{ maxHeight: 420, overflowY: 'auto' }}>
                    {dashboardData.warnings?.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', paddingTop: 40 }}>Nenhum alerta crítico detectado nas contas.</div>
                    ) : (
                      dashboardData.warnings?.map((w, idx) => (
                        <div key={idx} className={`alert ${w.severity === 'critical' || w.type === 'balance_low' ? 'red' : 'amber'}`}>
                          <div className="alert-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)' }}>
                              <strong>{w.accountName}</strong>
                              <span>{w.severity?.toUpperCase()}</span>
                            </div>
                            <div className="alert-title" style={{ marginTop: 4, fontWeight: 600 }}>{w.type?.replace('_', ' ').toUpperCase()}</div>
                            <div className="alert-msg" style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{w.message}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Connected Accounts / Grouped Clients */}
              <div className="section-h">
                <h2>Clientes Geridos</h2>
                <span className="section-h-sub">{groupedClients.length} clientes consolidando contas</span>
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
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedClients.map((g) => (
                      <tr key={g.name} onClick={() => onNavigate('account', g.name)}>
                        <td>
                          <div className="acct-cell">
                            <div className="acct-logo">{g.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</div>
                            <div>
                              <div className="acct-name">{g.name}</div>
                              <div className="acct-meta">{g.ctrCount} conta(s)</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {g.platforms.has('GoogleAds') && <span className="platform-pill"><span className="platform-dot google"/> G</span>}
                            {g.platforms.has('MetaAds') && <span className="platform-pill"><span className="platform-dot meta"/> M</span>}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }} className="mono"><strong>R$ {g.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></td>
                        <td style={{ textAlign: "right" }} className="mono">{g.conv.toLocaleString("pt-BR")}</td>
                        <td style={{ textAlign: "right" }} className="mono">{g.ctr.toFixed(2)}%</td>
                        <td style={{ textAlign: "right" }} className="mono">
                          <span style={{ color: g.roas >= 4 ? "var(--green-700)" : g.roas >= 2.5 ? "var(--ink-1)" : "var(--red-700)", fontWeight: 600 }}>
                            {g.roas.toFixed(1)}x
                          </span>
                        </td>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Subcomponents for Dashboard
function KPI({ label, value, delta, note, trend, accent }) {
  const accentColor = accent === "brand" ? "#2e5bff" : accent === "green" ? "#12b76a" : accent === "amber" ? "#f79009" : "#667085";
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        <span className={`kpi-delta ${trend}`}>
          {trend === "up" ? <Icon.ArrowUp/> : <Icon.ArrowDown/>}
          {delta.value}
        </span>
        <span>{note}</span>
      </div>
      <svg className="kpi-spark" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d={genSparkline(10, trend)} fill="none" stroke={accentColor} strokeWidth="1.6" style={{ transform: "scaleY(0.5) translateY(40px)", transformOrigin: "bottom" }}/>
      </svg>
    </div>
  );
}

function SpendChart({ data }) {
  // Simple CSS SVG based bar line chart visualization
  const maxVal = Math.max(...data.map(d => Math.max(d.google, d.meta)));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: 160, gap: 4, paddingTop: 20 }}>
      {data.map((d, i) => {
        const gPct = (d.google / maxVal) * 100;
        const mPct = (d.meta / maxVal) * 100;
        return (
          <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end', gap: 1 }}>
              <div style={{ background: '#1a73c2', height: `${gPct}%`, borderRadius: 2 }} title={`Google: R$ ${d.google.toFixed(0)}`}/>
              <div style={{ background: '#4267b2', height: `${mPct}%`, borderRadius: 2 }} title={`Meta: R$ ${d.meta.toFixed(0)}`}/>
            </div>
            <div style={{ fontSize: 9, color: 'var(--ink-4)', textAlign: 'center', marginTop: 4 }}>{d.hour}h</div>
          </div>
        );
      })}
    </div>
  );
}

function FunnelBlock({ kpis }) {
  const impressions = kpis.spent * 250; // simple mock impressions based on spent
  const clicks = kpis.clicks || kpis.spent * 5;
  const conversions = kpis.conversions;
  const retained = Math.round(conversions * 0.6);

  const steps = [
    { label: 'Impressões', val: impressions, colorClass: 'f-1' },
    { label: 'Cliques', val: clicks, colorClass: 'f-2' },
    { label: 'Conversões', val: conversions, colorClass: 'f-3' },
    { label: 'Retidos (30d)', val: retained, colorClass: 'f-4' }
  ];

  const maxVal = impressions || 1;

  return (
    <div className="funnel" style={{ marginTop: 14 }}>
      {steps.map((s, idx) => {
        const pct = (s.val / maxVal) * 100;
        return (
          <div key={idx} className="funnel-row">
            <div className={`funnel-bar ${s.colorClass}`} style={{ width: `${Math.max(15, pct)}%` }}/>
            <div className="funnel-content">
              <span className="funnel-label">{s.label}</span>
              <span className="funnel-value">{s.val.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
