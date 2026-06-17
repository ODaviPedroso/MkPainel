// MKPainel — Reports / whitelabel screen
const { useState: useStateRep } = React;

const REPORT_TEMPLATES = [
  { id: "monthly", name: "Resumo mensal completo", meta: "12 páginas · todas as métricas", thumb: "full" },
  { id: "executive", name: "Executivo", meta: "1 página · ROAS + insights", thumb: "exec" },
  { id: "campaigns", name: "Performance de campanhas", meta: "5 páginas · por campanha", thumb: "camp" },
  { id: "funnel", name: "Funil & retenção", meta: "3 páginas · jornada completa", thumb: "funnel" },
  { id: "compare", name: "Comparativo Google vs Meta", meta: "2 páginas · realocação", thumb: "compare" },
  { id: "weekly", name: "Pulse semanal", meta: "1 página · email automático", thumb: "weekly" },
];

function ReportsScreen({ onBack, tweaks }) {
  const [selected, setSelected] = useStateRep("monthly");
  const [client, setClient] = useStateRep("Loja Bella Moda");

  const clients = [...new Set(window.MOCK_ACCOUNTS.map(a => a.name))].slice(0, 6);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="reports" onNav={(id) => window.__appNav?.(id)} alertCount={window.ALERTS.length}/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar">
          <div>
            <div className="topbar-title">Relatórios</div>
            <div className="topbar-sub">Gere e agende relatórios whitelabel para seus clientes</div>
          </div>
          <div className="topbar-spacer"/>
          <button className="btn btn-secondary btn-sm"><Icon.Eye/> Visualizar como cliente</button>
          <button className="btn btn-primary"><Icon.Plus/> Novo relatório</button>
        </div>

        <div className="main">
          {/* Quick stats */}
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
            <div className="kpi">
              <div className="kpi-label">Relatórios este mês</div>
              <div className="kpi-value mono">47</div>
              <div className="kpi-trend up"><Icon.ArrowUp/> +12 vs. mês anterior</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Agendamentos ativos</div>
              <div className="kpi-value mono">18</div>
              <div className="kpi-trend"><span style={{color: "var(--ink-3)"}}>13 mensais · 5 semanais</span></div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Taxa de abertura</div>
              <div className="kpi-value mono">87%</div>
              <div className="kpi-trend up"><Icon.ArrowUp/> +4pp</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Próximo envio</div>
              <div className="kpi-value mono" style={{ fontSize: 22 }}>Amanhã, 09:00</div>
              <div className="kpi-trend"><span style={{color: "var(--ink-3)"}}>3 clientes</span></div>
            </div>
          </div>

          <div className="reports-grid">
            <div>
              {/* Client selector */}
              <div className="section-h"><h2>Cliente</h2><span className="section-h-sub">Personalize o relatório com a marca do cliente</span></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {clients.map(c => (
                  <div key={c} className="client-pill" onClick={() => setClient(c)} style={{ cursor: "pointer", borderColor: c === client ? "var(--brand-500)" : "var(--border)", boxShadow: c === client ? "0 0 0 3px var(--brand-50)" : "none" }}>
                    <div className="acct-logo">{c.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                    {c}
                  </div>
                ))}
                <div className="client-pill" style={{ borderStyle: "dashed", color: "var(--ink-3)", cursor: "pointer" }}>
                  <span style={{ width: 22, height: 22, display: "grid", placeItems: "center" }}><Icon.Plus/></span>
                  Novo
                </div>
              </div>

              {/* Templates */}
              <div className="section-h"><h2>Modelos de relatório</h2><span className="section-h-sub">Escolha um template ou personalize</span></div>
              <div className="report-templates">
                {REPORT_TEMPLATES.map(t => (
                  <div key={t.id} className={`report-card ${selected === t.id ? "selected" : ""}`} onClick={() => setSelected(t.id)}>
                    <div className="report-thumb">
                      <ReportThumbContent type={t.thumb}/>
                    </div>
                    <div className="report-card-title">{t.name}</div>
                    <div className="report-card-meta">{t.meta}</div>
                  </div>
                ))}
              </div>

              {/* Schedule section */}
              <div className="section-h" style={{ marginTop: 32 }}><h2>Agendamentos ativos</h2></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <ScheduleRow client="Loja Bella Moda" template="Resumo mensal" cadence="Todo dia 1, 09:00" recipients="bella@bellamoda.com.br + 2"/>
                <ScheduleRow client="Imobiliária Solar" template="Pulse semanal" cadence="Segundas, 08:00" recipients="diretoria@solar.com.br"/>
                <ScheduleRow client="Clínica Vivace" template="Executivo" cadence="Sextas, 17:00" recipients="dr.silva@vivace.com.br"/>
                <ScheduleRow client="Restaurante Tagliato" template="Comparativo" cadence="Todo dia 15" recipients="marketing@tagliato.com.br"/>
              </div>
            </div>

            {/* Preview pane */}
            <div className="report-preview">
              <div className="report-preview-head">
                <h3>Pré-visualização · {client}</h3>
                <button className="btn btn-ghost btn-sm"><Icon.Download/></button>
              </div>
              <div className="report-preview-body">
                <WhitelabelMock client={client} template={selected}/>
              </div>
              <div style={{ padding: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }}><Icon.Send/> Enviar agora</button>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}><Icon.Calendar/> Agendar</button>
              </div>
            </div>
          </div>

          <div style={{ height: 40 }}/>
        </div>
      </main>
    </div>
  );
}

