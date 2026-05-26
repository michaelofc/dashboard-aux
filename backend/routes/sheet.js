import express from 'express';

const router = express.Router();

/**
 * GET /api/sheet/fetch-csv
 * Proxy para buscar CSV da Google Sheets
 * Contorna erro de CORS no navegador
 * 
 * Query params:
 *   url: URL da planilha publicada (Google Sheets com &output=csv)
 */
router.get('/fetch-csv', async (req, res) => {
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
    if (url.includes('/pubhtml')) {
      csvUrl = url.replace('/pubhtml', '/pub') + '&output=csv';
    } else if (!url.includes('output=csv')) {
      csvUrl = url + (url.includes('?') ? '&' : '?') + 'output=csv';
    }

    // Adicionar timestamp para evitar cache
    const cacheBreaker = Date.now();
    csvUrl = csvUrl + (csvUrl.includes('?') ? '&' : '?') + 'cache=' + cacheBreaker;

    // Fazer fetch da planilha com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

    let response;
    try {
      response = await fetch(csvUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Verificar resposta
    if (!response.ok) {
      console.error(`Erro ao buscar planilha: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        error: 'Erro ao buscar planilha',
        message: `Status ${response.status}. Verifique se a URL está correta e se a planilha está publicada.`,
        details: response.statusText
      });
    }

    // Obter conteúdo
    const csv = await response.text();

    if (!csv || csv.length === 0) {
      return res.status(400).json({
        error: 'Planilha vazia',
        message: 'A planilha não retornou dados. Verifique se está publicada corretamente.'
      });
    }

    // Retornar CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(csv);

  } catch (error) {
    console.error('Erro no proxy de planilha:', error);

    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Timeout na requisição',
        message: 'A planilha demorou muito para responder. Tente novamente.'
      });
    }

    res.status(500).json({
      error: 'Erro ao buscar planilha',
      message: error.message || 'Erro desconhecido',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
