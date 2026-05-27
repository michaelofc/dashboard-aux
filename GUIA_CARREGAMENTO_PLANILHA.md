# 📊 Guia: Como Carregar a Planilha Corretamente

## ❌ O Problema: Dados não aparecem

Se os dados da planilha não aparecem no dashboard, provavelmente é porque:

1. **URL está em formato errado** (link de edição em vez de publicação)
2. **Planilha não está publicada publicamente**
3. **URL não foi convertida para formato CSV**

---

## ✅ Solução: Formato Correto da URL

### 1️⃣ **Tipo de URL Esperada**

Deve ser uma das seguintes:

```
https://docs.google.com/spreadsheets/d/[ID]/pub?output=csv
```

OU (Vercel publica automaticamente):

```
https://docs.google.com/spreadsheets/d/e/[ID]/pub?output=csv
```

### 2️⃣ **Como Obter a URL Correta**

#### Método A: Publicar a Planilha (Recomendado)
1. Abra a planilha no Google Sheets
2. Clique em **"Compartilhar"** (canto superior direito)
3. Em "Acesso", mude para **"Qualquer pessoa com o link"** → **Espectador** ✓
4. Copie o link gerado

#### Método B: Usar "Publicar na Web"
1. Abra a planilha no Google Sheets
2. Menu: **Arquivo** → **Publicar na web**
3. Selecione a aba ou intervalo desejado
4. Clique em **"Publicar"**
5. Copie o link gerado

### 3️⃣ **Colar a URL no Dashboard**

1. Abra o dashboard em seu navegador
2. No topo, encontre o campo: **"Cole o link publicado da planilha"**
3. Cole a URL completa
4. Clique em **"Carregar"**
5. Aguarde a mensagem de sucesso

---

## 📋 Formato Esperado da Planilha

A planilha **DEVE TER** as seguintes colunas (nomes flexíveis):

| Obrigatório | Alternativas | Descrição |
|---|---|---|
| **ata** | mês, mes | Mês da transação (ex: "fev./25", "fevereiro 2025") |
| **ano** | ano_ref, ano referência | Ano (ex: 2025, 25) |
| **status** | situação, situacao | Status do contrato (ATRASADO, EM DIA, CANCELADO, etc) |
| **vencimento** | dia vencimento | Dia do vencimento (10, 15, 20, 25) |
| **equipe** | time, squad | Nome da equipe/filial |
| **vendedor** | consultor, colaborador | Nome do vendedor |
| **valor** | valor_contrato, valor venda, produção | Valor em BRL |

**Colunas Opcionais:**
- supervisor, gestor
- cliente, nome_cliente
- contrato, n_contrato
- telefone, tel, celular
- data, data_venda

---

## 🔧 Troubleshooting

### "Erro 404: Planilha não encontrada"
- ❌ URL está incorreta ou expirou
- ✅ Copie novamente a URL do Google Sheets
- ✅ Verifique se começa com `https://docs.google.com`

### "Erro 403: Acesso Negado"
- ❌ Planilha não está compartilhada publicamente
- ✅ Clique em Compartilhar → "Qualquer pessoa com o link"
- ✅ Permissão deve ser **Espectador** ou **Leitor**

### "Erro: Planilha vazia ou sem dados"
- ❌ A planilha não tem os dados esperados
- ✅ Verifique se há dados nas primeiras linhas
- ✅ Confirme que as colunas existem (ata, ano, status, etc)

### "Dados não atualizam"
- ❌ Dados em cache, precisa fazer refresh
- ✅ Clique em **"Atualizar Dados"** no dashboard
- ✅ Ou recarregue a página (F5)
- ✅ Aguarde alguns segundos (Google Sheets às vezes demora)

---

## 📝 Exemplo de Planilha Correta

```
ata      | ano  | status    | vencimento | equipe  | vendedor | valor
---------|------|-----------|------------|---------|----------|----------
fev./25  | 2025 | ATRASADO  | 10        | Filial1 | João     | 50000.00
fev./25  | 2025 | EM DIA    | 15        | Filial1 | Maria    | 75000.00
mar./25  | 2025 | CANCELADO | 20        | Filial2 | Pedro    | 30000.00
```

---

## 🚀 Após Carregar

1. **Conferir dados**: Verifique se aparece na aba "Dashboard"
2. **Selecionar período**: Use o filtro "Mês Referência" (período 8-2)
3. **Filtrar equipe**: Selecione a equipe na dropdown
4. **Visualizar gráficos**: A inadimplência e ranking são atualizados automaticamente

---

## 📞 Dúvidas?

- Verifique o console do navegador (F12 → Console) para logs detalhados
- Procure por mensagens começando com 📊 ou ❌ para diagnosticar
- Confirme que o backend está respondendo em `/api/sheet`

