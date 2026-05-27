/**
 * Configurações globais da aplicação
 */

// Lista de filiais disponíveis
const FILIAIS = [
  'Santo André',
  'São Bernardo do Campo',
  'Guarulhos',
  'Araçatuba',
  'Ipiranga',
  'Mauá',
  'Mooca',
  'Santos',
  'Santo Amaro',
  'São José dos Campos',
  'Sorocaba',
  'Suzano',
  'Taubaté',
  'Americana',
  'São José do Rio Preto',
  'Valinhos',
  'Tatuapé',
  'Piracicaba',
  'Bauru'
];

// Configurações do painel admin
const ADMIN_CONFIG = {
  defaultPassword: 'vercel2026',
  defaultFilial: 'Santo André'
};

// Exportar para uso global
window.FILIAIS = FILIAIS;
window.ADMIN_CONFIG = ADMIN_CONFIG;
