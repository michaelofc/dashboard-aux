/**
 * Cliente API - Dashboard de Inadimplência
 * Centraliza todas as requisições HTTP
 */

// Detectar API_BASE_URL automáticamente
const API_BASE_URL = (() => {
  // Se temos window.API_URL, usar isso
  if (typeof window !== 'undefined' && window.API_URL) {
    return window.API_URL;
  }
  // Se está em localhost, usar localhost:5000
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  // Fallback: usar a mesma origem
  return `${window.location.origin}/api`;
})();

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('authToken') || null;
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  /**
   * Fazer requisição HTTP genérica
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Adicionar token se disponível
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Se token expirou
      if (response.status === 403) {
        this.logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    });
  }

  /**
   * POST
   */
  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    });
  }

  /**
   * PUT
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options
    });
  }

  /**
   * DELETE
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }

  // ===== AUTENTICAÇÃO =====

  /**
   * Registrar novo usuário
   */
  async register(email, password, name) {
    const data = await this.post('/auth/register', {
      email,
      password,
      name
    });

    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  /**
   * Fazer login
   */
  async login(email, password) {
    const data = await this.post('/auth/login', {
      email,
      password
    });

    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  /**
   * Renovar token
   */
  async refreshToken() {
    const data = await this.post('/auth/refresh', {});
    this.setToken(data.token);
    return data;
  }

  /**
   * Logout
   */
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Salvar token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  /**
   * Salvar dados do usuário
   */
  setUser(user) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser() {
    return this.user;
  }

  // ===== DASHBOARD =====

  /**
   * Obter dados de inadimplência
   */
  async getDashboardData(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.periodo) params.append('periodo', filters.periodo);
    if (filters.equipe) params.append('equipe', filters.equipe);
    if (filters.vendedor) params.append('vendedor', filters.vendedor);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = `/dashboard/data${queryString ? '?' + queryString : ''}`;

    return this.get(endpoint);
  }

  /**
   * Obter períodos disponíveis
   */
  async getPeriods() {
    return this.get('/dashboard/periods');
  }

  /**
   * Obter equipes
   */
  async getTeams() {
    return this.get('/dashboard/teams');
  }

  /**
   * Obter vendedores
   */
  async getSellers() {
    return this.get('/dashboard/sellers');
  }

  /**
   * Obter ranking de filiais
   */
  async getRanking(periodo = null) {
    const endpoint = periodo 
      ? `/dashboard/ranking?periodo=${periodo}`
      : '/dashboard/ranking';
    
    return this.get(endpoint);
  }

  /**
   * Importar dados
   */
  async importData(data) {
    return this.post('/dashboard/data', { data });
  }

  // ===== USUÁRIOS =====

  /**
   * Listar todos os usuários (admin)
   */
  async getUsers() {
    return this.get('/users');
  }

  /**
   * Obter usuário específico
   */
  async getUser(userId) {
    return this.get(`/users/${userId}`);
  }

  /**
   * Atualizar usuário
   */
  async updateUser(userId, data) {
    return this.put(`/users/${userId}`, data);
  }

  /**
   * Mudar senha
   */
  async changePassword(userId, currentPassword, newPassword) {
    return this.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Atualizar role (admin)
   */
  async updateUserRole(userId, role) {
    return this.put(`/users/${userId}/role`, { role });
  }

  /**
   * Deletar usuário (admin)
   */
  async deleteUser(userId) {
    return this.delete(`/users/${userId}`);
  }

  // ===== EXPORTAÇÃO =====

  /**
   * Exportar dados em Excel
   */
  async exportToExcel(filters = {}) {
    try {
      const response = await fetch(`${this.apiBaseURL}/export/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar Excel');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inadimplencia_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      throw error;
    }
  }

  /**
   * Exportar dados em PDF
   */
  async exportToPDF(filters = {}) {
    try {
      const response = await fetch(`${this.apiBaseURL}/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inadimplencia_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  }

  /**
   * Obter resumo de exportação
   */
  async getExportSummary(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return this.get(`/export/summary?${queryString}`);
  }

  // ===== GAMIFICAÇÃO =====

  /**
   * Obter dashboard de gamificação
   */
  async getGamificationDashboard() {
    return this.get('/gamification/dashboard');
  }

  /**
   * Listar metas do usuário
   */
  async getGoals(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return this.get(`/gamification/goals?${queryString}`);
  }

  /**
   * Criar nova meta
   */
  async createGoal(tipo, meta, periodo, alcancado = 0) {
    return this.post('/gamification/goals', {
      tipo,
      meta,
      periodo,
      alcancado
    });
  }

  /**
   * Atualizar meta
   */
  async updateGoal(goalId, alcancado, status = null) {
    return this.put(`/gamification/goals/${goalId}`, {
      alcancado,
      status
    });
  }

  /**
   * Listar conquistas do usuário
   */
  async getAchievements(limit = 20) {
    return this.get(`/gamification/achievements?limit=${limit}`);
  }

  /**
   * Registrar nova conquista
   */
  async createAchievement(user_id, badge, pontos, descricao = '') {
    return this.post('/gamification/achievements', {
      user_id,
      badge,
      pontos,
      descricao
    });
  }

  /**
   * Obter ranking geral
   */
  async getRanking(limit = 10) {
    return this.get(`/gamification/ranking?limit=${limit}`);
  }

  /**
   * Obter estatísticas de gamificação
   */
  async getGamificationStats() {
    return this.get('/gamification/stats');
  }
}

// Exportar instância única
export default new ApiClient();
