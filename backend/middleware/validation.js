import validator from 'validator';

/**
 * Validar email
 */
export const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validar senha (mínimo 8 caracteres, 1 maiúscula, 1 número)
 */
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Sanitizar string (remover caracteres perigosos)
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.trim(str).replace(/[<>\"']/g, '');
};

/**
 * Validar dados de login
 */
export const validateLogin = (email, password) => {
  const errors = {};

  if (!email || !isValidEmail(email)) {
    errors.email = 'Email inválido';
  }

  if (!password || password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar dados de registro
 */
export const validateRegister = (email, password, name) => {
  const errors = {};

  if (!email || !isValidEmail(email)) {
    errors.email = 'Email inválido';
  }

  if (!password) {
    errors.password = 'Senha é obrigatória';
  } else if (!isValidPassword(password)) {
    errors.password = 'Senha deve ter: 8+ caracteres, maiúscula, número e caractere especial (@$!%*?&)';
  }

  if (!name || name.length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar período (formato: YYYYMM ou YYYY-MM)
 */
export const isValidPeriod = (period) => {
  const periodRegex = /^\d{4}(-\d{2}|\d{2})$/;
  return periodRegex.test(period);
};

/**
 * Sanitizar e validar status
 */
export const isValidStatus = (status) => {
  const validStatuses = ['ATRASADO', 'CANCELADO', ''];
  return validStatuses.includes(status);
};
