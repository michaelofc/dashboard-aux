/**
 * Serverless Function: POST /api/auth/refresh
 * Renova token JWT expirado
 */

import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'seu-secret-key-super-seguro-change-me';

export default function handler(req, res) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.substring(7);

    // Verificar token (ignora expiração para refresh)
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (e) {
      // Se expirado, fazer decode sem validação
      decoded = jwt.decode(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
    }

    // Criar novo token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, name: decoded.name },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token: newToken,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      },
      message: 'Token renovado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao renovar token',
      error: error.message
    });
  }
}