function ReportThumbContent({ type }) {
  return (
    <div className="report-thumb-content">
      <div className="report-thumb-bar long"/>
      <div className="report-thumb-bar short"/>
      <div className="report-thumb-blocks">
        <div className="report-thumb-block"/>
        <div className="report-thumb-block alt"/>
        {type === "full" && <><div className="report-thumb-block"/><div className="report-thumb-block alt"/></>}
        {type === "compare" && <><div className="report-thumb-block alt"/><div className="report-thumb-block"/></>}
      </div>
    </div>
  );
}

function ScheduleRow({ client, template, cadence, recipients }) {
  return (
    <div className="schedule-row">
      <div className="schedule-icon"><Icon.Calendar/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{client} · <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>{template}</span></div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{cadence} → {recipients}</div>
      </div>
      <span className="badge badge-green">Ativo</span>
      <button className="btn btn-ghost btn-sm">Editar</button>
    </div>
  );
}

function WhitelabelMock({ client, template }) {
  const acct = window.MOCK_ACCOUNTS.find(a => a.name === client) || window.MOCK_ACCOUNTS[0];
  const initials = client.split(" ").map(w => w[0]).join("").slice(0, 2);
  return (
    <div className="wl-report">
      <div className="wl-cover">
        <div className="wl-cover-logo">{initials}</div>
        <div className="wl-cover-title">{client}</div>
        <div className="wl-cover-sub">Relatório de performance · Outubro 2025</div>
      </div>
      <div className="wl-section">
        <div className="wl-section-h">Resumo do período</div>
        <div className="wl-kpi-row">
          <div className="wl-kpi-mini">
            <div className="wl-kpi-mini-label">Investido</div>
            <div className="wl-kpi-mini-value">R$ {Math.round(acct.spent).toLocaleString("pt-BR")}</div>
          </div>
          <div className="wl-kpi-mini">
            <div className="wl-kpi-mini-label">ROAS</div>
            <div className="wl-kpi-mini-value">{acct.roas.toFixed(1)}x</div>
          </div>
          <div className="wl-kpi-mini">
            <div className="wl-kpi-mini-label">Conversões</div>
            <div className="wl-kpi-mini-value">{acct.conv.toLocaleString("pt-BR")}</div>
          </div>
          <div className="wl-kpi-mini">
            <div className="wl-kpi-mini-label">CTR</div>
            <div className="wl-kpi-mini-value">{acct.ctr.toFixed(2)}%</div>
          </div>
        </div>
      </div>
      <div className="wl-section">
        <div className="wl-section-h">Evolução do investimento</div>
        <Sparkline trend="up" width={300} height={60}/>
      </div>
      <div className="wl-section">
        <div className="wl-section-h">Destaques do mês</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "var(--ink-2)", lineHeight: 1.6 }}>
          <li>ROAS superou meta em 18%</li>
          <li>3 novas campanhas escaladas com sucesso</li>
          <li>CPA reduzido em R$ 4,30 vs. mês anterior</li>
        </ul>
      </div>
    </div>
  );
}

window.ReportsScreen = ReportsScreen;
