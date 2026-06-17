// MKPainel — Google vs Meta comparison
const { useState: useStateCmp, useMemo: useMemoCmp, useEffect: useEffectCmp } = React;

function ComparisonScreen({ onBack, tweaks }) {
  const accounts = window.MOCK_ACCOUNTS;

  const stats = useMemoCmp(() => {
    const calc = (plat) => {
      const list = accounts.filter(a => a.platform === plat);
      const spent = list.reduce((s, a) => s + a.spent, 0);
      const conv = list.reduce((s, a) => s + a.conv, 0);
      const ctr = list.reduce((s, a) => s + a.ctr, 0) / list.length;
      const roas = list.reduce((s, a) => s + a.roas, 0) / list.length;
      const cpa = spent / conv;
      const revenue = list.reduce((s, a) => s + a.spent * a.roas, 0);
      return { list, spent, conv, ctr, roas, cpa, revenue, count: list.length };
    };
    return { google: calc("google"), meta: calc("meta") };
  }, []);

  // Top performers by platform
  const topGoogle = [...stats.google.list].sort((a, b) => b.roas - a.roas).slice(0, 5);
  const topMeta = [...stats.meta.list].sort((a, b) => b.roas - a.roas).slice(0, 5);

  // Reallocation suggestion
  const lowGoogle = [...stats.google.list].sort((a, b) => a.roas - b.roas)[0];
  const highMeta = [...stats.meta.list].sort((a, b) => b.roas - a.roas)[0];
  const lowMeta = [...stats.meta.list].sort((a, b) => a.roas - b.roas)[0];
  const highGoogle = [...stats.google.list].sort((a, b) => b.roas - a.roas)[0];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="compare" onNav={(id) => window.__appNav?.(id)} alertCount={window.ALERTS.length}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">Google Ads vs Meta Ads</div>
            <div className="topbar-sub">Comparativo consolidado · onde está o melhor retorno</div>
          </div>
          <div className="topbar-spacer"/>
          <div className="filter-chip"><Icon.Calendar/> Últimos 30 dias</div>
          <button className="btn btn-secondary btn-sm"><Icon.Download/> Exportar</button>
        </div>

        <div className="main">
          {/* Hero comparison — head to head */}
          <div className="versus-hero">
            <div className="versus-side google">
              <div className="versus-mark"><GoogleAdsMark size={32}/></div>
              <div className="versus-name">Google Ads</div>
              <div className="versus-spent">R$ {Math.round(stats.google.spent).toLocaleString("pt-BR")}</div>
              <div className="versus-meta-row">
                <span>{stats.google.count} contas</span>
                <span>·</span>
                <span>{stats.google.conv.toLocaleString("pt-BR")} conversões</span>
              </div>
            </div>

            <div className="versus-divider">
              <div className="versus-vs">VS</div>
              <Verdict
                google={stats.google.roas}
                meta={stats.meta.roas}
                label="ROAS"
              />
            </div>

            <div className="versus-side meta">
              <div className="versus-mark"><MetaAdsMark size={32}/></div>
              <div className="versus-name">Meta Ads</div>
              <div className="versus-spent">R$ {Math.round(stats.meta.spent).toLocaleString("pt-BR")}</div>
              <div className="versus-meta-row">
                <span>{stats.meta.count} contas</span>
                <span>·</span>
                <span>{stats.meta.conv.toLocaleString("pt-BR")} conversões</span>
              </div>
            </div>
          </div>

          {/* Metric battle cards */}
          <div className="section-h"><h2>Comparativo por métrica</h2><span className="section-h-sub">Maior valor vence em verde</span></div>
          <div className="battle-grid">
            <BattleCard
              label="ROAS médio"
              gValue={stats.google.roas} gFormat="x"
              mValue={stats.meta.roas} mFormat="x"
              hint="Retorno sobre investimento"
            />
            <BattleCard
              label="Receita gerada"
              gValue={stats.google.revenue} gFormat="currency-int"
              mValue={stats.meta.revenue} mFormat="currency-int"
              hint="Soma de gasto × ROAS"
            />
            <BattleCard
              label="CPA"
              gValue={stats.google.cpa} gFormat="currency"
              mValue={stats.meta.cpa} mFormat="currency"
              hint="Menor é melhor"
              lowerWins
            />
            <BattleCard
              label="CTR médio"
              gValue={stats.google.ctr} gFormat="pct"
              mValue={stats.meta.ctr} mFormat="pct"
              hint="Taxa de clique"
            />
            <BattleCard
              label="Total conversões"
              gValue={stats.google.conv} gFormat="int"
              mValue={stats.meta.conv} mFormat="int"
              hint="Volume bruto"
            />
            <BattleCard
              label="Custo por conta"
              gValue={stats.google.spent / stats.google.count} gFormat="currency-int"
              mValue={stats.meta.spent / stats.meta.count} mFormat="currency-int"
              hint="Distribuição média"
            />
          </div>

          {/* Reallocation insight */}
          <div className="ai-card" style={{ marginTop: 20 }}>
            <div className="ai-head">
              <div className="ai-mark"><Icon.Sparkle/></div>
              <span className="ai-label">Sugestão de realocação inteligente</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>baseado em 30 dias</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center", marginTop: 16 }}>
              <div className="realloc-card">
                <div className="realloc-tag">Performance baixa</div>
                <div className="realloc-acct">{lowGoogle.name}</div>
                <div className="realloc-plat"><GoogleAdsMark size={14}/> Google · ROAS <span className="mono" style={{ color: "var(--red-700)" }}>{lowGoogle.roas.toFixed(1)}x</span></div>
                <div className="realloc-amount">−R$ 1.500</div>
              </div>
              <div className="realloc-arrow">
                <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                  <path d="M2 10 L36 10 M30 4 L36 10 L30 16" stroke="var(--brand-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="realloc-card highlight">
                <div className="realloc-tag green">Performance alta</div>
                <div className="realloc-acct">{highMeta.name}</div>
                <div className="realloc-plat"><MetaAdsMark size={14}/> Meta · ROAS <span className="mono" style={{ color: "var(--green-700)" }}>{highMeta.roas.toFixed(1)}x</span></div>
                <div className="realloc-amount green">+R$ 1.500</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.7)", borderRadius: 8, marginTop: 16, border: "1px solid var(--brand-100)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--ink-2)" }}>Receita projetada adicional ao realocar:</div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--green-700)", letterSpacing: "-0.02em", marginTop: 2 }}>+ R$ {(1500 * (highMeta.roas - lowGoogle.roas)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} / mês</div>
              </div>
              <button className="btn btn-primary">Aplicar realocação</button>
              <button className="btn btn-ghost btn-sm">Ver mais sugestões</button>
            </div>
          </div>

          {/* Top performers per platform */}
          <div className="chart-grid" style={{ marginTop: 28, gridTemplateColumns: "1fr 1fr" }}>
            <div className="chart-card">
              <div className="chart-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <GoogleAdsMark size={20}/>
                  <div>
                    <h3 className="chart-title">Top 5 contas no Google</h3>
                    <div className="chart-sub">Ordenadas por ROAS</div>
                  </div>
                </div>
              </div>
              <TopList items={topGoogle} platform="google"/>
            </div>
            <div className="chart-card">
              <div className="chart-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <MetaAdsMark size={20}/>
                  <div>
                    <h3 className="chart-title">Top 5 contas no Meta</h3>
                    <div className="chart-sub">Ordenadas por ROAS</div>
                  </div>
                </div>
              </div>
              <TopList items={topMeta} platform="meta"/>
            </div>
          </div>

          {/* Per-vertical breakdown */}
          <div className="section-h" style={{ marginTop: 24 }}><h2>Plataforma vencedora por cliente</h2><span className="section-h-sub">Quem performa melhor onde</span></div>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th style={{ textAlign: "right" }}>Google ROAS</th>
                  <th style={{ textAlign: "right" }}>Meta ROAS</th>
                  <th style={{ textAlign: "center" }}>Vencedor</th>
                  <th style={{ textAlign: "right" }}>Diferença</th>
                  <th>Recomendação</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const byClient = new Map();
                  accounts.forEach(a => {
                    if (!byClient.has(a.name)) byClient.set(a.name, {});
                    byClient.get(a.name)[a.platform] = a;
                  });
                  return Array.from(byClient.entries())
                    .filter(([_, v]) => v.google && v.meta)
                    .sort(([, a], [, b]) => Math.abs(b.google.roas - b.meta.roas) - Math.abs(a.google.roas - a.meta.roas))
                    .map(([name, v]) => {
                      const winner = v.google.roas > v.meta.roas ? "google" : "meta";
                      const diff = Math.abs(v.google.roas - v.meta.roas);
                      const sig = diff > 1.5;
                      return (
                        <tr key={name}>
                          <td>
                            <div className="acct-cell">
                              <div className="acct-logo">{name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                              <div className="acct-name">{name}</div>
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }} className="mono" style={{ fontWeight: winner === "google" ? 700 : 500, color: winner === "google" ? "var(--green-700)" : "var(--ink-2)" }}>{v.google.roas.toFixed(1)}x</td>
                          <td style={{ textAlign: "right" }} className="mono" style={{ fontWeight: winner === "meta" ? 700 : 500, color: winner === "meta" ? "var(--green-700)" : "var(--ink-2)" }}>{v.meta.roas.toFixed(1)}x</td>
                          <td style={{ textAlign: "center" }}>
                            {winner === "google" ? <GoogleAdsMark size={20}/> : <MetaAdsMark size={20}/>}
                          </td>
                          <td style={{ textAlign: "right" }} className="mono">+{diff.toFixed(1)}x</td>
                          <td>
                            {sig ? (
                              <span className="badge badge-amber">Realocar para {winner === "google" ? "Google" : "Meta"}</span>
                            ) : (
                              <span className="badge badge-gray">Manter equilíbrio</span>
                            )}
                          </td>
                        </tr>
                      );
                    });
                })()}
              </tbody>
            </table>
          </div>

          <div style={{ height: 40 }}/>
        </div>
      </main>
    </div>
  );
}

