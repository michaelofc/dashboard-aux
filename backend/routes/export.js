// ===== ROTA DE EXPORTAÇÃO =====
// Endpoints para exportar dados em Excel e PDF

import express from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { getDatabase } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware de autenticação em todas as rotas
router.use(authenticateToken);

// ===== HELPERS =====

/**
 * Formata moeda para padrão brasileiro
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);
}

/**
 * Formata percentual com 2 casas decimais
 */
function formatPercent(value) {
  return `${(parseFloat(value) || 0).toFixed(2)}%`;
}

/**
 * Formata data para padrão brasileiro
 */
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Busca dados de inadimplência com filtros
 */
async function getDashboardData(filters = {}) {
  const db = getDatabase();
  if (!db) throw new Error('Database not initialized');

  let query = `
    SELECT 
      id,
      periodo,
      filial,
      equipe,
      vendedor,
      status,
      valor_inad,
      created_at
    FROM inadimplencia
    WHERE 1=1
  `;

  const params = [];

  if (filters.periodo) {
    query += ' AND periodo = ?';
    params.push(filters.periodo);
  }

  if (filters.equipe && filters.equipe !== 'Todas') {
    query += ' AND equipe = ?';
    params.push(filters.equipe);
  }

  if (filters.vendedor && filters.vendedor !== 'Todos') {
    query += ' AND vendedor = ?';
    params.push(filters.vendedor);
  }

  if (filters.status) {
    if (filters.status === 'Atrasados') {
      query += " AND status = 'Atrasado'";
    } else if (filters.status === 'Cancelados') {
      query += " AND status = 'Cancelado'";
    } else if (filters.status === 'Atrasados + Cancelados') {
      query += " AND status IN ('Atrasado', 'Cancelado')";
    }
  }

  query += ' ORDER BY equipe, vendedor, periodo DESC';

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// ===== ENDPOINTS =====

/**
 * POST /export/excel
 * Exporta dados em Excel com formatação profissional
 */
router.post('/excel', async (req, res) => {
  try {
    const { periodo, equipe, vendedor, status } = req.body;

    // Buscar dados
    const data = await getDashboardData({
      periodo,
      equipe,
      vendedor,
      status,
    });

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum dado encontrado para os filtros selecionados',
      });
    }

    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inadimplência');

    // Configurar colunas
    worksheet.columns = [
      { header: 'Período', key: 'periodo', width: 15 },
      { header: 'Filial', key: 'filial', width: 12 },
      { header: 'Equipe', key: 'equipe', width: 15 },
      { header: 'Vendedor', key: 'vendedor', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Valor Inadimplência', key: 'valor_inad', width: 18 },
      { header: 'Data Registro', key: 'created_at', width: 15 },
    ];

    // Estilizar cabeçalho
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'center' };

    // Adicionar dados com formatação
    data.forEach((row) => {
      const dataRow = worksheet.addRow({
        periodo: row.periodo,
        filial: row.filial,
        equipe: row.equipe,
        vendedor: row.vendedor,
        status: row.status,
        valor_inad: row.valor_inad,
        created_at: formatDate(row.created_at),
      });

      // Formatar coluna de valor
      dataRow.getCell('valor_inad').numFmt = '[R$-pt-BR] #,##0.00';
      dataRow.getCell('valor_inad').alignment = { horizontal: 'right' };

      // Colorir status
      const statusCell = dataRow.getCell('status');
      if (row.status === 'Atrasado') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF6B6B' },
        };
      } else if (row.status === 'Cancelado') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF94E1D5' },
        };
      }
    });

    // Adicionar totalizações
    const totalRow = worksheet.addRow([]);
    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(6).value = `=SUM(F2:F${data.length + 1})`;
    totalRow.getCell(6).font = { bold: true };
    totalRow.getCell(6).numFmt = '[R$-pt-BR] #,##0.00';

    // Congelar primeira linha
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Enviar resposta
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inadimplencia_${new Date().getTime()}.xlsx"`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo Excel',
      error: error.message,
    });
  }
});

/**
 * POST /export/pdf
 * Exporta dados em PDF com estilos
 */
