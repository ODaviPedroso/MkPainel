// MKPainel — Campaign drill-down screen
// Reached from clicking a campaign row inside the account-detail screen.
const { useState: useStateCamp, useMemo: useMemoCamp } = React;

// ── Mock campaign data ───────────────────────────────────────
function buildMockCampaign(clientName, platform, campaignName) {
  const isMeta = platform === "meta";
  return {
    name: campaignName || (isMeta ? "Conversões — Coleção Verão 2026" : "Search Brand + Categorias"),
    platform,
    status: "active",
    client: clientName,
    objective: isMeta ? "Conversões (compra)" : "Conversões (lead/compra)",
    budget: isMeta ? 320 : 580,
    budgetUsed: isMeta ? 248.40 : 462.10,
    startDate: "12 abr 2026",
    bidStrategy: isMeta ? "Menor custo" : "tCPA · R$ 38,00",
    delivery: "Estável",
    spent7d: isMeta ? 1742.80 : 3234.70,
    spent30d: isMeta ? 7240.50 : 13820.00,
    impressions: isMeta ? 184320 : 92480,
    clicks: isMeta ? 4218 : 6840,
    ctr: isMeta ? 2.29 : 7.39,
    conv: isMeta ? 142 : 218,
    cpa: isMeta ? 51.0 : 63.4,
    roas: isMeta ? 4.1 : 5.8,
    revenue: isMeta ? 29680 : 80164,
    creatives: isMeta ? [
      { id: "ad-1", name: "Vídeo · Coleção Verão · 30s", type: "video", impressions: 78420, ctr: 2.84, conv: 68, cpa: 42.10, status: "winning" },
      { id: "ad-2", name: "Carrossel · Looks até R$ 199", type: "carousel", impressions: 54180, ctr: 2.40, conv: 41, cpa: 48.30, status: "ok" },
      { id: "ad-3", name: "Imagem única · Frete grátis", type: "image", impressions: 32840, ctr: 1.62, conv: 22, cpa: 71.20, status: "watch" },
      { id: "ad-4", name: "Vídeo · Depoimento cliente", type: "video", impressions: 18880, ctr: 1.18, conv: 11, cpa: 92.40, status: "pause" },
    ] : [
      { id: "ad-1", name: "Brand · Bella Moda", type: "text", impressions: 28640, ctr: 12.4, conv: 124, cpa: 38.20, status: "winning" },
      { id: "ad-2", name: "Categoria · Vestidos", type: "text", impressions: 26820, ctr: 7.20, conv: 58, cpa: 64.10, status: "ok" },
      { id: "ad-3", name: "Categoria · Calçados", type: "text", impressions: 21420, ctr: 5.80, conv: 24, cpa: 84.50, status: "watch" },
      { id: "ad-4", name: "DSA · Catálogo completo", type: "text", impressions: 15600, ctr: 3.10, conv: 12, cpa: 142.00, status: "pause" },
    ],
    audiences: isMeta ? [
      { name: "Compradores 90d (LAL 1%)", reach: 482000, freq: 2.1, conv: 64, cpa: 43.20 },
      { name: "Visitantes carrinho 30d", reach: 28400, freq: 4.8, conv: 38, cpa: 38.10 },
      { name: "Interesses · Moda feminina 25-45", reach: 1820000, freq: 1.4, conv: 28, cpa: 68.40 },
      { name: "Engajou Instagram 60d", reach: 64200, freq: 3.2, conv: 12, cpa: 92.00 },
    ] : [
      { name: "Brand · pesquisa exata", reach: 18420, freq: null, conv: 124, cpa: 38.20 },
      { name: "Vestidos · longa cauda", reach: 42180, freq: null, conv: 58, cpa: 64.10 },
      { name: "Concorrentes · pesquisa frase", reach: 12840, freq: null, conv: 18, cpa: 88.00 },
      { name: "RLSA · visitantes 540d", reach: 8460, freq: null, conv: 18, cpa: 32.40 },
    ],
    history: [
      { date: "há 2 dias", actor: "MK · IA", action: "Aumentou lance de 'Brand' em +18% (CPA cabe na meta)", kind: "ai" },
      { date: "há 4 dias", actor: "Davi Silva", action: "Pausou criativo 'Depoimento cliente' (CTR <1.2%)", kind: "edit" },
      { date: "há 6 dias", actor: "Sistema", action: "Orçamento diário alterado: R$ 280 → R$ 320", kind: "edit" },
      { date: "há 8 dias", actor: "MK · IA", action: "Sugeriu pausar audiência 'Interesses moda 18-24' — recusado", kind: "ai-rejected" },
      { date: "há 12 dias", actor: "Davi Silva", action: "Adicionou criativo 'Vídeo · Coleção Verão · 30s'", kind: "create" },
      { date: "há 16 dias", actor: "Sistema", action: "Campanha criada", kind: "create" },
    ],
  };
}

