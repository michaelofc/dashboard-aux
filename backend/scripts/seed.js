import bcrypt from 'bcryptjs';
import { initializeDatabase, getDatabase } from '../db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para popular banco de dados com dados de teste
 * Execute com: npm run seed
 */
async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Inicializar banco de dados
    await initializeDatabase();
    const db = getDatabase();

    // Criar usuário admin padrão
    const adminPassword = await bcrypt.hash('Admin@123456', 10);
    
    try {
      await db.run(
        `INSERT INTO users (email, password, name, role, team, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['admin@dashboard.com', adminPassword, 'Administrador', 'admin', 'Admin', 'active']
      );
      console.log('✅ Admin criado: admin@dashboard.com | Senha: Admin@123456');
    } catch (error) {
      console.log('ℹ️  Admin já existe');
    }

    // Criar usuário manager padrão
    const managerPassword = await bcrypt.hash('Manager@12345', 10);
    try {
      await db.run(
        `INSERT INTO users (email, password, name, role, team, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['manager@dashboard.com', managerPassword, 'Gerente', 'manager', 'Equipe A', 'active']
      );
      console.log('✅ Manager criado: manager@dashboard.com | Senha: Manager@12345');
    } catch (error) {
      console.log('ℹ️  Manager já existe');
    }

    // Inserir dados de teste de inadimplência
    const testData = [
      {
        periodo: '202505',
        filial: 'Filial A',
        equipe: 'Equipe 1',
        vendedor: 'João Silva',
        status: 'ATRASADO',
        valor_inad: 5000,
        dias_atraso: 15
      },
      {
        periodo: '202505',
        filial: 'Filial A',
        equipe: 'Equipe 1',
        vendedor: 'Maria Santos',
        status: 'CANCELADO',
        valor_inad: 2500,
        dias_atraso: null
      },
      {
        periodo: '202505',
        filial: 'Filial B',
        equipe: 'Equipe 2',
        vendedor: 'Carlos Costa',
        status: 'ATRASADO',
        valor_inad: 3500,
        dias_atraso: 20
      },
      {
        periodo: '202504',
        filial: 'Filial A',
        equipe: 'Equipe 1',
        vendedor: 'João Silva',
        status: 'ATRASADO',
        valor_inad: 4500,
        dias_atraso: 30
      },
      {
        periodo: '202504',
        filial: 'Filial B',
        equipe: 'Equipe 2',
        vendedor: 'Carlos Costa',
        status: 'CANCELADO',
        valor_inad: 1800,
        dias_atraso: null
      }
    ];

    let insertedCount = 0;
    for (const item of testData) {
      try {
        await db.run(
          `INSERT OR IGNORE INTO inadimplencia 
           (periodo, filial, equipe, vendedor, status, valor_inad, dias_atraso) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.periodo,
            item.filial,
            item.equipe,
            item.vendedor,
            item.status,
            item.valor_inad,
            item.dias_atraso
          ]
        );
        insertedCount++;
      } catch (error) {
        console.log(`⚠️  Dado duplicado: ${item.filial} - ${item.vendedor}`);
      }
    }

    console.log(`✅ ${insertedCount} registros de teste inseridos`);
    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📝 Credenciais de teste:');
    console.log('   Admin: admin@dashboard.com / Admin@123456');
    console.log('   Manager: manager@dashboard.com / Manager@12345');
    console.log('\n🚀 Inicie o servidor com: npm start');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante seed:', error.message);
    process.exit(1);
  }
}

seed();
