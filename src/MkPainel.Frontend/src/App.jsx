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

  // Check auth on startup
  useEffect(() => {
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
