// ===== GAMIFICAÇÃO - UI E LÓGICA =====

// Importar API client dinamicamente
let apiClient;

// Função para carregar o API client quando disponível
async function loadApiClient() {
  if (!apiClient) {
    // Espera um pouco para o apiClient estar disponível
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.ApiClient) {
          apiClient = window.ApiClient;
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 3000);
    });
  }
}

const GamificationModule = (() => {
  let gamificationData = {
    totalPontos: 0,
    achievements: [],
    goals: [],
    badges: [],
    ranking: { posicao: 0, totalUsuarios: 0 }
  };

  /**
   * Inicializar módulo de gamificação
   */
  async function initialize() {
    try {
      await loadApiClient();
      if (!apiClient) {
        console.error('API Client não disponível');
        return;
      }

      // Criar container de gamificação
      createGamificationUI();

      // Carregar e atualizar metas do admin primeiro (para popular o filtro regional)
      loadAdminGoals();

      // Carregar dados
      await loadGamificationData();

      // Atualizar display
      updateDisplay();

      // Adicionar listener para mudança de filtro de regional/filial
      const teamFilterElement = document.getElementById('teamFilter');
      if (teamFilterElement) {
        teamFilterElement.addEventListener('change', () => {
          console.log('📍 Filtro de regional alterado - recarregando metas...');
          loadAdminGoals();  // Recarregar com novo filtro
          updateDisplay();   // Atualizar display com metas filtradas
        });
      }

      // Auto-refresh a cada 5 minutos
      setInterval(updateGamificationData, 5 * 60 * 1000);
    } catch (error) {
      console.error('Erro ao inicializar gamificação:', error);
    }
  }

  /**
   * Criar UI de gamificação
   */
  function createGamificationUI() {
    const container = document.getElementById('gamificationContainer');
    if (!container) return;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
        <!-- Card de Pontos -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Total de Pontos</div>
          <div style="font-size: 32px; font-weight: bold;" id="totalPoints">0</div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 8px;" id="levelInfo">Nível 1</div>
        </div>

        <!-- Card de Metas -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);">
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Metas Ativas</div>
          <div style="font-size: 32px; font-weight: bold;" id="activeGoals">0</div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 8px;" id="goalsInfo">Meta</div>
        </div>

        <!-- Card de Conquistas -->
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);">
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Conquistas</div>
          <div style="font-size: 32px; font-weight: bold;" id="totalAchievements">0</div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 8px;" id="achievementsInfo">Badges Desbloqueadas</div>
        </div>

        <!-- Card de Ranking -->
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #333; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(250, 112, 154, 0.4);">
          <div style="font-size: 14px; opacity: 0.8; margin-bottom: 8px;">Sua Posição</div>
          <div style="font-size: 32px; font-weight: bold;" id="ranking">#0</div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 8px;" id="rankingInfo">Dos usuários</div>
        </div>
      </div>

      <!-- Badges -->
      <div style="margin-top: 30px;">
        <h3 style="color: #333; margin-bottom: 16px;">🏆 Suas Conquistas</h3>
        <div id="badgesContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px;"></div>
      </div>

      <!-- Metas Ativas -->
      <div style="margin-top: 30px;">
        <h3 style="color: #333; margin-bottom: 16px;">🎯 Metas Ativas</h3>
        <div id="goalsContainer" style="display: grid; gap: 12px;"></div>
      </div>

      <!-- Mini Ranking -->
      <div style="margin-top: 30px;">
        <h3 style="color: #333; margin-bottom: 16px;">🏅 Top 5 Ranking</h3>
        <div id="miniRankingContainer" style="background: #f9f9f9; padding: 16px; border-radius: 8px;"></div>
      </div>
    `;
  }

  /**
   * Carregar metas do painel admin e filtrar por filial selecionada
   */
  function loadAdminGoals() {
    try {
      const adminGoals = JSON.parse(localStorage.getItem('dashboard_goals') || '[]');
      
      // Pegar a regional/filial selecionada no filtro
      const selectedRegional = document.getElementById('teamFilter')?.value || '';
      
      if (adminGoals.length > 0) {
        // Filtrar metas por filial: apenas mostrar metas da filial selecionada
        let filteredGoals = adminGoals;
        if (selectedRegional) {
          // Filtrar apenas as metas onde o scope (filial) corresponde à regional selecionada
          filteredGoals = adminGoals.filter(goal => 
            goal.scope && goal.scope.toLowerCase() === selectedRegional.toLowerCase()
          );
          console.log(`🔍 Filtrando metas para: "${selectedRegional}" | Encontradas: ${filteredGoals.length}/${adminGoals.length}`);
        } else {
          console.log('ℹ️ Nenhuma filial selecionada - mostrando todas as metas');
        }
        
        // Converter metas do admin para formato de gamificação
        // Para metas de inadimplência: quanto maior a redução, melhor
        // targetInadempl é o objetivo (menor inadimplência = melhor)
        // currentInadempl é o valor atual
        gamificationData.goals = filteredGoals.map(goal => {
          // Se o objetivo é reduzir inadimplência, o "progresso" é a redução
          // Ex: Reduzir de 50% para 25% = objetivo é 25% (meta mínima)
          // Se atual é 40%, progresso = (50-40) = 10% reduzido de 25% necessário = 40% progresso
          const reductionNeeded = goal.currentInadempl - goal.targetInadempl;
          const reductionAchieved = goal.currentInadempl - goal.currentInadempl; // Sempre 0 no dia da criação
          
          return {
            id: goal.id,
            tipo: goal.scope,
            description: goal.description,
            meta: reductionNeeded || 100,  // Meta de redução
            alcancado: reductionAchieved || 0,  // Redução alcançada até agora
            scope: goal.scope,
            type: goal.type,
            period: goal.period,
            pointsPerAchievement: goal.pointsPerAchievement || 100,
            currentInadempl: goal.currentInadempl,
            targetInadempl: goal.targetInadempl
          };
        });
        
        // Calcular pontos baseado em metas atingidas
        let pontosGanhos = 0;
        gamificationData.goals.forEach(goal => {
          const meta = goal.meta || 1;  // Evitar divisão por zero
          const alcancado = goal.alcancado || 0;
          const percentualAtingido = Math.min((alcancado / meta) * 100, 100);
          const pontos = Math.floor((percentualAtingido / 100) * goal.pointsPerAchievement);
          if (!isNaN(pontos)) {
            pontosGanhos += pontos;
          }
        });
        
        gamificationData.totalPontos = pontosGanhos;
        
        console.log('📊 Metas carregadas do admin:', gamificationData.goals);
      }
    } catch (error) {
      console.error('Erro ao carregar metas do admin:', error);
    }
  }



  /**
   * Carregar dados de gamificação
   */
  async function loadGamificationData() {
    try {
      // Primeiro carregar metas do admin
      loadAdminGoals();

      if (!apiClient) return;

      const [dashboard, stats] = await Promise.all([
        apiClient.getGamificationDashboard(),
        apiClient.getGamificationStats()
      ]);

      if (dashboard.success) {
        gamificationData = dashboard.dashboard;
        gamificationData.stats = stats.stats;
      }
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
    }
  }

  /**
   * Atualizar display
   */
  function updateDisplay() {
    updatePoints();
    updateGoals();
    updateAchievements();
    updateBadges();
    updateRanking();
  }

  /**
   * Atualizar seção de pontos
   */
  function updatePoints() {
    const totalPointsEl = document.getElementById('totalPoints');
    const levelEl = document.getElementById('levelInfo');

    if (totalPointsEl) {
      totalPointsEl.textContent = gamificationData.totalPontos?.toLocaleString() || '0';
    }

    if (levelEl && gamificationData.stats) {
      const nivel = gamificationData.stats.nivel || 1;
      const progresso = gamificationData.stats.progressoProximoNivel || 0;
      levelEl.textContent = `Nível ${nivel} (${progresso}/200 pontos)`;
    }
  }

  /**
   * Atualizar seção de metas
   */
  function updateGoals() {
    const activeGoalsEl = document.getElementById('activeGoals');
    const goalsInfoEl = document.getElementById('goalsInfo');
    const goalsContainer = document.getElementById('goalsContainer');

    if (activeGoalsEl) {
      const numGoals = gamificationData.goals?.length || 0;
      activeGoalsEl.textContent = numGoals;
    }

    if (goalsInfoEl) {
      const numGoals = gamificationData.goals?.length || 0;
      goalsInfoEl.textContent = numGoals === 1 ? '1 Meta' : `${numGoals} Metas`;
    }

    if (goalsContainer && gamificationData.goals) {
      goalsContainer.innerHTML = gamificationData.goals.map(goal => {
        // Verificações de segurança para evitar NaN e undefined
        const alcancado = goal.alcancado || 0;
        const meta = goal.meta || 1;  // Evitar divisão por zero
        
        const progresso = Math.min((alcancado / meta) * 100, 100);
        const atingiu = alcancado >= meta;

        return `
          <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid ${atingiu ? '#10b981' : '#3b82f6'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <span style="font-weight: 600; color: #333;">${goal.tipo}</span>
                ${goal.description ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${goal.description}</div>` : ''}
              </div>
              <span style="font-size: 12px; color: #666;">${alcancado.toLocaleString()} / ${meta.toLocaleString()}</span>
            </div>
            <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div style="width: ${progresso}%; height: 100%; background: ${atingiu ? '#10b981' : '#3b82f6'}; transition: width 0.3s ease;"></div>
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">${Math.round(progresso)}% ${atingiu ? '✅' : ''}</div>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Atualizar seção de conquistas
   */
  function updateAchievements() {
    const totalEl = document.getElementById('totalAchievements');
    const infoEl = document.getElementById('achievementsInfo');

    if (totalEl) {
      const numAchievements = gamificationData.achievements?.length || 0;
      totalEl.textContent = numAchievements;
    }

    if (infoEl) {
      const numAchievements = gamificationData.achievements?.length || 0;
      infoEl.textContent = numAchievements === 1 ? '1 Conquista' : `${numAchievements} Conquistas`;
    }
  }

  /**
   * Atualizar badges
   */
  function updateBadges() {
    const badgesContainer = document.getElementById('badgesContainer');
    if (!badgesContainer || !gamificationData.badges) return;

    badgesContainer.innerHTML = gamificationData.badges.map(badge => `
      <div style="background: white; padding: 12px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;" title="${badge.descricao}">
        <div style="font-size: 32px; margin-bottom: 4px;">${badge.icone}</div>
        <div style="font-size: 11px; color: #333; font-weight: 600; word-break: break-word;">${badge.badge}</div>
      </div>
    `).join('');
  }

  /**
   * Atualizar ranking
   */
  async function updateRanking() {
    try {
      if (!apiClient) return;

      const rankingData = await apiClient.getRanking(5);

      if (rankingData.success) {
        const rankingEl = document.getElementById('ranking');
        const rankingInfoEl = document.getElementById('rankingInfo');

        // Encontrar a posição do usuário atual
        const userPosition = rankingData.ranking.findIndex(u => u.id === gamificationData.ranking?.userId);

        if (rankingEl) {
          rankingEl.textContent = `#${userPosition >= 0 ? userPosition + 1 : '?'}`;
        }

        if (rankingInfoEl) {
          rankingInfoEl.textContent = `de ${rankingData.ranking.length} usuários`;
        }

        // Atualizar mini ranking
        updateMiniRanking(rankingData.ranking);
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    }
  }

  /**
   * Atualizar mini ranking
   */
  function updateMiniRanking(ranking) {
    const container = document.getElementById('miniRankingContainer');
    if (!container) return;

    container.innerHTML = ranking.map((user, index) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px; font-weight: bold; color: ${index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : '#6b7280'};">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
          <div>
            <div style="font-weight: 600; color: #333;">${user.name}</div>
            <div style="font-size: 12px; color: #666;">${user.team || 'Time'}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: bold; color: #667eea;">${user.total_pontos?.toLocaleString() || 0} pts</div>
          <div style="font-size: 12px; color: #666;">${user.total_conquistas || 0} conquistas</div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Atualizar todos os dados de gamificação
   */
  async function updateGamificationData() {
    await loadGamificationData();
    updateDisplay();
  }

  /**
   * Criar notificação de conquista
   */
  function showAchievementNotification(badge, pontos) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    notification.innerHTML = `
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">🎉 ${badge}</div>
      <div style="font-size: 14px; opacity: 0.9;">+${pontos} pontos!</div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  return {
    initialize,
    updateGamificationData,
    showAchievementNotification,
    getGamificationData: () => gamificationData
  };
})();

// Torna disponível globalmente
window.GamificationModule = GamificationModule;
