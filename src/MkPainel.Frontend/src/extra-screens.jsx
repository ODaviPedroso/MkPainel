import React, { useState, useMemo } from 'react';
import { Sidebar, Icon, GoogleAdsMark, MetaAdsMark, EmptyState } from './components';

// ─── Alerts Screen ──────────────────────────────────────────
export function AlertsScreen({ onBack, onNavigate }) {
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("inbox"); // inbox | rules

  const allAlerts = [
    { id: 1, type: "amber", severity: "Atenção", title: "Orçamento próximo do limite", msg: "Auto Center Premium (Google) já consumiu 87% do orçamento mensal — restam 4 dias até o fim do ciclo.", account: "Auto Center Premium", platform: "google", time: "há 12 min", category: "budget" },
    { id: 2, type: "red", severity: "Crítico", title: "ROAS abaixo da meta", msg: "Imobiliária Solar (Meta) caiu para 1.8x. Meta definida pela equipe: 3.0x. Recomendamos pausar criativos com CPA > R$ 240.", account: "Imobiliária Solar", platform: "meta", time: "há 38 min", category: "performance" },
    { id: 3, type: "green", severity: "Oportunidade", title: "Pico de conversões detectado", msg: "Restaurante Sabor Real teve 47 conversões nas últimas 2h — +180% vs média. Considere aumentar o budget diário.", account: "Restaurante Sabor Real", platform: "meta", time: "há 1h", category: "opportunity" },
    { id: 4, type: "blue", severity: "Info", title: "Nova conta detectada na MCC", msg: "Clínica Estética Bem Estar foi adicionada à sua MCC do Google Ads. Quer importar para o MKPainel?", account: "Clínica Estética Bem Estar", platform: "google", time: "há 2h", category: "system" },
    { id: 5, type: "amber", severity: "Atenção", title: "CTR em queda", msg: "Joalheria Lúmen — CTR caiu 32% nos últimos 7 dias. Sugerimos revisar criativos e copy dos anúncios principais.", account: "Joalheria Lúmen", platform: "meta", time: "há 3h", category: "performance" },
  ];

  const alertRules = [
    { id: 1, name: "Orçamento próximo do limite", desc: "Avisa quando uma conta atinge 80%+ do orçamento mensal", channels: ["Email", "Push"], enabled: true },
    { id: 2, name: "ROAS abaixo da meta", desc: "Avisa quando ROAS cai 20%+ abaixo da meta definida por 24h", channels: ["Email", "Slack"], enabled: true },
    { id: 3, name: "Picos de conversão", desc: "Detecta aumentos atípicos para sugerir escalar budget", channels: ["Push"], enabled: true },
    { id: 4, name: "CTR em queda", desc: "Avisa quando CTR cai 25%+ vs média móvel de 7 dias", channels: ["Email"], enabled: true },
  ];

  const [rules, setRules] = useState(alertRules);
  const [alerts, setAlerts] = useState(allAlerts);

  const filtered = useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter(a => a.category === filter);
  }, [filter, alerts]);

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleDismiss = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="alerts" onNav={onNavigate} alertCount={alerts.length}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">Alertas do Workspace</div>
            <div className="topbar-sub">{alerts.length} alertas pendentes</div>
          </div>
          <div className="topbar-spacer"/>
          <div style={{ display: "flex", gap: 4, background: "var(--surface-2)", borderRadius: 8, padding: 3 }}>
            {[{ id: "inbox", label: "Caixa de entrada" }, { id: "rules", label: "Regras de alerta" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "6px 14px", fontSize: 13, fontWeight: 600, borderRadius: 6,
                background: tab === t.id ? "#fff" : "transparent",
                color: tab === t.id ? "var(--ink-1)" : "var(--ink-3)",
                boxShadow: tab === t.id ? "var(--shadow-xs)" : "none",
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="main">
          {tab === "inbox" && (
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
              {/* Filter Sidebar */}
              <div>
                <div className="section-h" style={{ margin: "0 0 10px" }}>
                  <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-3)" }}>Filtros</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { id: "all", label: "Todos", icon: "📋" },
                    { id: "performance", label: "Performance", icon: "📉" },
                    { id: "budget", label: "Orçamento", icon: "💰" },
                    { id: "opportunity", label: "Oportunidades", icon: "↑" },
                    { id: "system", label: "Sistema", icon: "⚙" },
                  ].map(f => (
                    <button key={f.id} className={`nav-item ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)} style={{ justifyContent: "flex-start", textAlign: "left" }}>
                      <span style={{ width: 18, textAlign: "center" }}>{f.icon}</span>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert list */}
              <div>
                {filtered.length === 0 ? (
                  <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <h3 style={{ margin: 0 }}>Nenhum alerta pendente</h3>
                    <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 6 }}>Suas contas estão rodando dentro dos limites esperados.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.map(a => (
                      <div key={a.id} className={`alert ${a.type}`} style={{ background: "#fff" }}>
                        <div className="alert-body">
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span className={`badge badge-${a.type === "red" ? "red" : a.type === "amber" ? "amber" : a.type === "green" ? "green" : "blue"}`}>{a.severity}</span>
                            <span className="platform-pill">
                              <span className={`platform-dot ${a.platform}`}/> {a.account}
                            </span>
                            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>{a.time}</span>
                          </div>
                          <div className="alert-title" style={{ marginTop: 6, fontWeight: 600 }}>{a.title}</div>
                          <div className="alert-msg" style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>{a.msg}</div>
                          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                            <button className="ai-action-btn" onClick={() => onNavigate('account', a.account)}>Ver na conta</button>
                            <button className="ai-action-btn ghost" onClick={() => handleDismiss(a.id)}>Silenciar</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "rules" && (
            <div style={{ maxWidth: 820 }}>
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Configure quando o MKPainel deve te avisar</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
                  Estas regras aplicam-se a todas as contas conectadas.
                </div>
              </div>

              <div className="card" style={{ overflow: "hidden" }}>
                {rules.map((r, i) => (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                    borderBottom: i < rules.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <button onClick={() => toggleRule(r.id)} className={`toggle-switch ${r.enabled ? "on" : ""}`} style={{ border: 'none', padding: 0 }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>{r.desc}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {r.channels.map(c => <span key={c} className="badge badge-gray">{c}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── WhatsApp Screen ──────────────────────────────────────────
export function WhatsAppScreen({ onNavigate }) {
  const [rules, setRules] = useState({
    overspend: true,
    roasdrop: true,
    nospend: true,
    success: false,
    daily: true,
  });

  const toggle = (k) => setRules(r => ({ ...r, [k]: !r[k] }));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="whatsapp" onNav={onNavigate}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">WhatsApp Business</div>
            <div className="topbar-sub">Receba alertas críticos direto no celular · sem precisar abrir o app</div>
          </div>
          <div className="topbar-spacer"/>
          <span className="badge badge-green"><span className="live-dot"/>Conectado</span>
        </div>

        <div className="main">
          <div className="ai-card" style={{ marginBottom: 24, borderLeft: '3px solid var(--green-500)' }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "#25d366", color: "#fff", display: "grid", placeItems: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.8.7 2.5.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.2-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>+55 11 9 8765-4321 · Davi Silva</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>Notificações de tráfego e alertas da agência configurados.</div>
              </div>
            </div>
          </div>

          <div className="wa-grid">
            <div>
              <div className="section-h"><h2>Regras de notificação</h2></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                <RuleRow
                  iconNode={<Icon.Bolt/>}
                  title="Estouro de orçamento"
                  desc="Alerta quando uma campanha gastar mais de 80% do orçamento diário antes de 18h"
                  on={rules.overspend} onToggle={() => toggle("overspend")}
                  severity="Crítico"
                />
                <RuleRow
                  iconNode={<Icon.TrendDown/>}
                  title="Queda de ROAS"
                  desc="ROAS de uma conta cair mais de 30% comparado à média dos últimos 7 dias"
                  on={rules.roasdrop} onToggle={() => toggle("roasdrop")}
                  severity="Alto"
                />
                <RuleRow
                  iconNode={<Icon.Bell/>}
                  title="Conta sem entrega"
                  desc="Campanha ativa parou de gastar por mais de 2 horas (possível bloqueio)"
                  on={rules.nospend} onToggle={() => toggle("nospend")}
                  severity="Crítico"
                />
                <RuleRow
                  iconNode={<Icon.Calendar/>}
                  title="Resumo diário"
                  desc="Mensagem todo dia às 09:00 com top 3 destaques e top 3 alertas"
                  on={rules.daily} onToggle={() => toggle("daily")}
                  severity="Diário"
                />
              </div>
            </div>

            {/* Phone Preview column */}
            <div>
              <div className="wa-phone">
                <div className="wa-phone-screen">
                  <div className="wa-header">
                    <div className="wa-avatar">MK</div>
                    <div className="wa-header-info">
                      <div className="wa-header-name">MKPainel · Alertas</div>
                      <div className="wa-header-status">online</div>
                    </div>
                  </div>
                  <div className="wa-messages">
                    <div className="wa-bubble alert">
                      <div className="wa-bubble-title red">⚠ Estouro de orçamento</div>
                      <div><strong>Imobiliária Solar</strong> gastou R$ 980 de R$ 1.200 (81%) e ainda são 14h.</div>
                      <div className="wa-bubble-time">14:23 ✓✓</div>
                    </div>

                    <div className="wa-bubble">
                      <div className="wa-bubble-title">📊 Resumo diário</div>
                      <div>Bom dia, Davi! Resumo de ontem:</div>
                      <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.5 }}>
                        💰 R$ 24.380 investidos<br/>
                        🎯 ROAS médio: 4.2x<br/>
                        🔥 Destaque: Loja Bella Moda (6.8x)<br/>
                      </div>
                      <div className="wa-bubble-time">09:00 ✓✓</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RuleRow({ iconNode, title, desc, on, onToggle, severity }) {
  return (
    <div className="wa-rule">
      <div className="wa-rule-icon" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}>
        {iconNode}
      </div>
      <div>
        <div className="wa-rule-title">{title}</div>
        <div className="wa-rule-desc">{desc}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase" }}>{severity}</span>
        <button className={`toggle-switch ${on ? "on" : ""}`} onClick={onToggle} style={{ border: 'none', padding: 0 }}/>
      </div>
    </div>
  );
}
