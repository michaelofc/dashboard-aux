# 🔗 Guia de Integração: Frontend + Backend

Este guia explica como integrar o novo backend seguro com autenticação JWT no frontend existente.

## 📁 Estrutura Criada

```
projeto/
├── index.html                     # HTML original
├── script.js                      # JavaScript original (será adaptado)
├── style.css                      # CSS original
├── frontend/
│   ├── auth.js                   # Nova: Sistema de autenticação
│   └── api/
│       └── client.js             # Nova: Cliente API
├── backend/                       # Backend Express (Nova pasta)
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   ├── middleware/
│   ├── db/
│   └── README.md
└── INTEGRATION.md                # Este arquivo
```

---

## 🚀 Passo 1: Instalar e Iniciar o Backend

### 1.1 Instalar dependências

```bash
cd backend
npm install
```

### 1.2 Configurar ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Para desenvolvimento, o padrão SQLite já está OK
# Edite apenas se for usar PostgreSQL em produção
```

### 1.3 Popular banco de dados

```bash
npm run seed
```

Isso criará usuários de teste e dados de exemplo.

### 1.4 Iniciar servidor

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Ou modo produção
npm start
```

Servidor rodando em: `http://localhost:5000`

---

## 🌐 Passo 2: Configurar Frontend

### 2.1 Adicionar configuração de API

Crie um arquivo `.env` na raiz do projeto:

```bash
# .env
VITE_API_URL=http://localhost:5000/api
```

Se não estiver usando Vite, configure diretamente no `frontend/api/client.js`:

```javascript
// Line 8 em frontend/api/client.js
const API_BASE_URL = 'http://localhost:5000/api';
```

### 2.2 Estrutura de arquivos

Certifique-se de que os arquivos existem:
- ✅ `frontend/api/client.js` - Cliente API
- ✅ `frontend/auth.js` - Lógica de autenticação

---

## 🔐 Passo 3: Implementar Login

### 3.1 Modificar `index.html`

Adicione no `<head>`:

```html
<script>
  // Verificar autenticação ao carregar
  window.addEventListener('load', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Redirecionar para login
      window.location.href = '/login.html';
    }
  });
</script>
```

### 3.2 Criar `login.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login - Dashboard Inadimplência</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app"></div>
  
  <script type="module">
    import Auth from './frontend/auth.js';
    
    Auth.showLogin();
  </script>
</body>
</html>
```

---

## 🔄 Passo 4: Adaptar Script.js para API

### 4.1 Importar cliente API

Adicione no topo de `script.js`:

```javascript
import apiClient from './frontend/api/client.js';
```

### 4.2 Carregar dados da API

**Antes (Google Sheets):**
```javascript
const sheetUrl = document.getElementById('sheetUrlInput').value;
const data = await parseGoogleSheet(sheetUrl);
```

**Depois (API Backend):**
```javascript
try {
  const response = await apiClient.getDashboardData({
    periodo: monthSelect.value,
    equipe: teamFilter.value,
    vendedor: vendedorFilter.value,
    status: statusFilter.value
  });
  
  const data = response.data;
  Dashboard.renderCharts(data);
} catch (error) {
  console.error('Erro ao carregar dados:', error);
  alert('Erro ao carregar dados. Verifique sua conexão.');
}
```

### 4.3 Carregar filtros dinâmicos

```javascript
async function loadFilters() {
  try {
    const periods = await apiClient.getPeriods();
    const teams = await apiClient.getTeams();
    const sellers = await apiClient.getSellers();
    
    // Popular select elements
    populateSelect('monthSelect', periods.periods);
    populateSelect('teamFilter', teams.teams);
    populateSelect('vendedorFilter', sellers.sellers);
  } catch (error) {
    console.error('Erro ao carregar filtros:', error);
  }
}

function populateSelect(elementId, options) {
  const select = document.getElementById(elementId);
  select.innerHTML = '<option value="">Todas</option>';
  
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
}
```

### 4.4 Implementar logout

```javascript
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      apiClient.logout();
      window.location.href = '/login.html';
    });
  }
}
```

---

## 📊 Passo 5: Importar Dados

### 5.1 Adicionar botão de importação (para managers/admins)

```html
<button id="importDataBtn" class="tab-btn" style="background:#10b981;color:#fff;border:none;">
  📥 Importar Dados
