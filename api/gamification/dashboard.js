/**
 * Vercel Serverless: /api/gamification/dashboard
 * Retorna dados do painel de gamificação
 * Versão: 1.0.0
 */

export default function handler(req, res) {
  // Apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Use GET /api/gamification/dashboard'
    });
  }

  try {
    // Retornar dashboard padrão/vazio
    const dashboard = {
      userScore: 0,
      userLevel: 1,
      userRank: 0,
      dailyChallenge: null,
      weeklyChallenge: null,
      monthlyChallenge: null,
      achievements: [],
      recentActivity: [],
      leaderboardPosition: 0,
      nextLevelProgress: 0,
      lastUpdated: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(200).json(dashboard);
  } catch (error) {
    console.error('[Gamification Dashboard] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
