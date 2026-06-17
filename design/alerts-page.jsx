// MKPainel — Alerts page (full)
const { useState: useStateAlerts, useMemo: useMemoAlerts } = React;

const ALL_ALERTS = [
  { id: 1, type: "amber", severity: "Atenção", title: "Orçamento próximo do limite", msg: "Auto Center Premium (Google) já consumiu 87% do orçamento mensal — restam 4 dias até o fim do ciclo.", account: "Auto Center Premium", platform: "google", time: "há 12 min", read: false, category: "budget" },
  { id: 2, type: "red", severity: "Crítico", title: "ROAS abaixo da meta", msg: "Imobiliária Solar (Meta) caiu para 1.8x. Meta definida pela equipe: 3.0x. Recomendamos pausar criativos com CPA > R$ 240.", account: "Imobiliária Solar", platform: "meta", time: "há 38 min", read: false, category: "performance" },
  { id: 3, type: "green", severity: "Oportunidade", title: "Pico de conversões detectado", msg: "Restaurante Sabor Real teve 47 conversões nas últimas 2h — +180% vs média. Considere aumentar o budget diário.", account: "Restaurante Sabor Real", platform: "meta", time: "há 1h", read: false, category: "opportunity" },
  { id: 4, type: "blue", severity: "Info", title: "Nova conta detectada na MCC", msg: "Clínica Estética Bem Estar foi adicionada à sua MCC do Google Ads. Quer importar para o MKPainel?", account: "Clínica Estética Bem Estar", platform: "google", time: "há 2h", read: false, category: "system" },
  { id: 5, type: "amber", severity: "Atenção", title: "CTR em queda", msg: "Joalheria Lúmen — CTR caiu 32% nos últimos 7 dias. Sugerimos revisar criativos e copy dos anúncios principais.", account: "Joalheria Lúmen", platform: "meta", time: "há 3h", read: false, category: "performance" },
  { id: 6, type: "red", severity: "Crítico", title: "Conta pausada por falta de saldo", msg: "Imobiliária Solar (Meta) — Pagamento recusado. Anúncios pausados automaticamente pela plataforma.", account: "Imobiliária Solar", platform: "meta", time: "há 5h", read: true, category: "billing" },
  { id: 7, type: "green", severity: "Oportunidade", title: "Meta de mês atingida 12 dias antes", msg: "Construtora Horizonte atingiu a meta mensal de leads (60) em apenas 18 dias. Recomendamos escalar.", account: "Construtora Horizonte", platform: "google", time: "ontem", read: true, category: "opportunity" },
  { id: 8, type: "amber", severity: "Atenção", title: "Frequência alta", msg: "Pet Shop Amigo Fiel (Meta) — frequência média de 6.2 nas últimas 2 semanas. Risco de saturação da audiência.", account: "Pet Shop Amigo Fiel", platform: "meta", time: "ontem", read: true, category: "performance" },
  { id: 9, type: "blue", severity: "Info", title: "Atualização do algoritmo", msg: "Google Ads atualizou as políticas de saúde. 3 anúncios da Clínica Vitalis precisam de revisão até 10/05.", account: "Clínica Vitalis", platform: "google", time: "ontem", read: true, category: "system" },
  { id: 10, type: "red", severity: "Crítico", title: "Custo por aquisição disparou", msg: "Loja Bella Moda (Google) — CPA subiu de R$ 32 para R$ 78 nas últimas 48h. Investigar lances automáticos.", account: "Loja Bella Moda", platform: "google", time: "há 2 dias", read: true, category: "performance" },
  { id: 11, type: "green", severity: "Oportunidade", title: "Audiência similar performando bem", msg: "TechStart Brasil — audiência similar aos últimos 30 dias está com ROAS 6.8x. Considere expandir o lance.", account: "TechStart Brasil", platform: "meta", time: "há 2 dias", read: true, category: "opportunity" },
  { id: 12, type: "amber", severity: "Atenção", title: "Quality Score baixo", msg: "Distribuidora Norte — 8 palavras-chave com Quality Score < 5/10. Otimize landing page e relevância dos anúncios.", account: "Distribuidora Norte", platform: "google", time: "há 3 dias", read: true, category: "performance" },
];

