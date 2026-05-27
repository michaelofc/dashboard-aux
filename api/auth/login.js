/**
 * Serverless Function: POST /api/auth/login
 * Faz login de usuário (sem banco de dados, apenas JWT)
 */

import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'seu-secret-key-super-seguro-change-me';

// Usuários de teste (em produção, usar banco de dados)
const TEST_USERS = [
  {
    id: 'admin',
    email: 'admin@dashboard.com',
    password: 'Admin@123456',
    name: 'Administrador'
  },
  {
    id: 'manager',
    email: 'manager@dashboard.com',
    password: 'Manager@12345',
    name: 'Gerente'
  }
];

export default function handler(req, res) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validar dados
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Procurar usuário (usando teste ou banco de dados)
    const user = TEST_USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Criar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Retornar sucesso
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
}