function Verdict({ google, meta, label }) {
  const winner = google > meta ? "google" : "meta";
  const diff = Math.abs(google - meta);
  const pct = ((diff / Math.min(google, meta)) * 100).toFixed(0);
  return (
    <div className="versus-verdict">
      <div className="versus-verdict-label">Vencedor em {label}</div>
      <div className={`versus-verdict-mark ${winner}`}>
        {winner === "google" ? <GoogleAdsMark size={26}/> : <MetaAdsMark size={26}/>}
      </div>
      <div className="versus-verdict-value">+{pct}% melhor</div>
    </div>
  );
}

function BattleCard({ label, gValue, mValue, gFormat, mFormat, hint, lowerWins }) {
  const fmt = (v, f) => {
    if (f === "currency") return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (f === "currency-int") return "R$ " + Math.round(v).toLocaleString("pt-BR");
    if (f === "int") return Math.round(v).toLocaleString("pt-BR");
    if (f === "pct") return v.toFixed(2) + "%";
    if (f === "x") return v.toFixed(1) + "x";
    return v;
  };
  const winner = lowerWins ? (gValue < mValue ? "google" : "meta") : (gValue > mValue ? "google" : "meta");
  const total = gValue + mValue;
  const gPct = (gValue / total) * 100;

  return (
    <div className="battle-card">
      <div className="battle-label">
        {label}
        <span className="battle-hint">{hint}</span>
      </div>
      <div className="battle-bars">
        <div className={`battle-row ${winner === "google" ? "winner" : ""}`}>
          <span className="battle-side"><GoogleAdsMark size={14}/> Google</span>
          <span className="battle-bar-track">
            <span className="battle-bar google" style={{ width: `${gPct}%` }}/>
          </span>
          <span className="battle-value mono">{fmt(gValue, gFormat)}</span>
        </div>
        <div className={`battle-row ${winner === "meta" ? "winner" : ""}`}>
          <span className="battle-side"><MetaAdsMark size={14}/> Meta</span>
          <span className="battle-bar-track">
            <span className="battle-bar meta" style={{ width: `${100 - gPct}%` }}/>
          </span>
          <span className="battle-value mono">{fmt(mValue, mFormat)}</span>
        </div>
      </div>
    </div>
  );
}

function TopList({ items, platform }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((a, i) => (
        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? "var(--brand-600)" : "var(--border-strong)", color: i === 0 ? "#fff" : "var(--ink-2)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-mono)" }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>R$ {Math.round(a.spent).toLocaleString("pt-BR")} gastos</div>
          </div>
          <div className="mono" style={{ fontWeight: 700, color: "var(--green-700)", fontSize: 16 }}>{a.roas.toFixed(1)}x</div>
        </div>
      ))}
    </div>
  );
}

window.ComparisonScreen = ComparisonScreen;
