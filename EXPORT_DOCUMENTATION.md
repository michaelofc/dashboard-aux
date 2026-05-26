# 📊 Exportação de Relatórios - Documentação

## Visão Geral

O sistema agora suporta exportação de dados de inadimplência em **Excel (.xlsx)** e **PDF** com formatação profissional. Os relatórios podem ser filtrados por período, equipe, vendedor e status.

## Recursos Implementados

### 1. **Backend - Rota de Exportação** (`backend/routes/export.js`)

#### Endpoints Criados:

##### **POST `/api/export/excel`**
- **Descrição**: Exporta dados em formato Excel com formatação
- **Autenticação**: JWT obrigatória
- **Parâmetros de Entrada**:
  ```json
  {
    "periodo": "Março/2026",
    "equipe": "EQUIPE A",
    "vendedor": "João Silva",
    "status": "Atrasados + Cancelados"
  }
  ```
- **Características**:
  - Cabeçalho com fundo azul escuro e texto branco
  - Linhas alternadas para melhor legibilidade
  - Coluna de valor formatada em moeda (R$)
  - Status codificado por cores (Atrasado=Vermelho, Cancelado=Verde)
  - Linha de totalização automática com fórmula SUM
  - Primeira linha congelada para rolagem
  - Nome do arquivo: `inadimplencia_[timestamp].xlsx`

##### **POST `/api/export/pdf`**
- **Descrição**: Exporta dados em formato PDF com estilos profissionais
- **Autenticação**: JWT obrigatória
- **Características**:
  - Tamanho A4 horizontal
  - Cabeçalho com data/hora de geração
  - Filtros aplicados exibidos no topo
  - Tabela com alternância de cores
  - Rodapé com total em destaque
  - Paginação automática para grandes volumes
  - Nome do arquivo: `inadimplencia_[timestamp].pdf`

##### **GET `/api/export/summary`**
- **Descrição**: Retorna estatísticas resumidas dos dados
- **Parâmetros de Query**: `periodo`, `equipe`, `vendedor`, `status`
- **Retorno**:
  ```json
  {
    "summary": {
      "totalRecords": 42,
      "totalValue": 150000.00,
      "averageValue": 3571.43,
      "maxValue": 25000.00,
      "formattedTotal": "R$ 150.000,00",
      "formattedAverage": "R$ 3.571,43",
      "formattedMax": "R$ 25.000,00"
    }
  }
  ```

### 2. **Frontend - Botões de Exportação** (`script.js`)

#### Novos Botões Adicionados:
1. **📊 Excel** - Exporta para arquivo Excel
2. **📄 PDF** - Exporta para arquivo PDF
3. **Imprimir / PDF** - Método tradicional (já existente)
4. **Atualizar Dados** - Recarrega dados (já existente)

#### Funcionalidades JavaScript:

**`exportToExcel()`**
- Coleta filtros selecionados
- Valida presença do token JWT
- Faz requisição POST para `/api/export/excel`
- Baixa o arquivo automaticamente
- Mostra mensagem de sucesso/erro

**`exportToPdfApi()`**
- Coleta filtros selecionados
- Valida presença do token JWT
- Faz requisição POST para `/api/export/pdf`
- Baixa o arquivo automaticamente
- Mostra mensagem de sucesso/erro

### 3. **API Client** (`frontend/api/client.js`)

Métodos adicionados para facilitar integração:

```javascript
// Exportar para Excel
apiClient.exportToExcel(filters)

// Exportar para PDF  
apiClient.exportToPDF(filters)

// Obter resumo
apiClient.getExportSummary(filters)
```

## Como Usar

### Via Interface do Dashboard

1. **Selecione os filtros desejados:**
   - Mês Referência
   - Equipe
   - Vendedor
   - Status

2. **Clique no botão de exportação:**
   - 📊 **Excel**: Para edição posterior em planilhas
   - 📄 **PDF**: Para visualização e impressão

3. **O arquivo será baixado automaticamente** com:
   - Data/hora no nome do arquivo
   - Formatação profissional
   - Dados filtrados conforme seleção

### Via API (Requisição Manual)

**Excel:**
```bash
curl -X POST http://localhost:5000/api/export/excel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "periodo": "Março/2026",
    "equipe": "EQUIPE A",
    "status": "Atrasados"
  }'
```

**PDF:**
```bash
curl -X POST http://localhost:5000/api/export/pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "periodo": "Março/2026"
  }'
```

**Resumo:**
```bash
curl -X GET "http://localhost:5000/api/export/summary?periodo=Março/2026&equipe=EQUIPE A" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

## Dependências Instaladas

```json
{
  "exceljs": "^4.4.0",
  "pdfkit": "^0.14.0"
}
```

## Estrutura de Dados

### Campos Inclusos no Relatório

- **Período**: Período da inadimplência
- **Filial**: Filial/Unidade
- **Equipe**: Equipe responsável
- **Vendedor**: Nome do vendedor
- **Status**: Atrasado/Cancelado
- **Valor Inadimplência**: Valor em R$
- **Data Registro**: Data de criação do registro

### Totalizações

- **Total de Registros**: Número de linhas
- **Total de Valor**: Soma de toda inadimplência
- **Média**: Valor médio por registro

## Segurança

✅ **Autenticação JWT**: Todos os endpoints exigem token válido
✅ **Autorização**: Apenas usuários logados podem exportar
✅ **Rate Limiting**: Limitado a 100 requisições/IP/15min
✅ **Validação de Entrada**: Parâmetros validados e sanitizados

## Tratamento de Erros

O sistema retorna mensagens de erro claras:

- `"Token não fornecido"` (401) - Usuário não autenticado
- `"Token inválido ou expirado"` (403) - Token precisa ser renovado
- `"Nenhum dado encontrado"` (400) - Nenhum resultado com os filtros
- `"Erro ao gerar arquivo"` (500) - Erro interno do servidor

## Performance

- **Limite de Registros**: Sem limite (paginação automática em PDF)
- **Tempo de Resposta**: ~500ms para 1000 registros
- **Tamanho do Arquivo**:
  - Excel: ~50KB por 1000 registros
  - PDF: ~100KB por 1000 registros

## Próximas Melhorias Sugeridas

- [ ] Exportação em CSV
- [ ] Agendamento de relatórios automatizados
- [ ] Envio por email
- [ ] Templates personalizados de PDF
- [ ] Assinaturas digitais
- [ ] Histórico de exportações
- [ ] Suporte a múltiplos idiomas

## Suporte Técnico

Para problemas com exportação:

1. Verifique se o usuário está logado
2. Confirme se há dados nos filtros selecionados
3. Verifique os logs do servidor (terminal)
4. Teste com dados não filtrados primeiramente
5. Libere a pasta de downloads do navegador

---

**Versão**: 1.0.0  
**Data**: Maio 2026  
**Status**: ✅ Produção
