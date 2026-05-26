// ===== ROTA DE GAMIFICAÇÃO =====
// Endpoints para metas, conquistas e pontuação

import express from 'express';
import { getDatabase } from '../db/connection.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware de autenticação
router.use(authenticateToken);

// ===== HELPERS =====

/**
 * Calcular pontos baseado no tipo de meta
 */
function calcularPontos(tipo, progresso) {
  const basePoints = {
    'meta_inadimplencia': 100,
    'meta_vendas': 80,
    'meta_performance': 120,
    'desafio_semanal': 50,
    'desafio_mensal': 150,
  };

  const pontosBase = basePoints[tipo] || 50;
  return Math.floor(pontosBase * (progresso / 100));
}

/**
 * Validar se conquistou uma badge
 */
function verificarBadges(pontos, inadimplencia, vendas, performance) {
  const badges = [];

  // Badges de pontuação
  if (pontos >= 1000) badges.push({
    badge: 'Campeão',
    icone: '🏆',
    descricao: '1000+ pontos conquistados'
  });

  if (pontos >= 500) badges.push({
    badge: 'Destaque',
    icone: '⭐',
    descricao: '500+ pontos conquistados'
  });

  if (pontos >= 200) badges.push({
    badge: 'Iniciante',
    icone: '🌟',
    descricao: '200+ pontos conquistados'
  });

  // Badges de inadimplência
  if (inadimplencia <= 15) badges.push({
    badge: 'Especialista em Cobrança',
    icone: '💰',
    descricao: 'Mantém inadimplência abaixo de 15%'
  });

  if (inadimplencia <= 10) badges.push({
    badge: 'Mestre da Cobrança',
    icone: '👑',
    descricao: 'Mantém inadimplência abaixo de 10%'
  });

  // Badges de vendas
  if (vendas >= 500000) badges.push({
    badge: 'Vendedor Excepcional',
    icone: '📈',
    descricao: 'Vendas acima de R$ 500.000'
  });

  if (vendas >= 1000000) badges.push({
    badge: 'Lenda de Vendas',
    icone: '🚀',
    descricao: 'Vendas acima de R$ 1.000.000'
  });

  // Badges de performance
  if (performance >= 95) badges.push({
    badge: 'Perfeição',
    icone: '✨',
    descricao: 'Performance 95%+'
  });

  if (performance >= 90) badges.push({
    badge: 'Excelente',
    icone: '💎',
    descricao: 'Performance 90%+'
  });

  // Badges variadas
  badges.push({
    badge: 'Membro Ativo',
    icone: '👥',
    descricao: 'Participando da gamificação'
  });

  return badges;
}

// ===== ENDPOINTS =====

/**
 * GET /gamification/dashboard
 * Dashboard de gamificação do usuário
 */
router.get('/dashboard', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    // Buscar metas do período atual
    const goals = await db.all(
      `SELECT * FROM goals WHERE user_id = ? AND status = 'active' ORDER BY periodo DESC LIMIT 5`,
      [userId]
    );

    // Buscar conquistas recentes
    const achievements = await db.all(
      `SELECT * FROM achievements WHERE user_id = ? ORDER BY data_conquista DESC LIMIT 10`,
      [userId]
    );

    // Calcular total de pontos
    const pointsResult = await db.get(
      `SELECT COALESCE(SUM(pontos), 0) as total_pontos FROM achievements WHERE user_id = ?`,
      [userId]
    );

    const totalPontos = pointsResult?.total_pontos || 0;

    // Buscar dados de performance
    const performanceData = await db.all(
      `SELECT 
        equipe,
        AVG(valor_inad) as media_inadimplencia,
        MAX(valor_inad) as pico_inadimplencia,
        COUNT(*) as total_registros
      FROM inadimplencia 
      WHERE periodo = (SELECT MAX(periodo) FROM inadimplencia)
      GROUP BY equipe
      LIMIT 1`
    );

    const performance = performanceData[0] || {};

    // Gerar badges baseado em performance
    const badges = verificarBadges(
      totalPontos,
      performance.media_inadimplencia || 0,
      0, // vendas - seria calculado de outro lugar
      90 // performance - seria calculada
    );

    res.json({
      success: true,
      dashboard: {
        totalPontos,
        totalAchievements: achievements.length,
        totalGoals: goals.length,
        goals,
        achievements: achievements.slice(0, 5),
        badges: badges.slice(0, 6),
        ranking: {
          posicao: Math.floor(Math.random() * 50) + 1, // Placeholder
          totalUsuarios: Math.floor(Math.random() * 200) + 50 // Placeholder
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard gamificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar gamificação',
      error: error.message
    });
  }
});

/**
 * GET /gamification/goals
 * Listar metas do usuário
 */
router.get('/goals', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { periodo, status } = req.query;

    let query = 'SELECT * FROM goals WHERE user_id = ?';
    const params = [userId];

    if (periodo) {
      query += ' AND periodo = ?';
      params.push(periodo);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const goals = await db.all(query, params);

    // Calcular progresso para cada meta
    const goalsComProgresso = goals.map(goal => ({
      ...goal,
      progresso: goal.meta > 0 ? Math.round((goal.alcancado / goal.meta) * 100) : 0,
      atingiu: goal.alcancado >= goal.meta
    }));

    res.json({
      success: true,
      goals: goalsComProgresso
    });
  } catch (error) {
    console.error('Erro ao listar metas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar metas',
      error: error.message
    });
  }
});

/**
 * POST /gamification/goals
 * Criar nova meta
 */
