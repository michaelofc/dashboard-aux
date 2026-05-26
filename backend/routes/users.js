import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getDatabase } from '../db/connection.js';

const router = express.Router();

/**
 * GET /api/users
 * Listar todos os usuários (apenas admin)
 */
router.get('/', authenticateToken, authorizeRole(['admin']), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const users = await db.all(
    'SELECT id, email, name, role, team, status, created_at FROM users ORDER BY created_at DESC'
  );

  res.json({
    message: 'Usuários recuperados',
    users: users
  });
}));

/**
 * GET /api/users/:id
 * Obter dados de um usuário específico
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const userId = parseInt(req.params.id);

  // Usuário só pode ver seus próprios dados, exceto admins
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const user = await db.get(
    'SELECT id, email, name, role, team, status, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  res.json({
    message: 'Usuário recuperado',
    user: user
  });
}));

/**
 * PUT /api/users/:id
 * Atualizar dados de um usuário
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const userId = parseInt(req.params.id);
  const { name, team } = req.body;

  // Usuário só pode atualizar seus próprios dados, exceto admins
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  // Validar dados
  if (!name || name.length < 3) {
    return res.status(400).json({ error: 'Nome inválido' });
  }

  const result = await db.run(
    'UPDATE users SET name = ?, team = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, team || null, userId]
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  res.json({
    message: 'Usuário atualizado com sucesso',
    user: { id: userId, name, team }
  });
}));

/**
 * PUT /api/users/:id/password
 * Atualizar senha
 */
router.put('/:id/password', authenticateToken, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const userId = parseInt(req.params.id);
  const { currentPassword, newPassword } = req.body;

  // Usuário só pode atualizar sua própria senha, exceto admins
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Senhas são obrigatórias' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 8 caracteres' });
  }

  const user = await db.get('SELECT password FROM users WHERE id = ?', [userId]);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  // Verificar senha atual
  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  // Hash da nova senha
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.run(
    'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [hashedPassword, userId]
  );

  res.json({
    message: 'Senha atualizada com sucesso'
  });
}));

/**
 * DELETE /api/users/:id
 * Deletar usuário (apenas admin)
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin']), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const userId = parseInt(req.params.id);

  // Não permitir deletar a si mesmo
  if (req.user.id === userId) {
    return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
  }

  const result = await db.run('DELETE FROM users WHERE id = ?', [userId]);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  res.json({
    message: 'Usuário deletado com sucesso'
  });
}));

/**
 * PUT /api/users/:id/role
 * Atualizar role de um usuário (apenas admin)
 */
router.put('/:id/role', authenticateToken, authorizeRole(['admin']), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const userId = parseInt(req.params.id);
  const { role } = req.body;

  const validRoles = ['admin', 'manager', 'user'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role inválida' });
  }

  // Não permitir remover a si mesmo como admin
  if (req.user.id === userId && role !== 'admin') {
    return res.status(400).json({ error: 'Você não pode remover seus direitos de administrador' });
  }

  const result = await db.run(
    'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [role, userId]
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  res.json({
    message: 'Role atualizado com sucesso',
    user: { id: userId, role }
  });
}));

export default router;
