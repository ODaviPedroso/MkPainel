// MKPainel — Onboarding (1-click connect)
const { useState: useStateOnb, useEffect: useEffectOnb } = React;

function OnboardingScreen({ email, onDone }) {
  const [step, setStep] = useStateOnb(0);
  // 0: connecting Google, 1: connecting Meta, 2: scanning, 3: ready

  const [googleStatus, setGoogleStatus] = useStateOnb("idle"); // idle | connecting | connected
  const [metaStatus, setMetaStatus] = useStateOnb("idle");
  const [scanning, setScanning] = useStateOnb(false);
  const [discovered, setDiscovered] = useStateOnb(0);

  const connectGoogle = () => {
    setGoogleStatus("connecting");
    setTimeout(() => setGoogleStatus("connected"), 1200);
  };
  const connectMeta = () => {
    setMetaStatus("connecting");
    setTimeout(() => setMetaStatus("connected"), 1200);
  };

  const allConnected = googleStatus === "connected" && metaStatus === "connected";

  useEffectOnb(() => {
    if (allConnected && !scanning && discovered === 0) {
      setScanning(true);
      let n = 0;
      const target = 20;
      const tick = setInterval(() => {
        n += 1;
        setDiscovered(n);
        if (n >= target) {
          clearInterval(tick);
          setTimeout(() => setScanning(false), 400);
        }
      }, 90);
    }
  }, [allConnected]);

  const ready = allConnected && !scanning && discovered >= 20;

  return (
    <div className="onb-page">
      <div className="onb-stepper">
        <div className="onb-step done">
          <span className="onb-step-num"><Icon.Check/></span>
          <span>Conta criada</span>
        </div>
        <div className="onb-step-line"/>
        <div className="onb-step active">
          <span className="onb-step-num">2</span>
          <span>Conectar plataformas</span>
        </div>
        <div className="onb-step-line"/>
        <div className="onb-step">
          <span className="onb-step-num">3</span>
          <span>Painel pronto</span>
        </div>
      </div>

      <div className="onb-card">
        <h1>Conecte com 1 clique</h1>
        <p className="lede">Autorize o e-mail administrador <strong style={{ color: "var(--ink-1)" }}>{email}</strong> e o MKPainel descobre automaticamente <strong style={{ color: "var(--ink-1)" }}>todas as contas</strong> que esse e-mail gerencia — MCC do Google Ads e Business Manager da Meta.</p>

        <div className="connect-list">
          <div className={`connect-row ${googleStatus === "connected" ? "connected" : ""}`}>
            <div className="connect-icon"><GoogleAdsMark size={26}/></div>
            <div className="connect-info">
              <div className="connect-name">Google Ads</div>
              <div className="connect-meta">
                {googleStatus === "idle" && "Acesso à MCC e contas filhas"}
                {googleStatus === "connecting" && "Autorizando..."}
                {googleStatus === "connected" && <span style={{ color: "var(--green-700)" }}>✓ Conectado · 12 contas detectadas</span>}
              </div>
            </div>
            {googleStatus === "idle" && <button className="btn btn-secondary btn-sm" onClick={connectGoogle}>Conectar</button>}
            {googleStatus === "connecting" && <Spinner/>}
            {googleStatus === "connected" && <span className="badge badge-green"><Icon.Check/> Ativo</span>}
          </div>

          <div className={`connect-row ${metaStatus === "connected" ? "connected" : ""}`}>
            <div className="connect-icon"><MetaAdsMark size={26}/></div>
            <div className="connect-info">
              <div className="connect-name">Meta Ads (Facebook & Instagram)</div>
              <div className="connect-meta">
                {metaStatus === "idle" && "Acesso ao Business Manager"}
                {metaStatus === "connecting" && "Autorizando..."}
                {metaStatus === "connected" && <span style={{ color: "var(--green-700)" }}>✓ Conectado · 11 contas detectadas</span>}
              </div>
            </div>
            {metaStatus === "idle" && <button className="btn btn-secondary btn-sm" onClick={connectMeta}>Conectar</button>}
            {metaStatus === "connecting" && <Spinner/>}
            {metaStatus === "connected" && <span className="badge badge-green"><Icon.Check/> Ativo</span>}
          </div>
        </div>

        {scanning && (
          <div className="discover">
            <div className="discover-icon"><Icon.Search/></div>
            <div className="discover-text">
              <div className="discover-title">Descobrindo contas...</div>
              <div className="discover-list">
                <span className="mono">{discovered}</span> de <span className="mono">20</span> contas vinculadas detectadas. Importando históricos dos últimos 90 dias.
              </div>
              <div style={{ height: 4, background: "var(--brand-100)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "var(--brand-600)", width: `${(discovered / 20) * 100}%`, transition: "width 0.2s" }}/>
              </div>
            </div>
          </div>
        )}

        {ready && (
          <div className="discover" style={{ background: "var(--green-50)", borderColor: "#a6f4c5" }}>
            <div className="discover-icon" style={{ background: "var(--green-500)" }}><Icon.Check/></div>
            <div className="discover-text">
              <div className="discover-title" style={{ color: "var(--green-700)" }}>Tudo pronto!</div>
              <div className="discover-list" style={{ color: "var(--green-700)" }}>
                <strong>20 contas</strong> · 142 campanhas · 90 dias de histórico importado
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={onDone}>Pular por enquanto</button>
          <button className="btn btn-primary btn-lg" disabled={!ready} onClick={onDone}>
            {ready ? "Ir para o painel →" : allConnected ? "Importando..." : "Conecte as plataformas"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: "var(--ink-4)", textAlign: "center", maxWidth: 540 }}>
        🔒 Acesso somente leitura. O MKPainel nunca altera seus anúncios sem sua autorização explícita.
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-600)" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

window.OnboardingScreen = OnboardingScreen;
