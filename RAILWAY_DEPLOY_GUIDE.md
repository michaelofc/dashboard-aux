# 🚀 Deploy Backend em Railway - Guia Completo

## ⚡ Pré-requisitos
- Conta GitHub (você já tem)
- Conta Railway (grátis em https://railway.app)

---

## 📋 Passo 1: Criar conta em Railway

1. Acesse **https://railway.app**
2. Clique em **"Start a New Project"**
3. Selecione **"GitHub"** para autorizar
4. Autorize Railway acessar seus repositórios
5. Selecione o repositório **`dashboard-aux`**

---

## 🔧 Passo 2: Configurar o Projeto

Railway vai detectar automaticamente:
- **Framework**: Node.js
- **Package Manager**: npm
- **Start Command**: `npm start` (do `/backend`)

Se não detectar automáticamente:

1. Clique em **"Variables"** no painel do projeto
2. Clique em **"Add"** → **"Service Variable"**
3. Configure:
   ```
   PORT=3000
   NODE_ENV=production
   ```

---

## 🎯 Passo 3: Ajustar o Start Command

O Railway pode não saber que o backend está em `/backend/`. Para corrigir:

1. No painel do Railway, procure por **"Settings"**
2. Encontre **"Start Command"** ou **"Script"**
3. Mude para:
   ```bash
   cd backend && npm install && npm start
   ```

Ou crie um arquivo `Procfile` na raiz (vou criar para você):

```
web: cd backend && npm start
```

---

## 🌐 Passo 4: Obter a URL do Backend

Após o deploy:

1. No painel do Railway, procure pela aba **"Deployments"**
2. Copie a URL que aparece (será algo como):
   ```
   https://seu-projeto-production.up.railway.app
   ```
3. **Anote essa URL**, você vai usar no próximo passo

---

## ⚙️ Passo 5: Configurar Vercel com a URL do Backend

1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto **`dashboard-aux`**
3. Vá em **Settings** → **Environment Variables**
4. Clique em **"Add New"**
5. Configure:
   - **Name**: `BACKEND_URL`
   - **Value**: `https://seu-projeto-production.up.railway.app` (a URL do Railway)
   - **Environments**: Selecione todos (Production, Preview, Development)
6. Clique **"Save"**

Vercel vai fazer redeploy automático!

---

## ✅ Passo 6: Testar

1. Acesse sua dashboard: https://dashboard-aux.vercel.app
2. Faça login com credenciais de teste
3. Clique em **"📊 Excel"** para exportar
4. O arquivo deve baixar normalmente!

---

## 🐛 Se der erro

**Erro "503 Backend not available":**
- Verifique se BACKEND_URL está configurado na Vercel
- Confirme que o deploy do Railway terminou com sucesso
- Teste a URL do Railway diretamente no navegador

**Erro "Connection timeout":**
- Railway pode estar iniciando (primeiras requisições podem ser lentas)
- Espere 30 segundos e tente novamente

---

## 📝 Resumo dos Links

| Serviço | URL |
|---------|-----|
| **Dashboard** | https://dashboard-aux.vercel.app |
| **Railway** | https://railway.app/dashboard |
| **GitHub Repo** | https://github.com/michaelofc/dashboard-aux |

---

## 💡 Dica

Se tiver dificuldade no Railway, é por causa do `cd backend`. Posso criar um `Procfile` especial se precisar!

Quer que eu crie o `Procfile` para facilitar?
