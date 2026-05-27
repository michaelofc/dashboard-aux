# 🚀 Guia Rápido: Deploy Backend em Railway + Frontend em Vercel

## Problema
O backend Express (`/backend/`) não é deployado automaticamente na Vercel porque ela só faz deploy de:
- Arquivos estáticos na raiz
- Serverless Functions em `/api/`

## Solução: Usar Railway para o Backend

### 1. Deploy do Backend em Railway

**Opção A: Via Interface Web (Mais fácil)**

```
1. Acesse https://railway.app
2. Clique em "Create New Project"
3. Selecione "Deploy from GitHub"
4. Autorize e selecione seu repositório
5. Configure como mostrado abaixo
```

**Opção B: Via CLI**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd seu-projeto
railway up --detach
```

### 2. Configurar Railway

Após o deploy, Railway vai gerar uma URL como:
```
https://seu-projeto-production.up.railway.app
```

### 3. Adicionar Variável de Ambiente na Vercel

1. Vá até seu projeto na Vercel
2. Settings → Environment Variables
3. Adicione:
   - **Name**: `BACKEND_URL`
   - **Value**: `https://seu-projeto-production.up.railway.app` (sem /api no final)

4. Redeploy automático da Vercel vai pegar a nova variável

## Estrutura do Deploy

```
Frontend (Vercel)
├── index.html
├── script.js
├── style.css
└── /api/[...].js ← Proxy que redireciona para o backend

      ↓ (faz requisição)
      
Backend (Railway)
├── /backend/routes/auth.js
├── /backend/routes/export.js
├── /backend/db/connection.js
└── /backend/server.js
```

## Variáveis de Ambiente no Backend (Railway)

O Railway automaticamente pega do `.env`, ou você pode configurar na UI:

```
PORT=3000
NODE_ENV=production
DATABASE_URL=... (se usar banco de dados)
```

## Testar Localmente

```bash
# Terminal 1: Frontend
vercel dev

# Terminal 2: Backend  
cd backend
npm start
```

Acesse `http://localhost:3000`

## Próximos Passos

- [ ] Deploy backend em Railway
- [ ] Configurar BACKEND_URL na Vercel
- [ ] Testar exportação de Excel
- [ ] Monitorar logs em Railway Dashboard

---

**Precisa de ajuda?** Deixe um comentário!
