import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Importar rotas
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import exportRoutes from './routes/export.js';
import gamificationRoutes from './routes/gamification.js';
import sheetRoutes from './routes/sheet.js';

// Importar middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Importar banco de dados
import { initializeDatabase } from './db/connection.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE DE SEGURANÇA =====
app.use(helmet({
  contentSecurityPolicy: false // Desabilitar CSP em desenvolvimento
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Sanitização de dados
app.use(mongoSanitize());

// ===== SERVIR ARQUIVOS ESTÁTICOS (Frontend) =====
// Servir HTML, CSS, JS da raiz do projeto
const parentDir = dirname(dirname(__filename));
app.use(express.static(parentDir, { 
  extensions: ['html', 'js', 'css'],
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// ===== ROTAS PÚBLICAS =====
app.use('/api/auth', authRoutes);
app.use('/api/sheet', sheetRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== ROTAS PROTEGIDAS =====
// Aqui virão as rotas que precisam de autenticação
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/gamification', gamificationRoutes);

// ===== TRATAMENTO DE ERROS =====
app.use(notFoundHandler);
app.use(errorHandler);

// ===== INICIAR SERVIDOR =====
async function startServer() {
  try {
    // Inicializar banco de dados
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 Backend Dashboard Iniciado        ║
╠════════════════════════════════════════╣
║   Ambiente: ${process.env.NODE_ENV || 'development'}                   ║
║   Port: ${PORT}                              ║
║   URL: http://localhost:${PORT}              ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

startServer();

export default app;
