/**
 * Vercel Serverless Function: Catch-all para /api/*
 * Redireciona todas as requisições para o backend
 * 
 * Em desenvolvimento: http://localhost:5000
 * Em produção: URL configurada em BACKEND_URL
 */

export default async function handler(req, res) {
  // IMPORTANTE: Configure a variável de ambiente BACKEND_URL na Vercel!
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    // Construir URL da requisição
    const path = req.url.replace(/^\/api/, ''); // Remove /api do path
    const fullUrl = `${backendUrl}/api${path}`;

    console.log(`[${req.method}] ${fullUrl}`);

    // Preparar headers
    const headers = {
      ...req.headers,
      host: new URL(backendUrl).host, // Ajustar host header
    };
    delete headers['x-forwarded-host'];

    // Fazer requisição ao backend
    const backendRes = await fetch(fullUrl, {
      method: req.method,
      headers,
      ...(req.method !== 'GET' && req.method !== 'HEAD' 
        ? { body: JSON.stringify(req.body) }
        : {}
      ),
    });

    // Copiar status e headers
    res.status(backendRes.status);
    
    // Copiar headers importantes
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization',
    };
    
    ['content-type', 'content-length'].forEach(header => {
      if (backendRes.headers.get(header)) {
        res.setHeader(header, backendRes.headers.get(header));
      }
    });
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Enviar resposta
    const body = await backendRes.text();
    res.send(body);
  } catch (error) {
    console.error(`❌ Erro ao chamar backend:`, error);
    
    res.status(503).json({
      success: false,
      error: 'Backend não disponível',
      message: error.message,
      hint: 'Configure BACKEND_URL na Vercel ou rode o backend localmente em http://localhost:5000'
    });
  }
}