router.post('/pdf', async (req, res) => {
  try {
    const { periodo, equipe, vendedor, status } = req.body;

    // Buscar dados
    const data = await getDashboardData({
      periodo,
      equipe,
      vendedor,
      status,
    });

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum dado encontrado para os filtros selecionados',
      });
    }

    // Criar PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    // Configurar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inadimplencia_${new Date().getTime()}.pdf"`
    );

    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(20).font('Helvetica-Bold').text('Relatório de Inadimplência', {
      align: 'center',
    });

    doc.fontSize(11).font('Helvetica').text(
      `Gerado em: ${new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      { align: 'center', margin: 10 }
    );

    // Filtros aplicados
    doc.fontSize(10).font('Helvetica').text('Filtros:', { underline: true });
    const filters = [];
    if (periodo) filters.push(`Período: ${periodo}`);
    if (equipe) filters.push(`Equipe: ${equipe}`);
    if (vendedor) filters.push(`Vendedor: ${vendedor}`);
    if (status) filters.push(`Status: ${status}`);

    if (filters.length > 0) {
      doc.fontSize(9).text(filters.join(' | '));
    } else {
      doc.fontSize(9).text('Nenhum filtro aplicado');
    }

    doc.moveDown(1);

    // Tabela de dados
    const tableTop = doc.y;
    const colWidth = (doc.page.width - 80) / 7;
    const rowHeight = 20;

    // Cabeçalho da tabela
    const headers = [
      'Período',
      'Filial',
      'Equipe',
      'Vendedor',
      'Status',
      'Valor',
      'Data',
    ];
    let col = 40;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.fillColor('#1F4E78').rect(40, tableTop, doc.page.width - 80, rowHeight).fill();
    doc.fillColor('#FFFFFF');

    headers.forEach((header) => {
      doc.text(header, col, tableTop + 5, { width: colWidth, align: 'center' });
      col += colWidth;
    });

    // Dados
    let rowY = tableTop + rowHeight;
    let total = 0;

    doc.fontSize(8).font('Helvetica').fillColor('#000000');

    data.forEach((row, index) => {
      if (rowY > doc.page.height - 80) {
        doc.addPage();
        rowY = 40;
      }

      const rowColor = index % 2 === 0 ? '#FFFFFF' : '#F5F5F5';
      doc.fillColor(rowColor).rect(40, rowY, doc.page.width - 80, rowHeight).fill();
      doc.fillColor('#000000');

      col = 40;
      const rowData = [
        row.periodo,
        row.filial,
        row.equipe,
        row.vendedor,
        row.status,
        formatCurrency(row.valor_inad),
        formatDate(row.created_at),
      ];

      rowData.forEach((cell) => {
        doc.text(String(cell), col, rowY + 5, {
          width: colWidth,
          align: 'center',
          ellipsis: true,
        });
        col += colWidth;
      });

      total += row.valor_inad;
      rowY += rowHeight;
    });

    // Rodapé com total
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(
      `TOTAL: ${formatCurrency(total)}`,
      40,
      rowY + 10,
      { align: 'right' }
    );

    // Finalizar PDF
    doc.end();
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar arquivo PDF',
      error: error.message,
    });
  }
});

/**
 * GET /export/summary
 * Retorna estatísticas resumidas para exportação
 */
router.get('/summary', async (req, res) => {
  try {
    const { periodo, equipe, vendedor, status } = req.query;

    const data = await getDashboardData({
      periodo,
      equipe,
      vendedor,
      status,
    });

    const total = data.reduce((sum, row) => sum + (row.valor_inad || 0), 0);
    const average =
      data.length > 0 ? total / data.length : 0;
    const maxValue = data.length > 0
      ? Math.max(...data.map((row) => row.valor_inad || 0))
      : 0;

    res.json({
      success: true,
      summary: {
        totalRecords: data.length,
        totalValue: total,
        averageValue: average,
        maxValue: maxValue,
        formattedTotal: formatCurrency(total),
        formattedAverage: formatCurrency(average),
        formattedMax: formatCurrency(maxValue),
      },
    });
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar resumo de exportação',
      error: error.message,
    });
  }
});

export default router;
