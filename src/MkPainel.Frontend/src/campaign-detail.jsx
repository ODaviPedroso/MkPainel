import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Sidebar, Icon, GoogleAdsMark, MetaAdsMark, Sparkline, EmptyState } from './components';

export function CampaignDetail({ campaign, onBack, onNavigate }) {
  const [tab, setTab] = useState("performance");
  const [status, setStatus] = useState(campaign.status);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDash = async () => {
      try {
        const data = await api.getDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDash();
  }, []);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      if (status === 'active') {
        const res = await api.pauseCampaign(campaign.id);
        if (res.success) {
          setStatus('paused');
          alert('Campanha pausada com sucesso!');
        }
      } else {
        const res = await api.resumeCampaign(campaign.id);
        if (res.success) {
          setStatus('active');
          alert('Campanha reativada com sucesso!');
        }
      }
    } catch (err) {
      alert(err.message || 'Erro ao alterar status da campanha.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (n, d = 2) => "R$ " + fmt(n, d);

  // Mock creatives & keywords since they are client-side only in prototype
  const isMeta = campaign.platform === 'MetaAds';
  const creatives = isMeta ? [
    { id: "ad-1", name: "Vídeo · Coleção Verão · 30s", type: "video", impressions: 78420, ctr: 2.84, conv: 68, cpa: 42.10, status: "winning" },
    { id: "ad-2", name: "Carrossel · Looks até R$ 199", type: "carousel", impressions: 54180, ctr: 2.40, conv: 41, cpa: 48.30, status: "ok" },
    { id: "ad-3", name: "Imagem única · Frete grátis", type: "image", impressions: 32840, ctr: 1.62, conv: 22, cpa: 71.20, status: "watch" },
    { id: "ad-4", name: "Vídeo · Depoimento cliente", type: "video", impressions: 18880, ctr: 1.18, conv: 11, cpa: 92.40, status: "pause" },
  ] : [
    { id: "ad-1", name: "Brand · Bella Moda", type: "text", impressions: 28640, ctr: 12.4, conv: 124, cpa: 38.20, status: "winning" },
    { id: "ad-2", name: "Categoria · Vestidos", type: "text", impressions: 26820, ctr: 7.20, conv: 58, cpa: 64.10, status: "ok" },
    { id: "ad-3", name: "Categoria · Calçados", type: "text", impressions: 21420, ctr: 5.80, conv: 24, cpa: 84.50, status: "watch" },
    { id: "ad-4", name: "DSA · Catálogo completo", type: "text", impressions: 15600, ctr: 3.10, conv: 12, cpa: 142.00, status: "pause" },
  ];

  const history = [
    { date: "Hoje", actor: "Sistema", action: `Campanha foi ${status === 'active' ? 'Reativada' : 'Pausada'} manual pelo painel`, kind: "edit" },
    { date: "há 2 dias", actor: "MK · IA", action: "Aumentou lance de 'Brand' em +18% (CPA cabe na meta)", kind: "ai" },
    { date: "há 6 dias", actor: "Davi Silva", action: "Orçamento diário alterado: R$ 280 → R$ 320", kind: "edit" },
    { date: "há 16 dias", actor: "Sistema", action: "Campanha importada e iniciada", kind: "create" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="dashboard" onNav={onNavigate} alertCount={dashboardData?.warnings?.length || 0}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar with Breadcrumb */}
        <div className="topbar" style={{ flexDirection: "column", height: "auto", alignItems: "stretch", paddingTop: 14, paddingBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-3)" }}>
            <button onClick={onBack} className="link-back" style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "none", border: "none", padding: 0, cursor: "pointer",
              color: "var(--ink-3)", fontSize: 12, fontFamily: "inherit",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              {campaign.accountName}
            </button>
            <span>/</span>
            <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>Campanha</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, paddingBottom: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <PlatformBadge platform={campaign.platform}/>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: status === 'active' ? '#16a34a' : 'var(--ink-3)',
                  background: status === 'active' ? '#dcfce7' : 'var(--surface-2)',
                  padding: "3px 8px", borderRadius: 4,
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: status === 'active' ? '#16a34a' : 'var(--ink-3)' }}/>
                  {status === 'active' ? 'Ativa' : 'Pausada'}
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Atualizado: {new Date(campaign.lastSyncedAt).toLocaleString('pt-BR')}</span>
              </div>
              <h1 className="topbar-title" style={{ fontSize: 20, margin: 0 }}>{campaign.name}</h1>
              <div className="topbar-sub" style={{ marginTop: 2 }}>CBO · Orçamento Diário {money(campaign.budget)}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className={`btn ${status === 'active' ? 'btn-secondary' : 'btn-primary'} btn-sm`} onClick={handleToggleStatus} disabled={loading}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {status === 'active' ? (
                    <rect x="6" y="4" width="4" height="16"/>
                  ) : (
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                  )}
                  {status === 'active' ? <rect x="14" y="4" width="4" height="16"/> : null}
                </svg>
                {status === 'active' ? 'Pausar Campanha' : 'Reativar Campanha'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: -1 }}>
            {[
              { id: "performance", label: "Performance" },
              { id: "creatives", label: `Criativos · ${creatives.length}` },
              { id: "history", label: "Histórico" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "10px 16px", background: "none", border: "none",
                borderBottom: tab === t.id ? "2px solid var(--brand-600)" : "2px solid transparent",
                color: tab === t.id ? "var(--brand-600)" : "var(--ink-3)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit",
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <main className="main">
          {/* KPIs */}
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {[
              { label: "Gasto Consolidado", value: money(campaign.spent), foot: "Orçamento " + money(campaign.budget) },
              { label: "Conversões", value: campaign.conversions, foot: "CPA Médio " + money(campaign.spent / (campaign.conversions || 1)) },
              { label: "ROAS da Campanha", value: campaign.roas.toFixed(1) + "x", foot: "Meta de Conta: 3.0x" },
              { label: "CTR Geral", value: campaign.ctr.toFixed(2) + "%", foot: campaign.clicks + " cliques" },
            ].map((k, i) => (
              <div key={i} className="kpi">
                <div className="kpi-label">{k.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="kpi-value">{k.value}</div>
                  <Sparkline trend={campaign.roas >= 2.5 ? "up" : "down"}/>
                </div>
                <div className="kpi-foot" style={{ marginTop: 8 }}>{k.foot}</div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          {tab === "performance" && (
            <div className="card" style={{ padding: 20 }}>
              <div className="chart-head" style={{ marginBottom: 12 }}>
                <div>
                  <div className="chart-title">Desempenho Diário</div>
                  <div className="chart-sub">Investimento vs. Retorno da Campanha</div>
                </div>
              </div>
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', background: 'var(--surface-2)', borderRadius: 8 }}>
                [ Gráfico de Tendência da Campanha (Visualização Integrada) ]
              </div>
            </div>
          )}

          {tab === "creatives" && (
            <div className="card" style={{ padding: 0 }}>
              <div className="lowfunds-head" style={{ borderBottom: "1px solid var(--border)" }}>
                <h2>Criativos e Anúncios</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 0 }}>
                {creatives.map((cr, i) => (
                  <div key={cr.id} style={{
                    padding: "16px 18px",
                    borderRight: i % 2 === 0 ? "1px solid var(--border)" : "none",
                    borderBottom: "1px solid var(--border)",
                    display: "flex", gap: 14,
                  }}>
                    <CreativeThumb type={cr.type} status={cr.status}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", lineHeight: 1.3 }}>{cr.name}</div>
                        {statusChip(cr.status)}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 8 }}>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Impr.</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", fontFamily: "var(--font-mono)" }}>{cr.impressions.toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>CTR</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", fontFamily: "var(--font-mono)" }}>{cr.ctr.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>CPA</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", fontFamily: "var(--font-mono)" }}>{money(cr.cpa)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: "8px 0" }}>
                {history.map((h, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "120px auto 1fr",
                    gap: 14, padding: "14px 20px", alignItems: "flex-start",
                    borderBottom: i < history.length - 1 ? "1px solid var(--surface-2)" : "none",
                  }}>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{h.date}</div>
                    <div style={{ position: "relative", paddingTop: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: h.kind === 'ai' ? '#2e5bff' : '#16a34a' }}/>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.45 }}>{h.action}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>{h.actor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </main>
    </div>
  );
}

function PlatformBadge({ platform }) {
  const isMeta = platform === "MetaAds";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", fontSize: 11, fontWeight: 600,
      borderRadius: 6,
      background: isMeta ? "#1877f210" : "#4285f410",
      color: isMeta ? "#1877f2" : "#4285f4",
      border: `1px solid ${isMeta ? "#1877f230" : "#4285f430"}`,
    }}>
      {isMeta ? <MetaAdsMark size={14}/> : <GoogleAdsMark size={14}/>}
      {isMeta ? "Meta Ads" : "Google Ads"}
    </span>
  );
}

function CreativeThumb({ type, status }) {
  const colors = {
    winning: { bg: "#dcfce7", fg: "#16a34a" },
    ok: { bg: "#eef2ff", fg: "#6366f1" },
    watch: { bg: "#fef3c7", fg: "#d97706" },
    pause: { bg: "#fee2e2", fg: "#dc2626" },
  }[status] || { bg: "#f1f5f9", fg: "#475569" };

  return (
    <div style={{
      width: 56, height: 56, borderRadius: 10,
      background: colors.bg, color: colors.fg,
      display: "grid", placeItems: "center", flexShrink: 0,
      fontSize: 12, fontWeight: 700
    }}>
      {type.toUpperCase()}
    </div>
  );
}

function statusChip(status) {
  const map = {
    winning: { label: "Vencedor", color: "#16a34a", bg: "#dcfce7" },
    ok: { label: "OK", color: "#475569", bg: "#f1f5f9" },
    watch: { label: "Observar", color: "#d97706", bg: "#fef3c7" },
    pause: { label: "Pausar?", color: "#dc2626", bg: "#fee2e2" },
  };
  const m = map[status] || { label: status, color: "#667085", bg: "#f2f4f7" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 7px",
      borderRadius: 4, color: m.color, background: m.bg,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>{m.label}</span>
  );
}
