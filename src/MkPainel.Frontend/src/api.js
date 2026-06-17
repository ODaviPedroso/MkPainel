const BASE_URL = 'http://localhost:5000';

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const userId = localStorage.getItem('mkpainel_userId');
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  const token = localStorage.getItem('mkpainel_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao fazer login');
    }
    const data = await res.json();
    if (data.user?.id) {
      localStorage.setItem('mkpainel_userId', data.user.id);
    }
    if (data.token) {
      localStorage.setItem('mkpainel_token', data.token);
    }
    localStorage.setItem('mkpainel_user_name', data.user?.name || 'Usuário');
    localStorage.setItem('mkpainel_user_email', data.user?.email || email);
    return data;
  },

  async register(name, email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao cadastrar');
    }
    const data = await res.json();
    if (data.user?.id) {
      localStorage.setItem('mkpainel_userId', data.user.id);
    }
    if (data.token) {
      localStorage.setItem('mkpainel_token', data.token);
    }
    localStorage.setItem('mkpainel_user_name', data.user?.name || name);
    localStorage.setItem('mkpainel_user_email', data.user?.email || email);
    return data;
  },

  logout() {
    localStorage.removeItem('mkpainel_userId');
    localStorage.removeItem('mkpainel_token');
    localStorage.removeItem('mkpainel_user_name');
    localStorage.removeItem('mkpainel_user_email');
  },

  getUser() {
    return {
      id: localStorage.getItem('mkpainel_userId'),
      name: localStorage.getItem('mkpainel_user_name'),
      email: localStorage.getItem('mkpainel_user_email'),
    };
  },

  async connectPlatform(platform, name) {
    const userId = localStorage.getItem('mkpainel_userId') || 'd7fb473a-4efd-4e92-bc91-2a945b0a33c1';
    const params = new URLSearchParams({ userId, platform, name });
    const res = await fetch(`${BASE_URL}/api/auth/connect-mock?${params.toString()}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Erro ao conectar conta ${platform}`);
    }
    return await res.json();
  },

  // Dashboard
  async getDashboard() {
    const res = await fetch(`${BASE_URL}/api/dashboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao carregar painel');
    }
    return await res.json();
  },

  // Campaigns
  async getCampaigns(filters = {}) {
    const params = new URLSearchParams();
    if (filters.platform && filters.platform !== 'all') {
      // API expects "GoogleAds" or "MetaAds"
      params.append('platform', filters.platform === 'google' ? 'GoogleAds' : 'MetaAds');
    }
    if (filters.accountId) params.append('accountId', filters.accountId);
    if (filters.status) params.append('status', filters.status);
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.descending !== undefined) params.append('descending', filters.descending);

    const res = await fetch(`${BASE_URL}/api/campaigns?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao carregar campanhas');
    }
    return await res.json();
  },

  async syncCampaigns(accountId) {
    const res = await fetch(`${BASE_URL}/api/campaigns/sync/${accountId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao sincronizar campanhas');
    }
    return await res.json();
  },

  async pauseCampaign(id) {
    const res = await fetch(`${BASE_URL}/api/campaigns/${id}/pause`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao pausar campanha');
    }
    return await res.json();
  },

  async resumeCampaign(id) {
    const res = await fetch(`${BASE_URL}/api/campaigns/${id}/resume`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao reativar campanha');
    }
    return await res.json();
  },

  // AI Suggestions
  async getSuggestions(status = 'PendingApproval') {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const res = await fetch(`${BASE_URL}/api/suggestions?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao carregar sugestões');
    }
    return await res.json();
  },

  async approveSuggestion(id) {
    const res = await fetch(`${BASE_URL}/api/suggestions/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao aprovar sugestão');
    }
    return await res.json();
  },

  async rejectSuggestion(id) {
    const res = await fetch(`${BASE_URL}/api/suggestions/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao rejeitar sugestão');
    }
    return await res.json();
  },

  async promptChat(message) {
    const res = await fetch(`${BASE_URL}/api/suggestions/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao enviar mensagem para IA');
    }
    return await res.json();
  },
};
