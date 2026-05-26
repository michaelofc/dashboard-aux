// ===== API CLIENT WRAPPER =====
// Carrega o módulo ES6 do ApiClient e o disponibiliza globalmente

(async () => {
  try {
    const apiModule = await import('./api/client.js');
    window.ApiClient = apiModule.default;
  } catch (error) {
    console.error('Erro ao carregar ApiClient:', error);
  }
})();
