## 🔧 Solução: Dashboard Não Carregava Planilha na Vercel

### ❌ Problema Identificado

O dashboard estava dando erro ao tentar ler a planilha Google Sheets na Vercel. Causa: **CORS (Cross-Origin Request Blocking)**

O frontend tentava fazer fetch direto da URL da planilha Google:
```javascript
// ❌ Isso causava erro CORS na Vercel
fetch(SHEET_CSV_URL + '&cache=' + Date.now())
```

### ✅ Solução Implementada

Criei um **proxy backend** que funciona como intermediário para buscar a planilha, contornando o CORS:

#### 1️⃣ **Nova Rota no Backend** (`backend/routes/sheet.js`)
```javascript
GET /api/sheet/fetch-csv?url={URL_DA_PLANILHA}
```

Esta rota:
- Recebe a URL da planilha como parâmetro
- Valida que é uma URL do Google Sheets
- Faz o fetch da planilha no servidor (sem bloqueio CORS)
- Retorna o CSV para o frontend
- Inclui timeout de 30 segundos
- Trata erros apropriadamente

#### 2️⃣ **Atualização do Frontend** (`script.js`)
Todos os fetchs de planilha foram atualizados para usar o proxy:

**Antes:**
```javascript
const resp = await fetch(SHEET_CSV_URL + '&cache=' + Date.now());
```

**Depois:**
```javascript
const baseUrl = window.location.origin;
const proxyUrl = `${baseUrl}/api/sheet/fetch-csv?url=` + encodeURIComponent(SHEET_CSV_URL);
const resp = await fetch(proxyUrl);
```

#### 3️⃣ **Funções Atualizadas**
- ✅ `loadSheetData()` - carrega dados principais
- ✅ `loadAuxSheet()` - carrega aba de evolução
- ✅ `loadFromDashboardSheet()` - dados de gamificação  
- ✅ `loadFromSources()` - múltiplas fontes de gamificação

---

### 🚀 Como Testar Localmente

```bash
# 1. Instale dependências (se não tiver)
cd backend
npm install

# 2. Inicie o servidor em desenvolvimento
npm run dev
# Servidor rodará em http://localhost:5000

# 3. Abra o dashboard em outra aba/janela
# http://localhost:5000/index.html
```

### 📤 Deploy na Vercel

Após fazer push das alterações, a Vercel vai:
1. Detectar as mudanças no `backend/routes/sheet.js`
2. Instalar dependências (já estão no `package.json`)
3. Fazer deploy automático

**Pontos Importantes:**
- A rota `/api/sheet/fetch-csv` é **pública** (não requer JWT)
- Funciona com **qualquer URL de planilha Google Sheets publicada**
- Inclui validação de segurança (apenas aceita URLs do Google Sheets)
- Retorna erros descritivos se algo der errado

### 🔍 Testando a Rota Proxy

Você pode testar diretamente:

```bash
# Em desenvolvimento (localhost)
curl "http://localhost:5000/api/sheet/fetch-csv?url=https://docs.google.com/spreadsheets/..."

# Na Vercel (substitua seu domínio)
curl "https://seu-dominio.vercel.app/api/sheet/fetch-csv?url=https://docs.google.com/spreadsheets/..."
```

### ✨ Benefícios da Solução

✅ Contorna CORS completamente  
✅ Funciona em localhost e Vercel  
✅ Mesma URL de origem (`window.location.origin`)  
✅ Rota pública (não precisa autenticação)  
✅ Timeout configurável (30 segundos)  
✅ Validação de segurança  
✅ Tratamento de erros robusto  

---

### 📝 Próximos Passos

1. **Fazer commit das mudanças:**
   ```bash
   git add .
   git commit -m "fix: add Google Sheets CSV proxy to fix CORS on Vercel"
   git push
   ```

2. **Verificar deploy na Vercel** (deve ser automático)

3. **Testar na Vercel:**
   - Abra seu dashboard na URL da Vercel
   - Cole a URL da planilha publicada
   - Clique em "Carregar"
   - Verifique se os dados aparecem

4. **Se ainda houver erro:**
   - Abra a seção de Rede (F12 → Network)
   - Verifique requisição para `/api/sheet/fetch-csv`
   - Cheque o status da resposta e mensagem de erro

---

### 🛠️ Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `backend/routes/sheet.js` | ✨ NOVO - Rota proxy |
| `backend/server.js` | Registrou nova rota |
| `script.js` | Atualizado 4 funções para usar proxy |

---

**Dúvidas?** Verifique os comentários no código ou abra as Developer Tools (F12) para ver os logs de erro.
