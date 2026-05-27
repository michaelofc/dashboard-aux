/**
 * Serverless Function: POST /api/auth/register
 * Registra novo usuário (sem banco de dados, apenas JWT)
 */

import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'seu-secret-key-super-seguro-change-me';

export default function handler(req, res) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validar dados
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, senha e nome são obrigatórios'
      });
    }

    // Validar email
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validar senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter no mínimo 6 caracteres'
      });
    }

    // Criar JWT
    const token = jwt.sign(
      { email, name, id: email.split('@')[0] },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Retornar sucesso
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: email.split('@')[0],
        email,
        name
      },
      message: 'Usuário registrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: error.message
    });
  }
}
