import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

/**
 * Inicializar banco de dados (SQLite ou PostgreSQL)
 */
export const initializeDatabase = async () => {
  return initializeSQLite();
};

/**
 * Inicializar SQLite
 */
const initializeSQLite = async () => {
  try {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/dashboard.db');
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON');
    
    // Criar tabelas
    await createTablesSQLite();
    
    console.log('✅ SQLite conectado:', dbPath);
    return db;
  } catch (error) {
    console.error('❌ Erro ao conectar SQLite:', error.message);
    throw error;
  }
};

/**
 * Criar tabelas SQLite
 */
const createTablesSQLite = async () => {
  const tables = [
    // Tabela de usuários
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'manager', 'user')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      team TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de dados de inadimplência
    `CREATE TABLE IF NOT EXISTS inadimplencia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      periodo TEXT NOT NULL,
      filial TEXT NOT NULL,
      equipe TEXT,
      vendedor TEXT,
      status TEXT CHECK(status IN ('ATRASADO', 'CANCELADO')),
      valor_inad REAL,
      data_vencimento DATE,
      dias_atraso INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(periodo, filial, vendedor, status)
    )`,

    // Tabela de metas e desafios
    `CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tipo TEXT,
      meta REAL,
      alcancado REAL,
      periodo TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // Tabela de pontos/achievements
    `CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge TEXT,
      pontos INTEGER,
      descricao TEXT,
      data_conquista DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // Tabela de auditoria/logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      acao TEXT NOT NULL,
      tabela TEXT,
      registro_id INTEGER,
      dados_anteriores TEXT,
      dados_novos TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`
  ];

  for (const table of tables) {
    await db.exec(table);
  }
};

/**
 * Exportar função para obter conexão
 */
export const getDatabase = () => db;
