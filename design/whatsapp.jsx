// MKPainel — WhatsApp integration screen
const { useState: useStateWa } = React;

function WhatsAppScreen({ onBack, tweaks }) {
  const [rules, setRules] = useStateWa({
    overspend: true,
    roasdrop: true,
    nospend: true,
    success: false,
    daily: true,
    realtime: false,
  });

  const toggle = (k) => setRules(r => ({ ...r, [k]: !r[k] }));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="whatsapp" onNav={(id) => window.__appNav?.(id)} alertCount={window.ALERTS.length}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">WhatsApp Business</div>
            <div className="topbar-sub">Receba alertas críticos direto no celular · sem precisar abrir o app</div>
          </div>
          <div className="topbar-spacer"/>
          <span className="badge badge-green"><span className="live-dot"/>Conectado</span>
          <button className="btn btn-secondary btn-sm">Trocar número</button>
        </div>

        <div className="main">
          {/* Status banner */}
          <div className="ai-card" style={{ marginBottom: 24, background: "linear-gradient(135deg, rgba(18,183,106,0.06), rgba(46,91,255,0.04))", borderColor: "var(--green-500)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "#25d366", color: "#fff", display: "grid", placeItems: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.8.7 2.5.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.2-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>+55 11 9 8765-4321 · Davi Silva</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>Recebendo alertas há 47 dias · 12 alertas enviados nos últimos 7 dias</div>
              </div>
              <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "right" }}>
                <div>Última mensagem</div>
                <div style={{ color: "var(--ink-1)", fontWeight: 600, marginTop: 2 }}>há 14 minutos</div>
              </div>
            </div>
          </div>

          <div className="wa-grid">
            <div>
              {/* Rules */}
              <div className="section-h"><h2>Regras de notificação</h2><span className="section-h-sub">Escolha o que vale uma mensagem no WhatsApp</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                <RuleRow
                  icon="red" iconNode={<Icon.Bolt/>}
                  title="Estouro de orçamento"
                  desc="Alerta quando uma campanha gastar mais de 80% do orçamento diário antes de 18h"
                  on={rules.overspend} onToggle={() => toggle("overspend")}
                  severity="Crítico"
                />
                <RuleRow
                  icon="amber" iconNode={<Icon.TrendDown/>}
                  title="Queda brusca de ROAS"
                  desc="ROAS de uma conta cair mais de 30% comparado à média dos últimos 7 dias"
                  on={rules.roasdrop} onToggle={() => toggle("roasdrop")}
                  severity="Alto"
                />
                <RuleRow
                  icon="red" iconNode={<Icon.Bell/>}
                  title="Conta sem entrega"
                  desc="Campanha ativa parou de gastar por mais de 2 horas (possível bloqueio)"
                  on={rules.nospend} onToggle={() => toggle("nospend")}
                  severity="Crítico"
                />
                <RuleRow
                  icon="green" iconNode={<Icon.TrendUp/>}
                  title="Marcos de sucesso"
                  desc="Conta atingir meta mensal de conversões ou bater novo recorde de ROAS"
                  on={rules.success} onToggle={() => toggle("success")}
                  severity="Bom saber"
                />
                <RuleRow
                  icon="blue" iconNode={<Icon.Calendar/>}
                  title="Resumo diário"
                  desc="Mensagem todo dia às 09:00 com top 3 destaques e top 3 alertas"
                  on={rules.daily} onToggle={() => toggle("daily")}
                  severity="Diário"
                />
                <RuleRow
                  icon="amber" iconNode={<Icon.Sparkle/>}
                  title="Sugestões da IA"
                  desc="Quando a IA detectar oportunidade de otimização com impacto > R$ 500/mês"
                  on={rules.realtime} onToggle={() => toggle("realtime")}
                  severity="Tempo real"
                />
              </div>

              {/* Quiet hours */}
              <div className="section-h"><h2>Horário silencioso</h2><span className="section-h-sub">Não recebe nada (exceto críticos) nesses horários</span></div>
              <div className="card" style={{ padding: 18, marginBottom: 28 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.05em" }}>Início</div>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>22:00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.05em" }}>Fim</div>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>07:00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.05em" }}>Fim de semana</div>
                    <div style={{ marginTop: 4 }}>
                      <span className="badge badge-amber">Apenas críticos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="section-h"><h2>Histórico recente</h2></div>
              <div className="card" style={{ overflow: "hidden" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Quando</th>
                      <th>Tipo</th>
                      <th>Conta</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="mono">há 14 min</td><td><span className="badge badge-red">Estouro</span></td><td>Imobiliária Solar</td><td><span style={{ color: "var(--green-700)", fontSize: 12, fontWeight: 600 }}>✓ Lida</span></td></tr>
                    <tr><td className="mono">há 2 h</td><td><span className="badge badge-amber">Queda ROAS</span></td><td>Restaurante Tagliato</td><td><span style={{ color: "var(--green-700)", fontSize: 12, fontWeight: 600 }}>✓ Lida</span></td></tr>
                    <tr><td className="mono">hoje, 09:00</td><td><span className="badge badge-blue">Resumo diário</span></td><td>—</td><td><span style={{ color: "var(--green-700)", fontSize: 12, fontWeight: 600 }}>✓ Lida</span></td></tr>
                    <tr><td className="mono">ontem, 16:42</td><td><span className="badge badge-red">Sem entrega</span></td><td>Clínica Vivace</td><td><span style={{ color: "var(--ink-3)", fontSize: 12 }}>Entregue</span></td></tr>
                    <tr><td className="mono">ontem, 09:00</td><td><span className="badge badge-blue">Resumo diário</span></td><td>—</td><td><span style={{ color: "var(--green-700)", fontSize: 12, fontWeight: 600 }}>✓ Lida</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phone preview */}
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", fontWeight: 600, marginBottom: 10, textAlign: "center" }}>
                Pré-visualização
              </div>
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
                      <div style={{ marginTop: 4, fontSize: 11, color: "var(--ink-3)" }}>Campanha "Lançamento Bairro Jardins" no Meta Ads.</div>
                      <div className="wa-bubble-actions">
                        <div className="wa-btn">Pausar</div>
                        <div className="wa-btn">Ver conta</div>
                      </div>
                      <div className="wa-bubble-time">14:23 ✓✓</div>
                    </div>

                    <div className="wa-bubble">
                      <div className="wa-bubble-title">📊 Resumo diário</div>
                      <div>Bom dia, Davi! Resumo de ontem:</div>
                      <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.5 }}>
                        💰 R$ 24.380 investidos<br/>
                        🎯 ROAS médio: 4.2x<br/>
                        🔥 Destaque: Loja Bella Moda (6.8x)<br/>
                        ⚠ Atenção: 3 contas precisam revisão
                      </div>
                      <div className="wa-bubble-time">09:00 ✓✓</div>
                    </div>

                    <div className="wa-bubble success">
                      <div className="wa-bubble-title green">🎉 Marco atingido</div>
                      <div><strong>Loja Bella Moda</strong> bateu 1.000 conversões no mês — antes do dia 25!</div>
                      <div className="wa-bubble-time">ontem ✓✓</div>
                    </div>

                    <div className="wa-bubble alert">
                      <div className="wa-bubble-title red">🚨 Conta sem entrega</div>
                      <div><strong>Clínica Vivace</strong> parou de gastar há 2h. Possível bloqueio no Google Ads.</div>
                      <div className="wa-bubble-actions">
                        <div className="wa-btn">Ver detalhes</div>
                      </div>
                      <div className="wa-bubble-time">ontem ✓✓</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 40 }}/>
        </div>
      </main>
    </div>
  );
}

function RuleRow({ icon, iconNode, title, desc, on, onToggle, severity }) {
  return (
    <div className="wa-rule">
      <div className={`wa-rule-icon ${icon}`}>{iconNode}</div>
      <div>
        <div className="wa-rule-title">{title}</div>
        <div className="wa-rule-desc">{desc}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{severity}</span>
        <div className={`toggle-switch ${on ? "on" : ""}`} onClick={onToggle}/>
      </div>
    </div>
  );
}

window.WhatsAppScreen = WhatsAppScreen;