router.post('/goals', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { tipo, meta, periodo, alcancado = 0 } = req.body;

    if (!tipo || !meta || !periodo) {
      return res.status(400).json({
        success: false,
        message: 'Tipo, meta e período são obrigatórios'
      });
    }

    const result = await db.run(
      `INSERT INTO goals (user_id, tipo, meta, alcancado, periodo, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [userId, tipo, meta, alcancado, periodo]
    );

    res.json({
      success: true,
      message: 'Meta criada com sucesso',
      goal: {
        id: result.lastID,
        user_id: userId,
        tipo,
        meta,
        alcancado,
        periodo,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar meta',
      error: error.message
    });
  }
});

/**
 * PUT /gamification/goals/:id
 * Atualizar meta
 */
router.put('/goals/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const goalId = req.params.id;
    const { alcancado, status } = req.body;

    // Verificar se a meta pertence ao usuário
    const goal = await db.get(
      'SELECT * FROM goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada'
      });
    }

    let updateQuery = 'UPDATE goals SET ';
    const params = [];

    if (alcancado !== undefined) {
      updateQuery += 'alcancado = ?';
      params.push(alcancado);
    }

    if (status) {
      if (alcancado !== undefined) updateQuery += ', ';
      updateQuery += 'status = ?';
      params.push(status);
    }

    updateQuery += ' WHERE id = ? AND user_id = ?';
    params.push(goalId, userId);

    await db.run(updateQuery, params);

    // Se atingiu a meta, criar achievement
    if (alcancado >= goal.meta) {
      const pontos = calcularPontos(goal.tipo, 100);
      await db.run(
        `INSERT INTO achievements (user_id, badge, pontos, descricao)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          `Meta ${goal.tipo} Atingida`,
          pontos,
          `Atingiu meta de ${goal.tipo}: ${goal.meta}`
        ]
      );
    }

    res.json({
      success: true,
      message: 'Meta atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar meta',
      error: error.message
    });
  }
});

/**
 * GET /gamification/achievements
 * Listar conquistas do usuário
 */
router.get('/achievements', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const achievements = await db.all(
      `SELECT * FROM achievements WHERE user_id = ? ORDER BY data_conquista DESC LIMIT ?`,
      [userId, parseInt(limit)]
    );

    // Agrupar por badge
    const badgesByType = {};
    achievements.forEach(ach => {
      if (!badgesByType[ach.badge]) {
        badgesByType[ach.badge] = [];
      }
      badgesByType[ach.badge].push(ach);
    });

    res.json({
      success: true,
      achievements,
      badgesByType,
      totalPoints: achievements.reduce((sum, ach) => sum + (ach.pontos || 0), 0)
    });
  } catch (error) {
    console.error('Erro ao listar conquistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar conquistas',
      error: error.message
    });
  }
});

/**
 * POST /gamification/achievements
 * Registrar nova conquista (admin/manager)
 */
router.post('/achievements', authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    const db = getDatabase();
    const { user_id, badge, pontos, descricao } = req.body;

    if (!user_id || !badge || !pontos) {
      return res.status(400).json({
        success: false,
        message: 'user_id, badge e pontos são obrigatórios'
      });
    }

    const result = await db.run(
      `INSERT INTO achievements (user_id, badge, pontos, descricao)
       VALUES (?, ?, ?, ?)`,
      [user_id, badge, pontos, descricao || '']
    );

    res.json({
      success: true,
      message: 'Conquista registrada com sucesso',
      achievement: {
        id: result.lastID,
        user_id,
        badge,
        pontos,
        descricao,
        data_conquista: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao registrar conquista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar conquista',
      error: error.message
    });
  }
});

/**
 * GET /gamification/ranking
 * Ranking geral de pontuação
 */
router.get('/ranking', async (req, res) => {
  try {
    const db = getDatabase();
    const { limit = 10 } = req.query;

    const ranking = await db.all(
      `SELECT 
        u.id,
        u.name,
        u.team,
        COALESCE(SUM(a.pontos), 0) as total_pontos,
        COUNT(a.id) as total_conquistas
      FROM users u
      LEFT JOIN achievements a ON u.id = a.user_id
      GROUP BY u.id
      ORDER BY total_pontos DESC
      LIMIT ?`,
      [parseInt(limit)]
    );

    // Adicionar ranking
    const rankingComPosicao = ranking.map((user, index) => ({
      ...user,
      posicao: index + 1,
      icone: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '❌'
    }));

    res.json({
      success: true,
      ranking: rankingComPosicao
    });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ranking',
      error: error.message
    });
  }
});

/**
 * GET /gamification/stats
 * Estatísticas gerais de gamificação
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    // Pontos totais
    const pointsData = await db.get(
      `SELECT COALESCE(SUM(pontos), 0) as total FROM achievements WHERE user_id = ?`,
      [userId]
    );

    // Metas completadas
    const completedGoals = await db.get(
      `SELECT COUNT(*) as total FROM goals WHERE user_id = ? AND alcancado >= meta`,
      [userId]
    );

    // Streaks (dias consecutivos com metas)
    const streakData = await db.get(
      `SELECT COUNT(DISTINCT DATE(data_conquista)) as dias_ativos 
       FROM achievements 
       WHERE user_id = ? 
       AND DATE(data_conquista) >= DATE('now', '-30 days')`,
      [userId]
    );

    res.json({
      success: true,
      stats: {
        totalPontos: pointsData.total,
        metasCompletas: completedGoals.total,
        diasAtivos: streakData.dias_ativos || 0,
        nivel: Math.floor((pointsData.total || 0) / 200) + 1,
        progressoProximoNivel: ((pointsData.total || 0) % 200)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
});

export default router;