const ALERT_RULES = [
  { id: 1, name: "Orçamento próximo do limite", desc: "Avisa quando uma conta atinge 80%+ do orçamento mensal", channels: ["Email", "Push"], enabled: true },
  { id: 2, name: "ROAS abaixo da meta", desc: "Avisa quando ROAS cai 20%+ abaixo da meta definida por 24h", channels: ["Email", "Slack"], enabled: true },
  { id: 3, name: "Picos de conversão", desc: "Detecta aumentos atípicos para sugerir escalar budget", channels: ["Push"], enabled: true },
  { id: 4, name: "CTR em queda", desc: "Avisa quando CTR cai 25%+ vs média móvel de 7 dias", channels: ["Email"], enabled: true },
  { id: 5, name: "Frequência alta no Meta", desc: "Sinaliza saturação quando frequência > 5 em 14 dias", channels: ["Email"], enabled: false },
  { id: 6, name: "Quality Score baixo", desc: "Detecta keywords com QS < 5 para otimização", channels: ["Email"], enabled: true },
  { id: 7, name: "Anúncios reprovados", desc: "Avisa imediatamente quando criativos são rejeitados", channels: ["Email", "Push", "Slack"], enabled: true },
];

function AlertsScreen({ onBack, tweaks }) {
  const [filter, setFilter] = useStateAlerts("all");
  const [readState, setReadState] = useStateAlerts(() => Object.fromEntries(ALL_ALERTS.map(a => [a.id, a.read])));
  const [tab, setTab] = useStateAlerts("inbox"); // inbox | rules
  const [rules, setRules] = useStateAlerts(ALERT_RULES);

  const filtered = useMemoAlerts(() => {
    let list = ALL_ALERTS;
    if (filter === "unread") list = list.filter(a => !readState[a.id]);
    else if (filter !== "all") list = list.filter(a => a.category === filter);
    return list;
  }, [filter, readState]);

  const counts = {
    all: ALL_ALERTS.length,
    unread: ALL_ALERTS.filter(a => !readState[a.id]).length,
    performance: ALL_ALERTS.filter(a => a.category === "performance").length,
    budget: ALL_ALERTS.filter(a => a.category === "budget").length,
    opportunity: ALL_ALERTS.filter(a => a.category === "opportunity").length,
    billing: ALL_ALERTS.filter(a => a.category === "billing").length,
    system: ALL_ALERTS.filter(a => a.category === "system").length,
  };

  const markRead = (id) => setReadState(s => ({ ...s, [id]: true }));
  const markAllRead = () => setReadState(Object.fromEntries(ALL_ALERTS.map(a => [a.id, true])));
  const toggleRule = (id) => setRules(r => r.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="alerts" onNav={() => onBack?.()} alertCount={counts.unread}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">Alertas</div>
            <div className="topbar-sub">{counts.unread} não lidos · {counts.all} no total</div>
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
          {tab === "inbox" && <button className="btn btn-secondary btn-sm" onClick={markAllRead}><Icon.Check/> Marcar todos como lidos</button>}
          {tab === "rules" && <button className="btn btn-primary btn-sm"><Icon.Plus/> Nova regra</button>}
        </div>

        <div className="main">
          {tab === "inbox" && (
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
              {/* Filter sidebar */}
              <div>
                <div className="section-h" style={{ margin: "0 0 10px" }}><h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-3)" }}>Filtros</h2></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { id: "all", label: "Todos", icon: "📋" },
                    { id: "unread", label: "Não lidos", icon: "●", color: "var(--brand-600)" },
                    { id: "performance", label: "Performance", icon: "📉", color: "var(--amber-700)" },
                    { id: "budget", label: "Orçamento", icon: "💰", color: "var(--amber-700)" },
                    { id: "opportunity", label: "Oportunidades", icon: "↑", color: "var(--green-700)" },
                    { id: "billing", label: "Pagamentos", icon: "💳", color: "var(--red-700)" },
                    { id: "system", label: "Sistema", icon: "⚙", color: "var(--brand-700)" },
                  ].map(f => (
                    <button key={f.id} className={`nav-item ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)} style={{ justifyContent: "flex-start", textAlign: "left" }}>
                      <span style={{ width: 18, textAlign: "center", color: f.color || "var(--ink-3)" }}>{f.icon}</span>
                      <span>{f.label}</span>
                      <span className="nav-count">{counts[f.id]}</span>
                    </button>
                  ))}
                </div>

                <div className="section-h" style={{ margin: "24px 0 10px" }}><h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-3)" }}>Severidade</h2></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 12px", fontSize: 13, color: "var(--ink-2)" }}>
                  <SeverityRow color="var(--red-500)" label="Crítico" count={ALL_ALERTS.filter(a => a.severity === "Crítico").length}/>
                  <SeverityRow color="var(--amber-500)" label="Atenção" count={ALL_ALERTS.filter(a => a.severity === "Atenção").length}/>
                  <SeverityRow color="var(--green-500)" label="Oportunidade" count={ALL_ALERTS.filter(a => a.severity === "Oportunidade").length}/>
                  <SeverityRow color="var(--brand-500)" label="Info" count={ALL_ALERTS.filter(a => a.severity === "Info").length}/>
                </div>
              </div>

              {/* Alert list */}
              <div>
                {filtered.length === 0 && (
                  <div className="card" style={{ padding: 0 }}>
                    <window.EmptyState
                      kind={filter === "all" ? "success" : "noresults"}
                      title={filter === "all" ? "Tudo em ordem por aqui" : "Nenhum alerta neste filtro"}
                      message={filter === "all" ? "Você não tem alertas pendentes. Suas campanhas estão entregando dentro dos parâmetros definidos." : "Tente outro filtro — ou volte para 'Todos' para ver tudo o que está acontecendo."}
                      secondaryAction={filter !== "all" ? { label: "Ver todos os alertas", onClick: () => setFilter("all") } : null}
                    />
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtered.map(a => (
                    <div key={a.id} className={`alert ${a.type}`} style={{ background: readState[a.id] ? "var(--surface-2)" : "#fff", opacity: readState[a.id] ? 0.78 : 1 }} onClick={() => markRead(a.id)}>
                      <div className="alert-icon">
                        {a.type === "red" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                        {a.type === "amber" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>}
                        {a.type === "green" && <Icon.TrendUp/>}
                        {a.type === "blue" && <Icon.Plus/>}
                      </div>
                      <div className="alert-body">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span className={`badge badge-${a.type === "red" ? "red" : a.type === "amber" ? "amber" : a.type === "green" ? "green" : "blue"}`}>{a.severity}</span>
                          <span className="platform-pill"><span className={`platform-dot ${a.platform}`}/> {a.account}</span>
                          {!readState[a.id] && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand-600)" }}/>}
                          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>{a.time}</span>
                        </div>
                        <div className="alert-title" style={{ marginTop: 6 }}>{a.title}</div>
                        <div className="alert-msg">{a.msg}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                          <button className="ai-action-btn">Ver na conta</button>
                          {a.category === "opportunity" && <button className="ai-action-btn">Aplicar sugestão</button>}
                          {a.category === "budget" && <button className="ai-action-btn">Ajustar orçamento</button>}
                          {a.category === "performance" && <button className="ai-action-btn">Investigar</button>}
                          <button className="ai-action-btn ghost">Silenciar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "rules" && (
            <div style={{ maxWidth: 820 }}>
              <div className="card" style={{ padding: 20, marginBottom: 16, background: "linear-gradient(135deg, #ffffff, #f5f7ff)", borderColor: "var(--brand-100)" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="ai-mark" style={{ width: 32, height: 32 }}><Icon.Sparkle/></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Configure quando o MKPainel deve te avisar</div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>Regras se aplicam a todas as 20 contas conectadas. Você pode personalizar limiares por cliente nas configurações de cada conta.</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ overflow: "hidden" }}>
                {rules.map((r, i) => (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                    borderBottom: i < rules.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <Toggle on={r.enabled} onClick={() => toggleRule(r.id)}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>{r.desc}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {r.channels.map(c => <span key={c} className="badge badge-gray">{c}</span>)}
                    </div>
                    <button className="btn btn-ghost btn-sm">Editar</button>
                  </div>
                ))}
              </div>

              <div className="section-h" style={{ marginTop: 28 }}><h2>Canais de notificação</h2></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <ChannelCard icon="✉" name="Email" detail="davi@agenciaorbita.com.br" connected/>
                <ChannelCard icon="💬" name="Slack" detail="#alertas-trafego" connected/>
                <ChannelCard icon="📱" name="Push (WhatsApp)" detail="Conectar para receber alertas críticos no celular"/>
              </div>
              <div style={{ height: 40 }}/>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SeverityRow({ color, label, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }}/>
      <span>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>{count}</span>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 22, borderRadius: 999,
      background: on ? "var(--brand-600)" : "var(--border-strong)",
      position: "relative", transition: "all 0.2s",
      flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff", boxShadow: "var(--shadow-xs)",
        transition: "left 0.2s",
      }}/>
    </button>
  );
}

function ChannelCard({ icon, name, detail, connected }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 22 }}>{icon}</div>
        <div style={{ fontWeight: 600 }}>{name}</div>
        {connected && <span className="badge badge-green" style={{ marginLeft: "auto" }}>Conectado</span>}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{detail}</div>
      <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: "100%" }}>{connected ? "Configurar" : "Conectar"}</button>
    </div>
  );
}

window.AlertsScreen = AlertsScreen;