// ── Components ───────────────────────────────────────────────
function PlatformBadgeCamp({ platform }) {
  const isMeta = platform === "meta";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", fontSize: 11, fontWeight: 600,
      borderRadius: 6,
      background: isMeta ? "#1877f210" : "#4285f410",
      color: isMeta ? "#1877f2" : "#4285f4",
      border: `1px solid ${isMeta ? "#1877f230" : "#4285f430"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}/>
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
  }[status];
  const Icon = {
    video: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>,
    image: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
    carousel: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="14" height="14" rx="2"/><path d="M18 4l4 0 0 14"/></svg>,
    text: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/></svg>,
  }[type];
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 10,
      background: colors.bg, color: colors.fg,
      display: "grid", placeItems: "center", flexShrink: 0,
    }}><Icon/></div>
  );
}

function statusChip(status) {
  const map = {
    winning: { label: "Vencedor", color: "#16a34a", bg: "#dcfce7" },
    ok: { label: "OK", color: "#475569", bg: "#f1f5f9" },
    watch: { label: "Observar", color: "#d97706", bg: "#fef3c7" },
    pause: { label: "Pausar?", color: "#dc2626", bg: "#fee2e2" },
  };
  const m = map[status];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 7px",
      borderRadius: 4, color: m.color, background: m.bg,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>{m.label}</span>
  );
}

function CampaignDetail({ clientName, platform, campaignName, onBack, tweaks }) {
  const c = useMemoCamp(() => buildMockCampaign(clientName, platform, campaignName), [clientName, platform, campaignName]);
  const hourly = useMemoCamp(() => window.genHourlySpend(), [clientName, platform, campaignName]);
  const [tab, setTab] = useStateCamp("performance");
  const dataState = tweaks?.dataState || "populated";

  const fmt = (n, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (n, d = 2) => "R$ " + fmt(n, d);

  const Sidebar = window.Sidebar;
  const Topbar = window.Topbar;
  const Sparkline = window.Sparkline;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="dashboard" onNav={(id) => window.__appNav?.(id)} alertCount={window.ALERTS?.length || 5}/>
      <div className="app">
        {/* Topbar with breadcrumb */}
        <div className="topbar" style={{ flexDirection: "column", height: "auto", alignItems: "stretch", paddingTop: 14, paddingBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-3)" }}>
            <button onClick={onBack} className="link-back" style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "none", border: "none", padding: 0, cursor: "pointer",
              color: "var(--ink-3)", fontSize: 12, fontFamily: "inherit",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              {clientName}
            </button>
            <span>/</span>
            <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>Campanha</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, paddingBottom: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <PlatformBadgeCamp platform={platform}/>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: "#16a34a",
                  background: "#dcfce7", padding: "3px 8px", borderRadius: 4,
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }}/>
                  Ativa
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Desde {c.startDate}</span>
              </div>
              <h1 className="topbar-title" style={{ fontSize: 20, margin: 0 }}>{c.name}</h1>
              <div className="topbar-sub" style={{ marginTop: 2 }}>{c.objective} · {c.bidStrategy}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-secondary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                Pausar
              </button>
              <button className="btn btn-secondary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9"/><polyline points="3 4 3 9 8 9"/></svg>
                Duplicar
              </button>
              <button className="btn btn-primary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: -1 }}>
            {[
              { id: "performance", label: "Performance" },
              { id: "creatives", label: `Criativos · ${c.creatives.length}` },
              { id: "audiences", label: `${platform === "meta" ? "Públicos" : "Palavras-chave"} · ${c.audiences.length}` },
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
          {/* ── KPIs (shown always) ── */}
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {[
              { label: "Gasto · 30d", value: money(c.spent30d), foot: "Orçamento diário " + money(c.budget) },
              { label: "Conversões", value: fmt(c.conv), foot: "CPA " + money(c.cpa) },
              { label: "ROAS", value: c.roas.toFixed(1) + "x", foot: "Receita " + money(c.revenue, 0) },
              { label: "CTR", value: c.ctr.toFixed(2) + "%", foot: fmt(c.clicks) + " cliques" },
            ].map((k, i) => (
              <div key={i} className="kpi">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-row">
                  <div className="kpi-value">{k.value}</div>
                  <Sparkline trend="up" stroke="#2e5bff"/>
                </div>
                <div className="kpi-foot">{k.foot}</div>
              </div>
            ))}
          </div>

          {/* ── Tab content ── */}
          {dataState === "error" && (
            <div className="card" style={{ padding: 0 }}>
              <window.EmptyState
                kind="error"
                title="Não conseguimos carregar esta campanha"
                message={`A integração com ${platform === "meta" ? "Meta Ads" : "Google Ads"} retornou um erro. Os dados podem estar temporariamente indisponíveis.`}
                primaryAction={{ label: "Tentar novamente", onClick: () => {} }}
                secondaryAction={{ label: "Ver status das integrações", onClick: () => {} }}
              />
            </div>
          )}

          {dataState !== "error" && tab === "performance" && (
            <div className="card" style={{ padding: 18 }}>
              <div className="chart-head" style={{ marginBottom: 12 }}>
                <div>
                  <div className="chart-title">Gasto vs. conversões</div>
                  <div className="chart-sub">Últimos 30 dias · diário</div>
                </div>
              </div>
              <window.SpendChart data={hourly}/>
            </div>
          )}

          {dataState !== "error" && tab === "creatives" && (
            <div className="card" style={{ padding: 0 }}>
              <div className="lowfunds-head" style={{ borderBottom: "1px solid var(--border)" }}>
                <h2>Criativos</h2>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    CPA crescente
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Novo criativo
                  </button>
                </div>
              </div>
              {dataState === "empty" ? (
                <window.EmptyState
                  kind="empty"
                  title="Nenhum criativo ativo nesta campanha"
                  message="Adicione anúncios para começar a coletar dados de desempenho. Criativos com bom CTR aparecem aqui em ordem decrescente."
                  primaryAction={{ label: "Adicionar criativo", onClick: () => {} }}
                  secondaryAction={{ label: "Importar do Drive", onClick: () => {} }}
                />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 0 }}>
                  {c.creatives.map((cr, i) => (
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
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", fontFamily: "var(--font-mono)" }}>{fmt(cr.impressions)}</div>
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
              )}
            </div>
          )}

          {dataState !== "error" && tab === "audiences" && (
            <div className="card" style={{ padding: 0 }}>
              {dataState === "empty" ? (
                <window.EmptyState
                  kind="empty"
                  title={platform === "meta" ? "Nenhum público segmentado" : "Nenhuma palavra-chave ativa"}
                  message={platform === "meta" ? "Defina públicos personalizados, lookalikes ou segmentação por interesses para começar a entregar." : "Adicione palavras-chave para começar a aparecer nas pesquisas."}
                  primaryAction={{ label: platform === "meta" ? "Criar público" : "Adicionar palavras-chave", onClick: () => {} }}
                />
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>{platform === "meta" ? "Público" : "Palavra-chave"}</th>
                      <th style={{ textAlign: "right" }}>{platform === "meta" ? "Alcance" : "Volume"}</th>
                      {platform === "meta" && <th style={{ textAlign: "right" }}>Freq.</th>}
                      <th style={{ textAlign: "right" }}>Conv.</th>
                      <th style={{ textAlign: "right" }}>CPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.audiences.map((a, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{a.name}</td>
                        <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>{fmt(a.reach)}</td>
                        {platform === "meta" && <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>{a.freq?.toFixed(1)}x</td>}
                        <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>{a.conv}</td>
                        <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>{money(a.cpa)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {dataState !== "error" && tab === "history" && (
            <div className="card" style={{ padding: 0 }}>
              {dataState === "empty" ? (
                <window.EmptyState
                  kind="empty"
                  title="Sem alterações registradas"
                  message="Toda mudança feita nesta campanha — por você, pela IA ou pelo sistema — aparece aqui em ordem cronológica."
                  compact
                />
              ) : (
                <div style={{ padding: "8px 0" }}>
                  {c.history.map((h, i) => {
                    const kindStyle = {
                      ai: { dot: "#2e5bff", label: "IA" },
                      "ai-rejected": { dot: "#94a3b8", label: "IA" },
                      edit: { dot: "#16a34a", label: "Edição" },
                      create: { dot: "#d97706", label: "Sistema" },
                    }[h.kind];
                    return (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "120px auto 1fr",
                        gap: 14, padding: "14px 20px", alignItems: "flex-start",
                        borderBottom: i < c.history.length - 1 ? "1px solid var(--surface-2)" : "none",
                      }}>
                        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{h.date}</div>
                        <div style={{ position: "relative", paddingTop: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: kindStyle.dot }}/>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.45 }}>{h.action}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>{h.actor} {h.kind === "ai-rejected" && "· recusada"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

window.CampaignDetail = CampaignDetail;
