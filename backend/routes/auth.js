import express from 'express';
import bcrypt from 'bcryptjs';
import { validateLogin, validateRegister } from '../middleware/validation.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getDatabase } from '../db/connection.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Criar novo usuário
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Validar dados
  const validation = validateRegister(email, password, name);
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validação falhou',
      details: validation.errors
    });
  }

  const db = getDatabase();

  // Verificar se email já existe
  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    return res.status(409).json({
      error: 'Email já registrado',
      message: 'Este email já está associado a uma conta'
    });
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Criar usuário
  const result = await db.run(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    [email, hashedPassword, name, 'user']
  );

  // Gerar token
  const token = generateToken(result.lastID, email, 'user');

  res.status(201).json({
    message: 'Usuário registrado com sucesso',
    user: {
      id: result.lastID,
      email: email,
      name: name,
      role: 'user'
    },
    token: token,
    expiresIn: '7d'
  });
}));

/**
 * POST /api/auth/login
 * Fazer login
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validar dados
  const validation = validateLogin(email, password);
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validação falhou',
      details: validation.errors
    });
  }

  const db = getDatabase();

  // Buscar usuário
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({
      error: 'Credenciais inválidas',
      message: 'Email ou senha incorretos'
    });
  }

  // Verificar senha
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({
      error: 'Credenciais inválidas',
      message: 'Email ou senha incorretos'
    });
  }

  // Verificar se usuário está ativo
  if (user.status === 'inactive') {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Sua conta foi desativada'
    });
  }

  // Gerar token
  const token = generateToken(user.id, user.email, user.role);

  res.json({
    message: 'Login realizado com sucesso',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      team: user.team
    },
    token: token,
    expiresIn: '7d'
  });
}));

/**
 * POST /api/auth/refresh
 * Renovar token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const newToken = generateToken(decoded.id, decoded.email, decoded.role);

    res.json({
      message: 'Token renovado com sucesso',
      token: newToken,
      expiresIn: '7d'
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}));

/**
 * GET /api/auth/me
 * Obter informações do usuário atual
 */
router.get('/me', (req, res) => {
  // Este endpoint requer autenticação
  // A verificação é feita no frontend antes de chamar
  res.json({
    message: 'Dados do usuário autenticado',
    user: req.user
  });
});

export default router;
