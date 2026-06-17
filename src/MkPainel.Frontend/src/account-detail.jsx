import React, { useState, useEffect, useMemo } from 'react';
import { api } from './api';
import { Sidebar, Icon, AnimNumber, GoogleAdsMark, MetaAdsMark, Sparkline } from './components';

export function AccountDetail({ clientName, onBack, onNavigate, onCampaignSelect }) {
  const [tab, setTab] = useState("overview");
  const [campaigns, setCampaigns] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dash, camps] = await Promise.all([
          api.getDashboard(),
          api.getCampaigns()
        ]);
        setDashboardData(dash);
        // Filter campaigns belonging to this client (accountName)
        const clientCamps = camps.filter(c => c.accountName === clientName);
        setCampaigns(clientCamps);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erro ao carregar detalhes da conta.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientName]);

  // Aggregate metrics for this client
  const clientSummary = useMemo(() => {
    if (!campaigns.length) {
      return { spent: 0, conv: 0, ctr: 0, roas: 0 };
    }
    const spent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const conv = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const avgCtr = campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length;
    const avgRoas = campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length;
    return { spent, conv, ctr: avgCtr, roas: avgRoas };
  }, [campaigns]);

  // Find accounts belonging to this client from dashboardData
  const accounts = useMemo(() => {
    if (!dashboardData?.connectedAccounts) return [];
    return dashboardData.connectedAccounts.filter(a => a.name === clientName);
  }, [dashboardData, clientName]);

  const initials = clientName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Carregando dados do cliente...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="accounts" onNav={onNavigate} alertCount={dashboardData?.warnings?.length || 0}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Navigation Breadcrumb Topbar */}
        <div className="topbar" style={{ height: "auto", padding: "16px 28px", flexDirection: "column", alignItems: "stretch", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: "4px 10px" }}>← Voltar</button>
            <span style={{ color: "var(--ink-4)" }}>/</span>
            <a href="#" style={{ color: "var(--ink-3)", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); onBack(); }}>Clientes</a>
            <span style={{ color: "var(--ink-4)" }}>/</span>
            <span style={{ color: "var(--ink-1)", fontWeight: 600 }}>{clientName}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="acct-logo" style={{ width: 56, height: 56, fontSize: 18, background: "linear-gradient(135deg, #d1e0ff, #2e5bff)", color: "#fff" }}>{initials}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>{clientName}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center", fontSize: 13, color: "var(--ink-3)" }}>
                <span>{accounts.length} conta(s) conectada(s)</span>
                <span>·</span>
                {accounts.some(a => a.platform === "GoogleAds") && <span className="platform-pill"><span className="platform-dot google"/> Google Ads</span>}
                {accounts.some(a => a.platform === "MetaAds") && <span className="platform-pill"><span className="platform-dot meta"/> Meta Ads</span>}
                <span>·</span>
                <span className="badge badge-green">● Ativa</span>
              </div>
            </div>
            <div style={{ flex: 1 }}/>
            <button className="btn btn-secondary btn-sm" onClick={() => alert("Link de compartilhamento copiado para a área de transferência!")} title="Compartilhar painel white label">
              Compartilhar com cliente
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('dashboard')}>Otimizar com IA</button>
          </div>

          <div style={{ display: "flex", gap: 4, borderBottom: "1px solid transparent", marginTop: 4 }}>
            {[
              { id: "overview", label: "Visão geral" },
              { id: "campaigns", label: `Campanhas (${campaigns.length})` },
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
              {/* KPIs */}
              <div className="kpi-grid">
                <KPIDetail label="Gasto (mês)" value={<AnimNumber value={clientSummary.spent} format="currency-int"/>} delta="Gasto consolidado" trend="up" accent="brand"/>
                <KPIDetail label="Conversões" value={clientSummary.conv.toLocaleString("pt-BR")} delta="Total do período" trend="up" accent="green"/>
                <KPIDetail label="CTR médio" value={clientSummary.ctr.toFixed(2) + "%"} delta="Cliques / Impressões" trend="up" accent="amber"/>
                <KPIDetail label="ROAS Médio" value={clientSummary.roas.toFixed(1) + "x"} delta="Retorno sobre investimento" trend="up" accent="green"/>
              </div>

              {/* Per-platform breakdown */}
              <div className="section-h"><h2>Desempenho por plataforma</h2></div>
              <div className="kpi-grid" style={{ gridTemplateColumns: `repeat(${Math.max(1, accounts.length)}, 1fr)` }}>
                {accounts.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: 12 }}>Nenhuma conta individual configurada na API.</div>
                ) : (
                  accounts.map(a => {
                    const platformCamps = campaigns.filter(c => c.platform === a.platform);
                    const platSpent = platformCamps.reduce((sum, c) => sum + c.spent, 0);
                    const platConv = platformCamps.reduce((sum, c) => sum + c.conversions, 0);
                    const platCtr = platformCamps.length ? platformCamps.reduce((sum, c) => sum + c.ctr, 0) / platformCamps.length : 0;
                    const platRoas = platformCamps.length ? platformCamps.reduce((sum, c) => sum + c.roas, 0) / platformCamps.length : 0;

                    return (
                      <div className="kpi" key={a.id}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          {a.platform === "GoogleAds" ? <GoogleAdsMark size={20}/> : <MetaAdsMark size={20}/>}
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{a.platform === "GoogleAds" ? "Google Ads" : "Meta Ads"}</span>
                          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>Saldo: R$ {a.balance?.toFixed(0)}</span>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
                          R$ {platSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                          <Stat label="Conv." value={platConv}/>
                          <Stat label="CTR" value={platCtr.toFixed(2) + "%"}/>
                          <Stat label="ROAS" value={platRoas.toFixed(1) + "x"} positive={platRoas >= 4}/>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Campaign list for this client */}
              <div className="section-h">
                <h2>Campanhas ativas</h2>
                <span className="section-h-sub">{campaigns.length} campanhas</span>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Campanha</th>
                      <th>Plataforma</th>
                      <th style={{ textAlign: "right" }}>Gasto</th>
                      <th style={{ textAlign: "right" }}>Conv.</th>
                      <th style={{ textAlign: "right" }}>CTR</th>
                      <th style={{ textAlign: "right" }}>ROAS</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => onCampaignSelect(c)}>
                        <td><strong>{c.name}</strong></td>
                        <td>
                          <span className="platform-pill">
                            <span className={`platform-dot ${c.platform === 'GoogleAds' ? 'google' : 'meta'}`}/> 
                            {c.platform === 'GoogleAds' ? 'Google' : 'Meta'}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} className="mono">R$ {c.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td style={{ textAlign: "right" }} className="mono">{c.conversions}</td>
                        <td style={{ textAlign: "right" }} className="mono">{c.ctr.toFixed(2)}%</td>
                        <td className="mono" style={{ textAlign: "right", color: c.roas >= 4 ? "var(--green-700)" : c.roas >= 2.5 ? "var(--ink-1)" : "var(--red-700)", fontWeight: 600 }}>{c.roas.toFixed(1)}x</td>
                        <td>
                          {c.status === "active" ? (
                            <span className="badge badge-green">● Ativa</span>
                          ) : (
                            <span className="badge badge-gray">● Pausada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "campaigns" && (
            <div className="card" style={{ overflow: "hidden" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Campanha</th>
                    <th>Plataforma</th>
                    <th style={{ textAlign: "right" }}>Gasto</th>
                    <th style={{ textAlign: "right" }}>Conv.</th>
                    <th style={{ textAlign: "right" }}>CTR</th>
                    <th style={{ textAlign: "right" }}>ROAS</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => onCampaignSelect(c)}>
                      <td><strong>{c.name}</strong></td>
                      <td>
                        <span className="platform-pill">
                          <span className={`platform-dot ${c.platform === 'GoogleAds' ? 'google' : 'meta'}`}/> 
                          {c.platform === 'GoogleAds' ? 'Google' : 'Meta'}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }} className="mono">R$ {c.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: "right" }} className="mono">{c.conversions}</td>
                      <td style={{ textAlign: "right" }} className="mono">{c.ctr.toFixed(2)}%</td>
                      <td className="mono" style={{ textAlign: "right", color: c.roas >= 4 ? "var(--green-700)" : c.roas >= 2.5 ? "var(--ink-1)" : "var(--red-700)", fontWeight: 600 }}>{c.roas.toFixed(1)}x</td>
                      <td>
                        {c.status === "active" ? (
                          <span className="badge badge-green">● Ativa</span>
                        ) : (
                          <span className="badge badge-gray">● Pausada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "settings" && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 12px' }}>Configurações do Cliente</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>Gerencie as regras de otimização automatizada para {clientName}.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Pausar campanhas com ROAS abaixo de 2.0x</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>A IA emitirá recomendações de pausa imediatamente.</div>
                  </div>
                  <div className="toggle-switch on"/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Avisar saldo no WhatsApp</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Notificar gestores se o saldo durar menos de 3 dias.</div>
                  </div>
                  <div className="toggle-switch on"/>
                </div>
              </div>
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
        <path d={genSparkline(10, trend)} fill="none" stroke={accentColor} strokeWidth="1.6" style={{ transform: "scaleY(0.5) translateY(40px)", transformOrigin: "bottom" }}/>
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
