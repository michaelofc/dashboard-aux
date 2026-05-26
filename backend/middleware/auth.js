import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar JWT
 * Extrai o token do header Authorization e valida
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token não fornecido',
        message: 'Você precisa estar autenticado para acessar este recurso'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT Error:', err.message);
        return res.status(403).json({ 
          error: 'Token inválido ou expirado',
          message: 'Por favor, faça login novamente'
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao verificar token',
      message: error.message 
    });
  }
};

/**
 * Middleware para verificar role (autorização)
 */
export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: `Você precisa ser um dos seguintes: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Gerar JWT
 */
export const generateToken = (userId, email, role = 'user') => {
  return jwt.sign(
    { 
      id: userId, 
      email: email, 
      role: role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Decodificar token sem validar (apenas para debug)
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
