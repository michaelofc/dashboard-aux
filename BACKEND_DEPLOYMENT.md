# ⚠️ PROBLEMA: Backend API não está em produção

## Erro encontrado
```
Failed to load resource: the server responded with a status of 404
API Error: SyntaxError: Unexpected token 'T'
```

Este erro significa que a API backend (Express em `/backend/`) não está rodando na Vercel.

## Solução: Deploy do Backend em Railway

A Vercel só faz deploy de arquivos estáticos no `/` e Serverless Functions em `/api/`. O Express server em `/backend/` NÃO é deployado automaticamente.

### Passo 1: Criar conta em Railway
1. Acesse https://railway.app
2. Clique em "Start a New Project"
3. Selecione "GitHub" e autorize
4. Selecione seu repositório `dashboard-aux`

### Passo 2: Configurar Railway
1. Na página do projeto, clique em "Add"
2. Selecione "GitHub Repo"
3. Configure:
   - **Start Command**: `npm start`
   - **Environment**: Adicione `PORT=3000` (ou deixe Railway escolher)
4. Clique em "Deploy"

### Passo 3: Obter URL do Backend
Após o deploy, Railway vai gerar uma URL como:
```
https://seu-projeto.railway.app
```

### Passo 4: Configurar Vercel com URL do Backend
1. Na página do seu projeto no Vercel
2. Vá em Settings → Environment Variables
3. Adicione:
   - **Nome**: `VITE_API_URL`
   - **Valor**: `https://seu-projeto.railway.app/api`

### Passo 5: Atualizar Frontend
Adicione ao seu `index.html` ou `script.js`:
```javascript
window.API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

## Alternativas ao Railway
- **Render** (https://render.com) - Gratuito com limites
- **Heroku** (https://heroku.com) - Pago, mas confiável
- **Fly.io** (https://fly.io) - Novo, bom desempenho

---

**Preciso fazer isso por você?** 

Sim! Vou:
1. Configurar um arquivo `.railway.json` no projeto
2. Criar um guia para você fazer deploy em Railway/Render
3. Atualizar o `vercel.json` para usar a variável de ambiente corretamente