</button>
```

### 5.2 Implementar lógica de importação

```javascript
document.getElementById('importDataBtn')?.addEventListener('click', async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.csv';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    
    let data;
    if (file.name.endsWith('.json')) {
      data = JSON.parse(text);
    } else if (file.name.endsWith('.csv')) {
      data = parseCSV(text);
    }
    
    try {
      const result = await apiClient.importData(data);
      alert(`✅ ${result.inserted} registros importados`);
      location.reload();
    } catch (error) {
      alert('❌ Erro ao importar: ' + error.message);
    }
  };
  
  input.click();
});

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim();
    });
    data.push(obj);
  }
  
  return data;
}
```

---

## 🛡️ Passo 6: Proteção de Sessão

### 6.1 Renovar token automaticamente

```javascript
// Renovar token a cada 5 minutos
setInterval(async () => {
  if (apiClient.isAuthenticated()) {
    try {
      await apiClient.refreshToken();
    } catch (error) {
      // Token expirou, redirecionar para login
      apiClient.logout();
      window.location.href = '/login.html';
    }
  }
}, 5 * 60 * 1000);
```

### 6.2 Verificar autenticação em cada página

```javascript
// No início de script.js
if (!apiClient.isAuthenticated()) {
  window.location.href = '/login.html';
}

// Exibir nome do usuário
const user = apiClient.getCurrentUser();
if (user) {
  document.getElementById('userNameDisplay').textContent = user.name;
}
```

---

## 📝 Passo 7: Atualizar HTML

### 7.1 Adicionar header de usuário

Adicione depois da tag `<nav class="tabs">`:

```html
<div style="
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
">
  <span id="userNameDisplay" style="color: #cbd5e1; font-weight: 600;">
    Carregando...
  </span>
  <button id="logoutBtn" class="tab-btn" style="background:#ef4444;color:#fff;border:none;">
    🚪 Sair
  </button>
</div>
```

### 7.2 Remover input de Google Sheets (agora vem da API)

```html
<!-- REMOVER ESTA SEÇÃO -->
<!-- 
<div style="display:flex; justify-content: flex-end; align-items:center; gap:12px; margin: 4px 0 12px 0;">
  <input id="sheetUrlInput" type="text" placeholder="Cole o link publicado da planilha" style="padding:8px 10px; border-radius:8px; border:1px solid #e5e7eb; width:420px;" />
  <button id="saveSheetUrl" class="tab-btn" style="background:#0ea5e9;color:#fff;border:none;">Carregar</button>
</div>
-->
```

---

## 🧪 Passo 8: Testar Integração

### 8.1 Teste de Login

1. Abra `login.html`
2. Use credenciais de teste:
   - Email: `admin@dashboard.com`
   - Senha: `Admin@123456`
3. Você será redirecionado para o dashboard

### 8.2 Teste de Carregamento de Dados

1. Verifique no console se os dados estão sendo carregados
2. Confirme se os gráficos aparecem corretamente
3. Teste os filtros

### 8.3 Teste de Logout

1. Clique em "Sair"
2. Verifique se redireciona para login.html
3. Abra DevTools → Storage → localStorage
4. Confirme se authToken foi removido

---

## 🐛 Troubleshooting

### Erro: "CORS error"

**Solução:**
1. Verifique se backend está rodando
2. Confirme se `CORS_ORIGIN` em `.env` inclui seu domínio
3. Para desenvolvimento:
   ```bash
   # Em backend/.env
   CORS_ORIGIN=http://localhost:3000,http://localhost:5000
   ```

### Erro: "Token inválido ou expirado"

**Solução:**
1. Faça login novamente
2. Limpe localStorage
3. Reinicie o navegador

### Erro: "Cannot find module"

**Solução:**
```bash
# No diretório backend
npm install
```

### Dados não carregam

**Solução:**
1. Verifique se backend está rodando: `http://localhost:5000/health`
2. Confira os logs do backend
3. Execute seed novamente: `npm run seed`

---

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────┐
│  Usuário acessa login.html              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  frontend/auth.js                       │
│  - renderiza formulário de login        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Usuário clica "Entrar"                 │
│  frontend/api/client.js                 │
│  - faz POST /api/auth/login             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend Express                        │
│  - valida credenciais                   │
│  - gera JWT token                       │
│  - retorna token + user data            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Client armazena token em localStorage  │
│  Redireciona para index.html            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Dashboard carrega                      │
│  - Envia token em cada requisição       │
│  - Carrega dados via API                │
│  - Renderiza gráficos                   │
└─────────────────────────────────────────┘
```

---

## 🚀 Próximas Etapas

1. ✅ Autenticação JWT funcionando
2. ⏳ Notificações via Telegram/Slack
3. ⏳ Exportação em Excel/CSV
4. ⏳ Sistema de metas e desafios
5. ⏳ PWA offline-first

---

## 📞 Suporte

Qualquer dúvida, consulte:
- [Backend README](./backend/README.md)
- [API Documentation](./backend/routes/)
- Logs do servidor: `npm run dev`
- DevTools → Console (frontend)

---

**Integração concluída com ❤️**
