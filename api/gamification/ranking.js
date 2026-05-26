/**
 * Vercel Serverless: /api/gamification/ranking
 * Retorna ranking de usuários
 */

export default function handler(req, res) {
  // Apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Use GET /api/gamification/ranking?limit=5'
    });
  }

  try {
    const { limit = 5 } = req.query;
    const maxLimit = Math.min(parseInt(limit) || 5, 100);

    // Retornar ranking padrão/vazio
    // Sem banco de dados, não há dados reais
    const ranking = {
      items: [],
      totalCount: 0,
      limit: maxLimit,
      offset: 0,
      lastUpdated: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(200).json(ranking);
  } catch (error) {
    console.error('[Gamification Ranking] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
