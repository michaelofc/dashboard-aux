/**
 * Vercel Serverless Function: /api/sheet
 * Proxy para buscar CSV da Google Sheets
 * Contorna erro de CORS no navegador
 * 
 * Endpoint: GET /api/sheet?url=<google-sheets-url>
 */

export default async function handler(req, res) {
  // Apenas GET é permitido
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Use GET /api/sheet?url=...'
    });
  }

  try {
    const { url } = req.query;

    // Validar URL
    if (!url) {
      return res.status(400).json({
        error: 'URL da planilha não fornecida',
        message: 'Envie a URL da planilha via query parameter ?url=...'
      });
    }

    // Validar que é URL do Google Sheets
    if (!url.includes('docs.google.com/spreadsheets')) {
      return res.status(400).json({
        error: 'URL inválida',
        message: 'A URL deve ser de uma planilha Google Sheets'
      });
    }

    // Converter URL para formato CSV se necessário
    let csvUrl = url;
    
    // Remover /pubhtml e adicionar formato CSV
    if (url.includes('/pubhtml')) {
      csvUrl = url.replace('/pubhtml', '/pub');
      if (!csvUrl.includes('output=csv')) {
        csvUrl = csvUrl + (csvUrl.includes('?') ? '&' : '?') + 'output=csv';
      }
    } else if (!url.includes('output=csv')) {
      // Adicionar output=csv se não tiver
      csvUrl = url + (url.includes('?') ? '&' : '?') + 'output=csv';
    }

    // Adicionar timestamp para evitar cache do Google
    const cacheBreaker = Date.now();
    csvUrl = csvUrl + (csvUrl.includes('?') ? '&' : '?') + 'cache=' + cacheBreaker;

    console.log('[Sheet API] Fetching CSV from:', csvUrl);

    // Fazer fetch da planilha com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

    let response;
    try {
      response = await fetch(csvUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Verificar se resposta foi bem-sucedida
    if (!response.ok) {
      console.error('[Sheet API] Google Sheets error:', response.status, response.statusText);
      
      // Resposta específica para cada erro
      if (response.status === 404) {
        return res.status(404).json({
          error: 'Planilha não encontrada',
          message: 'A URL da planilha parece estar inválida ou a planilha foi removida'
        });
      } else if (response.status === 403) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'A planilha não está publicada ou o acesso está restrito'
        });
      }

      return res.status(response.status).json({
        error: 'Erro ao buscar planilha',
        message: `Google Sheets retornou: ${response.status} ${response.statusText}`
      });
    }

    // Obter conteúdo CSV
    const csvContent = await response.text();

    // Validar se é realmente CSV
    if (!csvContent || csvContent.trim().length === 0) {
      return res.status(400).json({
        error: 'Planilha vazia',
        message: 'A planilha retornou conteúdo vazio'
      });
    }

    // Retornar CSV com headers apropriados
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).send(csvContent);

  } catch (error) {
    console.error('[Sheet API] Erro ao buscar planilha:', error);

    // Diferenciar erros
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Timeout',
        message: 'Timeout ao buscar planilha do Google Sheets (>30s). Tente novamente.'
      });
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return res.status(503).json({
        error: 'Erro de conexão',
        message: 'Não foi possível conectar ao Google Sheets. Verifique sua conexão.'
      });
    }

    return res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error.message || 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
}
