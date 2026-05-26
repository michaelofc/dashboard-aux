/**
 * Vercel Serverless: /api/gamification/stats
 * Retorna estatísticas de gamificação
 */

export default function handler(req, res) {
  // Apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Use GET /api/gamification/stats'
    });
  }

  try {
    // Retornar estatísticas padrão/vazias
    // Sem banco de dados, não há dados reais de gamificação
    const stats = {
      totalUsers: 0,
      activeUsers: 0,
      totalPoints: 0,
      totalChallenges: 0,
      averageScore: 0,
      lastUpdated: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('[Gamification Stats] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
