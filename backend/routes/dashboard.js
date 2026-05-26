import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { isValidPeriod, isValidStatus } from '../middleware/validation.js';
import { getDatabase } from '../db/connection.js';

const router = express.Router();

/**
 * GET /api/dashboard/data
 * Obter dados de inadimplência com filtros
 * Query params: periodo, equipe, vendedor, status
 */
router.get('/data', authenticateToken, asyncHandler(async (req, res) => {
  const { periodo, equipe, vendedor, status } = req.query;

  const db = getDatabase();
  let query = 'SELECT * FROM inadimplencia WHERE 1=1';
  const params = [];

  // Filtrar por período
  if (periodo) {
    if (!isValidPeriod(periodo)) {
      return res.status(400).json({ error: 'Período inválido. Use YYYYMM' });
    }
    query += ' AND periodo = ?';
    params.push(periodo);
  }

  // Filtrar por equipe
  if (equipe) {
    query += ' AND equipe = ?';
    params.push(equipe);
  }

  // Filtrar por vendedor
  if (vendedor) {
    query += ' AND vendedor = ?';
    params.push(vendedor);
  }

  // Filtrar por status
  if (status) {
    if (!isValidStatus(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
  }

  query += ' ORDER BY periodo DESC, filial ASC';

  const data = await db.all(query, params);

  // Calcular estatísticas
  const stats = {
    total: data.length,
    valorTotal: data.reduce((sum, item) => sum + (item.valor_inad || 0), 0),
    periodoCount: new Set(data.map(item => item.periodo)).size,
    filialCount: new Set(data.map(item => item.filial)).size
  };

  res.json({
    message: 'Dados recuperados com sucesso',
    data: data,
    stats: stats,
    filtros: { periodo, equipe, vendedor, status }
  });
}));

/**
 * GET /api/dashboard/periods
 * Obter lista de períodos únicos
 */
router.get('/periods', authenticateToken, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const periods = await db.all(
    'SELECT DISTINCT periodo FROM inadimplencia ORDER BY periodo DESC'
  );

  res.json({
    message: 'Períodos disponíveis',
    periods: periods.map(p => p.periodo)
  });
}));

/**
 * GET /api/dashboard/teams
 * Obter lista de equipes
 */
router.get('/teams', authenticateToken, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const teams = await db.all(
    'SELECT DISTINCT equipe FROM inadimplencia WHERE equipe IS NOT NULL ORDER BY equipe'
  );

  res.json({
    message: 'Equipes disponíveis',
    teams: teams.map(t => t.equipe)
  });
}));

/**
 * GET /api/dashboard/sellers
 * Obter lista de vendedores
 */
router.get('/sellers', authenticateToken, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const sellers = await db.all(
    'SELECT DISTINCT vendedor FROM inadimplencia WHERE vendedor IS NOT NULL ORDER BY vendedor'
  );

  res.json({
    message: 'Vendedores disponíveis',
    sellers: sellers.map(s => s.vendedor)
  });
}));

/**
 * GET /api/dashboard/ranking
 * Obter ranking de filiais por inadimplência
 */
router.get('/ranking', authenticateToken, asyncHandler(async (req, res) => {
  const { periodo } = req.query;

  const db = getDatabase();
  let query = `
    SELECT 
      filial,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'ATRASADO' THEN 1 ELSE 0 END) as atrasados,
      SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelados,
      ROUND(CAST(SUM(CASE WHEN status = 'ATRASADO' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*), 4) as taxa_inadimplencia
    FROM inadimplencia
    WHERE 1=1
  `;
  const params = [];

  if (periodo) {
    query += ' AND periodo = ?';
    params.push(periodo);
  }

  query += ' GROUP BY filial ORDER BY taxa_inadimplencia DESC';

  const ranking = await db.all(query, params);

  res.json({
    message: 'Ranking recuperado',
    ranking: ranking,
    period: periodo || 'Todos'
  });
}));

/**
 * POST /api/dashboard/data
 * Importar dados (apenas admin e manager)
 */
router.post('/data', authenticateToken, authorizeRole(['admin', 'manager']), asyncHandler(async (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const db = getDatabase();
  let inserted = 0;
  let duplicates = 0;

  for (const item of data) {
    try {
      await db.run(
        `INSERT OR REPLACE INTO inadimplencia 
         (periodo, filial, equipe, vendedor, status, valor_inad, data_vencimento, dias_atraso) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.periodo,
          item.filial,
          item.equipe || null,
          item.vendedor || null,
          item.status,
          item.valor_inad || 0,
          item.data_vencimento || null,
          item.dias_atraso || null
        ]
      );
      inserted++;
    } catch (error) {
      duplicates++;
    }
  }

  res.json({
    message: 'Dados importados com sucesso',
    inserted: inserted,
    duplicates: duplicates,
    total: data.length
  });
}));

export default router;
