// MKPainel — Client View
// Read-only branded view of one client's performance, designed to be shared
// publicly (e.g. weekly recap link sent to the client).
const { useState: useStateCV, useMemo: useMemoCV } = React;

function buildClientSummary(clientName) {
  const accounts = (window.MOCK_ACCOUNTS || []).filter(a => a.name === clientName);
  const spent = accounts.reduce((s, a) => s + a.spent, 0);
  const conv = accounts.reduce((s, a) => s + a.conv, 0);
  const avgRoas = accounts.length ? accounts.reduce((s, a) => s + a.roas, 0) / accounts.length : 0;
  const revenue = accounts.reduce((s, a) => s + a.spent * a.roas, 0);
  return {
    name: clientName,
    accounts,
    spent, conv, revenue,
    roas: avgRoas,
    cpa: conv > 0 ? spent / conv : 0,
    period: "01 — 27 abr 2026",
  };
}

const CLIENT_HIGHLIGHTS = [
  { icon: "trend-up", title: "ROAS subiu 18% vs. mês anterior", body: "Combinação de novos criativos de vídeo e ajustes de público melhoraram o retorno." },
  { icon: "target", title: "Coleção Verão bateu meta de vendas", body: "248 conversões em 21 dias — superou em 24% a projeção inicial." },
  { icon: "users", title: "Novo público de alta conversão identificado", body: "Lookalike 1% de compradores 90d entregou CPA 32% menor que a média." },
];

const CLIENT_RECOMMENDATIONS = [
  { title: "Vamos escalar a Coleção Verão", body: "Pretendemos aumentar o orçamento da campanha em 35% na próxima semana, mantendo o teto de CPA." },
  { title: "Pausa nos criativos de menor performance", body: "3 anúncios da campanha de remarketing serão pausados — CTR abaixo da meta há 14 dias." },
  { title: "Teste A/B de nova landing page", body: "A próxima semana terá 50% do tráfego direcionado para uma página otimizada que sua equipe aprovou." },
];

