/**
 * Serverless Function: POST /api/export/excel
 * Exporta dados para Excel
 * 
 * NOTA: Este é um placeholder. Para funcionar completamente, é necessário:
 * 1. Rodar o backend Express em um servidor (Railway, Heroku, etc)
 * 2. Configurar variável BACKEND_URL na Vercel
 */

import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'seu-secret-key-super-seguro-change-me';
const BACKEND_URL = process.env.BACKEND_URL;

export default async function handler(req, res) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validar autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    const token = authHeader.substring(7);
    
    // Verificar token
    jwt.verify(token, SECRET_KEY);

    // Se backend está configurado, redirecionar
    if (BACKEND_URL) {
      console.log(`Redirecionando export para: ${BACKEND_URL}/api/export/excel`);
      
      const backendRes = await fetch(`${BACKEND_URL}/api/export/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(req.body)
      });

      if (!backendRes.ok) {
        throw new Error(`Backend retornou ${backendRes.status}`);
      }

      const buffer = await backendRes.arrayBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="inadimplencia_${new Date().getTime()}.xlsx"`);
      res.send(Buffer.from(buffer));
    } else {
      // Backend não configurado - retornar erro com instruções
      return res.status(503).json({
        success: false,
        message: 'Servidor de exportação não disponível',
        error: 'BACKEND_URL não configurado',
        instructions: [
          '1. Deploy do backend em Railway (https://railway.app)',
          '2. Adicionar BACKEND_URL nas Environment Variables da Vercel',
          '3. Fazer redeploy da Vercel'
        ]
      });
    }
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    
    // Se erro é de autenticação
    if (error.message.includes('invalid token')) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro ao exportar Excel',
      error: error.message
    });
  }
}
