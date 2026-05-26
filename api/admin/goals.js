/**
 * Vercel Serverless: /api/admin/goals
 * Gerencia metas do sistema
 * Nota: Usa localStorage do navegador (cliente)
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // GET /api/admin/goals - Listar metas
  if (req.method === 'GET') {
    // Nota: As metas são armazenadas no localStorage do cliente
    // Este endpoint é apenas para documentação/referência
    return res.status(200).json({
      message: 'Metas são armazenadas localmente no navegador',
      storageKey: 'dashboard_goals',
      note: 'Para acessar as metas, use o localStorage do navegador'
    });
  }

  // POST /api/admin/goals - Criar meta
  if (req.method === 'POST') {
    const { scope, targetValue, type, period, description, startDate, endDate, pointsPerAchievement } = req.body;

    if (!scope || !targetValue || !type) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['scope', 'targetValue', 'type']
      });
    }

    const goal = {
      id: Date.now(),
      type,
      scope,
      period,
      targetValue: parseFloat(targetValue),
      description,
      startDate,
      endDate,
      pointsPerAchievement: parseInt(pointsPerAchievement) || 100,
      createdAt: new Date().toISOString(),
      currentValue: 0
    };

    return res.status(201).json({
      success: true,
      message: 'Meta criada com sucesso',
      goal: goal,
      note: 'Meta foi criada. Use o painel admin (admin.html) para gerenciar'
    });
  }

  // DELETE /api/admin/goals/:id - Deletar meta
  if (req.method === 'DELETE') {
    return res.status(200).json({
      success: true,
      message: 'Meta deletada com sucesso',
      note: 'Use o painel admin (admin.html) para deletar metas'
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