// ── Icons ────────────────────────────────────────────────────
const ICONS_CV = {
  "trend-up": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  "target": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  "users": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

function ClientView({ clientName = "Loja Bella Moda", onBack, tweaks }) {
  const cv = useMemoCV(() => buildClientSummary(clientName), [clientName]);
  const hourly = useMemoCV(() => window.genHourlySpend(), [clientName]);
  const dataState = tweaks?.dataState || "populated";
  const fmt = (n, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (n, d = 2) => "R$ " + fmt(n, d);

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa" }}>
      {/* Preview banner — only visible to internal users */}
      <div style={{
        background: "linear-gradient(90deg, #2e5bff, #1a3bbf)",
        color: "#fff", padding: "10px 24px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        fontSize: 12, fontWeight: 500, flexWrap: "wrap",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>Pré-visualização do que o cliente verá. Link público sem dados internos da agência.</span>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff", padding: "4px 12px", borderRadius: 6,
          fontSize: 11, fontWeight: 600, cursor: "pointer", marginLeft: 8,
          fontFamily: "inherit",
        }}>← Voltar ao painel</button>
      </div>

      {/* Branded header */}
      <header style={{
        background: "#fff", borderBottom: "1px solid var(--border)",
        padding: "20px 32px",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 20, flexWrap: "wrap",
        }}>
          {/* Client identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              color: "#92400e", display: "grid", placeItems: "center",
              fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em",
              border: "1px solid #fcd34d",
            }}>{cv.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                Relatório de tráfego pago
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
                {cv.name}
              </div>
            </div>
          </div>

          {/* Period + agency */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                Período
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)" }}>{cv.period}</div>
            </div>
            <div style={{
              padding: "10px 14px", borderLeft: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #2e5bff, #1a3bbf)",
                color: "#fff", display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 700,
              }}>OR</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-1)" }}>Agência Órbita</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>davi@agenciaorbita.com.br</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 80px" }}>
        {dataState === "error" ? (
          <div className="card" style={{ padding: 0 }}>
            <window.EmptyState
              kind="error"
              title="Não foi possível carregar os dados"
              message="Estamos com uma falha temporária na integração. Tente atualizar em alguns minutos ou fale com seu gestor."
              primaryAction={{ label: "Atualizar", onClick: () => window.location.reload() }}
            />
          </div>
        ) : dataState === "empty" ? (
          <div className="card" style={{ padding: 0 }}>
            <window.EmptyState
              kind="empty"
              title="Relatório ainda em preparação"
              message="Estamos coletando os primeiros dados desta conta. O relatório completo estará disponível assim que as primeiras campanhas começarem a entregar."
              compact
            />
          </div>
        ) : (
          <>
            {/* ── Hero stat ── */}
            <section style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: 18, padding: "36px 36px 32px",
              color: "#fff", marginBottom: 28,
              position: "relative", overflow: "hidden",
            }}>
              {/* Decorative grid */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px", pointerEvents: "none",
              }}/>
              <div style={{ position: "relative" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  color: "#60a5fa", textTransform: "uppercase", marginBottom: 16,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 4px rgba(34,197,94,0.2)" }}/>
                  Resultado consolidado
                </div>
                <div style={{
                  fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em",
                  fontFamily: "var(--font-mono)", lineHeight: 1.05,
                  marginBottom: 8,
                }}>
                  {money(cv.revenue, 0)}
                </div>
                <div style={{ fontSize: 15, color: "#cbd5e1", marginBottom: 28, maxWidth: 540 }}>
                  Receita estimada gerada por suas campanhas neste período — equivalente a <strong style={{ color: "#fff" }}>{cv.roas.toFixed(1)}x</strong> de retorno sobre o investimento.
                </div>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
                  paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)",
                }} className="cv-hero-stats">
                  {[
                    { label: "Investimento", value: money(cv.spent, 0) },
                    { label: "Conversões", value: fmt(cv.conv) },
                    { label: "CPA médio", value: money(cv.cpa, 2) },
                    { label: "ROAS médio", value: cv.roas.toFixed(1) + "x" },
                  ].map((s, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Performance chart ── */}
            <section className="card" style={{ padding: 22, marginBottom: 24 }}>
              <div className="chart-head" style={{ marginBottom: 14 }}>
                <div>
                  <div className="chart-title">Performance no período</div>
                  <div className="chart-sub">Investimento e conversões dia a dia</div>
                </div>
              </div>
              <window.SpendChart data={hourly}/>
            </section>

            {/* ── Highlights ── */}
            <section style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                marginBottom: 14, gap: 12, flexWrap: "wrap",
              }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                    Destaques do período
                  </h2>
                  <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
                    Selecionados pela nossa equipe — o que mais te entregou retorno
                  </div>
                </div>
              </div>
              <div className="cv-highlights" style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
              }}>
                {CLIENT_HIGHLIGHTS.map((h, i) => (
                  <div key={i} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "#dcfce7", color: "#16a34a",
                      display: "grid", placeItems: "center",
                    }}>{ICONS_CV[h.icon]}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.35, marginTop: 4 }}>
                      {h.title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>
                      {h.body}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Top campaigns ── */}
            <section style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                marginBottom: 14, gap: 12, flexWrap: "wrap",
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                  Suas campanhas
                </h2>
              </div>
              <div className="card" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Plataforma</th>
                      <th style={{ textAlign: "right" }}>Investido</th>
                      <th style={{ textAlign: "right" }}>Conversões</th>
                      <th style={{ textAlign: "right" }}>CPA</th>
                      <th style={{ textAlign: "right" }}>ROAS</th>
                      <th style={{ textAlign: "right" }}>Receita estimada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cv.accounts.map((a, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: a.platform === "meta" ? "#1877f2" : "#4285f4",
                            }}/>
                            <span style={{ fontWeight: 500 }}>
                              {a.platform === "meta" ? "Meta Ads" : "Google Ads"}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>{money(a.spent)}</td>
                        <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>{fmt(a.conv)}</td>
                        <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>{money(a.spent / a.conv)}</td>
                        <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: a.roas >= 4 ? "#16a34a" : a.roas >= 2.5 ? "var(--ink-1)" : "#dc2626", fontWeight: 600 }}>
                          {a.roas.toFixed(1)}x
                        </td>
                        <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{money(a.spent * a.roas, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Próximos passos / Agency narrative ── */}
            <section>
              <div style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                marginBottom: 14, gap: 12, flexWrap: "wrap",
              }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                    O que faremos nos próximos 7 dias
                  </h2>
                  <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
                    Plano de ação do seu gestor
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {CLIENT_RECOMMENDATIONS.map((r, i) => (
                  <div key={i} style={{
                    padding: "18px 22px",
                    borderBottom: i < CLIENT_RECOMMENDATIONS.length - 1 ? "1px solid var(--surface-2)" : "none",
                    display: "flex", gap: 16, alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: "#eef2ff", color: "#4f46e5",
                      display: "grid", placeItems: "center", flexShrink: 0,
                      fontWeight: 700, fontSize: 13, fontFamily: "var(--font-mono)",
                    }}>{String(i + 1).padStart(2, "0")}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)", marginBottom: 4 }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>
                        {r.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA: Talk to manager */}
            <section style={{ marginTop: 32, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 12 }}>
                Dúvidas sobre este relatório? Fale direto com seu gestor.
              </div>
              <a href="#" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 20px", borderRadius: 10,
                background: "#25d366", color: "#fff",
                fontSize: 14, fontWeight: 600, textDecoration: "none",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
                Falar com Davi no WhatsApp
              </a>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)", background: "#fff",
        padding: "20px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", fontSize: 12, color: "var(--ink-3)" }}>
          Relatório gerado por <strong style={{ color: "var(--ink-2)" }}>MKPainel</strong> · Agência Órbita · {cv.period}
        </div>
      </footer>

      {/* Mobile CSS for client view */}
      <style>{`
        @media (max-width: 768px) {
          .cv-hero-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 18px !important; }
          .cv-highlights { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

window.ClientView = ClientView;
