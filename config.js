/**
 * Configurações globais da aplicação
 */

// Lista de filiais disponíveis
const FILIAIS = [
  'Santo André',
  'São Paulo',
  'Campinas',
  'Sorocaba',
  'Ribeirão Preto',
  'Curitiba',
  'Brasília',
  'Belo Horizonte',
  'Rio de Janeiro',
  'Salvador',
  'Fortaleza',
  'Manaus',
  'Recife',
  'Porto Alegre',
  'Goiânia',
  'Teste'  // Para testes
];

// Configurações do painel admin
const ADMIN_CONFIG = {
  defaultPassword: 'vercel2026',
  defaultFilial: 'Santo André'
};

// Exportar para uso global
window.FILIAIS = FILIAIS;
window.ADMIN_CONFIG = ADMIN_CONFIG;
