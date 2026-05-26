# ⚡ QUICK START - Autenticação JWT + Backend Seguro

## 🚀 5 Minutos para começar

### 1️⃣ Backend (Terminal 1)

```bash
cd backend
npm install
npm run seed
npm run dev
```

**Resultado esperado:**
```
╔════════════════════════════════════════╗
║   🚀 Backend Dashboard Iniciado        ║
╠════════════════════════════════════════╣
║   Ambiente: development                ║
║   Port: 5000                           ║
║   URL: http://localhost:5000           ║
╚════════════════════════════════════════╝
```

### 2️⃣ Criar arquivo `login.html` na raiz

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login - Dashboard</title>
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

### 3️⃣ Testar Login

- **URL:** `http://localhost:5173/login.html` (ou seu servidor local)
- **Email:** `admin@dashboard.com`
- **Senha:** `Admin@123456`

---

## 📁 Arquivos Criados

✅ **Backend**
- `backend/server.js` - Servidor Express
- `backend/package.json` - Dependências
- `backend/.env.example` - Variáveis de ambiente
- `backend/routes/auth.js` - Login/Registro
- `backend/routes/dashboard.js` - Dados
- `backend/routes/users.js` - Gerenciamento de usuários
- `backend/middleware/auth.js` - JWT
- `backend/middleware/validation.js` - Validação
- `backend/db/connection.js` - Banco de dados

✅ **Frontend**
- `frontend/api/client.js` - Cliente API
- `frontend/auth.js` - Tela de login

✅ **Documentação**
- `INTEGRATION.md` - Guia completo de integração
- `backend/README.md` - Documentação da API

---

## 🧪 Testar Endpoints

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dashboard.com",
    "password": "Admin@123456"
  }'
```

### Obter Dados (com token)
```bash
TOKEN="seu_token_aqui"
curl -X GET "http://localhost:5000/api/dashboard/data?periodo=202505" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔐 Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@dashboard.com | Admin@123456 |
| Manager | manager@dashboard.com | Manager@12345 |

---

## ✨ O Que Mudou

| Antes | Depois |
|-------|--------|
| ❌ Dados do Google Sheets público | ✅ Dados no servidor protegido |
| ❌ Sem autenticação | ✅ JWT + Login obrigatório |
| ❌ Sem controle de acesso | ✅ Roles (Admin, Manager, User) |
| ❌ Sem validação de dados | ✅ Validação + Sanitização |
| ❌ Sem rate limiting | ✅ Proteção contra brute-force |
| ❌ Sem audit trail | ✅ Logs de auditoria |

---

## 🐛 Problemas Comuns

**Erro: "Cannot find module"**
```bash
cd backend && npm install
```

**Erro: "CORS error"**
- Certifique-se que o backend está rodando em http://localhost:5000
- Verifique a variável `CORS_ORIGIN` em `.env`

**Erro: "Port 5000 already in use"**
```bash
# Linux/Mac
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📚 Próximas Etapas

1. Ler `INTEGRATION.md` para integração completa
2. Ler `backend/README.md` para documentação da API
3. Adicionar notificações via Telegram/Slack
4. Implementar exportação em Excel

---

## 💡 Dicas

- Use `npm run dev` para desenvolvimento (auto-reload)
- Dados de teste em `backend/scripts/seed.js`
- Cliente API centralizado em `frontend/api/client.js`
- Autenticação em `frontend/auth.js`

---

**Tudo pronto! 🎉**
