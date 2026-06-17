// MKPainel — Login screen
const { useState: useStateLogin } = React;

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useStateLogin("");
  const [pwd, setPwd] = useStateLogin("");
  const [loading, setLoading] = useStateLogin(false);

  const submit = (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => onLogin?.(email || "admin@agenciaorbita.com.br"), 700);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <window.LogoMark size={40} radius={10}/>
          <div className="login-brand-name">MKPainel</div>
        </div>
        <div className="login-pitch">
          <div className="login-pitch-eyebrow">Para agências de marketing</div>
          <h1>Todas as suas contas de tráfego, em uma tela.</h1>
          <p>Conecte um único e-mail administrador e o MKPainel descobre automaticamente todas as contas de Google Ads e Meta Ads sob sua gestão. Custos em tempo real, alertas inteligentes e otimizações sugeridas por IA.</p>
          <div className="login-stats">
            <div>
              <div className="login-stat-num">R$ 4,2 mi</div>
              <div className="login-stat-label">gerenciados/mês</div>
            </div>
            <div>
              <div className="login-stat-num">820+</div>
              <div className="login-stat-label">agências ativas</div>
            </div>
            <div>
              <div className="login-stat-num">1 clique</div>
              <div className="login-stat-label">para conectar tudo</div>
            </div>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 2, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          © 2026 MKPainel · Termos · Privacidade
        </div>
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={submit}>
          <h2>Entrar na sua conta</h2>
          <p>Use o e-mail administrador da sua agência para acessar todas as contas vinculadas.</p>

          <div style={{ marginBottom: 14 }}>
            <label className="login-label">E-mail administrador</label>
            <input
              className="input input-lg"
              type="email"
              placeholder="voce@suaagencia.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="login-label">Senha</label>
            <input
              className="input input-lg"
              type="password"
              placeholder="••••••••••"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <a href="#" style={{ fontSize: 13, color: "var(--brand-600)", fontWeight: 500, textDecoration: "none" }}>Esqueci minha senha</a>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Conectando contas..." : "Entrar"}
          </button>

          <div className="login-divider">ou continue com</div>

          <div className="oauth-row">
            <button type="button" className="oauth-btn" onClick={() => { setEmail("admin@agenciaorbita.com.br"); submit(); }}>
              <GoogleAdsMark size={16}/> Google
            </button>
            <button type="button" className="oauth-btn" onClick={() => { setEmail("admin@agenciaorbita.com.br"); submit(); }}>
              <MetaAdsMark size={16}/> Meta
            </button>
          </div>

          <div className="login-foot">
            Não tem conta? <a href="#" style={{ color: "var(--brand-600)", fontWeight: 600, textDecoration: "none" }}>Comece o teste de 14 dias</a>
          </div>
        </form>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
