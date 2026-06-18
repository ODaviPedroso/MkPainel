import React, { useState, useEffect } from 'react';
import { api } from './api';
import { LoginScreen } from './login';
import { OnboardingScreen } from './onboarding';
import { Dashboard } from './dashboard';
import { AccountDetail } from './account-detail';
import { CampaignDetail } from './campaign-detail';
import { AlertsScreen, WhatsAppScreen } from './extra-screens';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login'); // login | onboarding | dashboard | account | campaign | whatsapp | alerts
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Check auth on startup and handle OAuth callbacks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setPage('connecting-oauth');
      
      const userId = localStorage.getItem('mkpainel_userId') || 'd7fb473a-4efd-4e92-bc91-2a945b0a33c1';
      
      api.completeMetaOAuth(code, userId)
        .then(() => {
          handleLoginSuccess();
        })
        .catch(err => {
          alert('Erro ao conectar com Meta Ads: ' + err.message);
          setPage('onboarding');
        });
      return;
    }

    const activeUser = api.getUser();
    if (activeUser.id) {
      setUser(activeUser);
      setPage('dashboard');
    } else {
      setPage('login');
    }
  }, []);

  const handleLoginSuccess = () => {
    const activeUser = api.getUser();
    setUser(activeUser);
    
    // Check if user has connected accounts. If not, send to onboarding
    api.getDashboard().then(dash => {
      if (!dash.connectedAccounts || dash.connectedAccounts.length === 0) {
        setPage('onboarding');
      } else {
        setPage('dashboard');
      }
    }).catch(() => {
      // Fallback
      setPage('onboarding');
    });
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setPage('login');
  };

  const navigate = (toPage, arg = null) => {
    if (toPage === 'account') {
      setSelectedClient(arg);
      setPage('account');
    } else if (toPage === 'campaign') {
      setSelectedCampaign(arg);
      setPage('campaign');
    } else {
      setPage(toPage);
    }
  };

  if (page === 'login') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (page === 'connecting-oauth') {
    return (
      <div className="onb-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 20 }}>
        <Spinner size={48} />
        <h2 style={{ color: 'var(--ink-1)' }}>Conectando ao Meta Ads</h2>
        <p style={{ color: 'var(--ink-4)', textAlign: 'center', maxWidth: 400 }}>
          Estamos autenticando sua conta e importando suas campanhas reais com histórico de métricas. Aguarde um instante...
        </p>
      </div>
    );
  }

  if (page === 'onboarding') {
    return (
      <OnboardingScreen
        email={user?.email || 'admin@agencia.com.br'}
        onDone={() => setPage('dashboard')}
      />
    );
  }

  if (page === 'dashboard') {
    return (
      <Dashboard
        onLogout={handleLogout}
        onNavigate={navigate}
      />
    );
  }

  if (page === 'account') {
    return (
      <AccountDetail
        clientName={selectedClient}
        onBack={() => setPage('dashboard')}
        onNavigate={navigate}
        onCampaignSelect={(camp) => navigate('campaign', camp)}
      />
    );
  }

  if (page === 'campaign') {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        onBack={() => navigate('account', selectedCampaign.accountName)}
        onNavigate={navigate}
      />
    );
  }

  if (page === 'alerts') {
    return (
      <AlertsScreen
        onBack={() => setPage('dashboard')}
        onNavigate={navigate}
      />
    );
  }

  if (page === 'whatsapp') {
    return (
      <WhatsAppScreen
        onNavigate={navigate}
      />
    );
  }

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Página não encontrada</h2>
      <button className="btn btn-primary" onClick={() => setPage('dashboard')}>Voltar ao início</button>
    </div>
  );
}

function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--brand-600)" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
