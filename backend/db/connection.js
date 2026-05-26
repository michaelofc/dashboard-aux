import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

/**
 * Inicializar banco de dados (SQLite ou PostgreSQL)
 */
export const initializeDatabase = async () => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'sqlite') {
    return initializeSQLite();
  } else if (dbType === 'postgres') {
    return initializePostgres();
  }
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
 * Inicializar PostgreSQL
 */
const initializePostgres = async () => {
  try {
    const pool = new pg.Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Teste de conexão
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    // Criar tabelas
    await createTablesPostgres(pool);

    console.log('✅ PostgreSQL conectado:', `${process.env.DB_HOST}:${process.env.DB_PORT}`);
    return pool;
  } catch (error) {
    console.error('❌ Erro ao conectar PostgreSQL:', error.message);
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
 * Criar tabelas PostgreSQL
 */
const createTablesPostgres = async (pool) => {
  const tables = [
    // Tabela de usuários
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user' CHECK(role IN ('admin', 'manager', 'user')),
      status VARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      team VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de dados de inadimplência
    `CREATE TABLE IF NOT EXISTS inadimplencia (
      id SERIAL PRIMARY KEY,
      periodo VARCHAR(20) NOT NULL,
      filial VARCHAR(255) NOT NULL,
      equipe VARCHAR(255),
      vendedor VARCHAR(255),
      status VARCHAR(50) CHECK(status IN ('ATRASADO', 'CANCELADO')),
      valor_inad DECIMAL(10,2),
      data_vencimento DATE,
      dias_atraso INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(periodo, filial, vendedor, status)
    )`,

    // Tabela de metas
    `CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tipo VARCHAR(100),
      meta DECIMAL(10,2),
      alcancado DECIMAL(10,2),
      periodo VARCHAR(20),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de achievements
    `CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge VARCHAR(255),
      pontos INTEGER,
      descricao TEXT,
      data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de auditoria
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      acao VARCHAR(255) NOT NULL,
      tabela VARCHAR(100),
      registro_id INTEGER,
      dados_anteriores JSONB,
      dados_novos JSONB,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const table of tables) {
    try {
      await pool.query(table);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.error('Erro ao criar tabela:', error.message);
      }
    }
  }
};

/**
 * Exportar função para obter conexão
 */
export const getDatabase = () => db;
