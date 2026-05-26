# 🚨 URGENTE: Limpar Cache e Fazer Deploy

## O Problema

Seu navegador/Vercel está cacheando uma versão **antiga** do `script.js` que ainda fazia fetch direto para Google Sheets.

A solução: **Limpar cache + novo deploy**

---

## 🔧 Passo 1: Hard Refresh no Navegador

Abra seu dashboard da Vercel e faça um **hard refresh**:

### Windows/Linux:
```
Ctrl + Shift + R
```

### Mac:
```
Cmd + Shift + R
```

**OU**

### Abra DevTools (F12):
```
1. F12 (Developer Tools)
2. Clique direito no ícone de recarregar
3. Selecione "Empty cache and hard refresh"
```

---

## 📤 Passo 2: Fazer Deploy com Cache Busting

Execute esses comandos:

```bash
# Ir para pasta do projeto
cd g:\Downloads\dashboard-aux

# Fazer commit com força de rebuild
git add .
git commit -m "fix: force cache bust and CSP corrections for Vercel

- Updated vercel.json with aggressive no-cache headers for HTML
- Added version control (v=3 for all resources)
- Forced no-cache for HTML files
- Added deployment version tracking
- Ensures latest script.js is loaded

This forces Vercel to rebuild and clear all caches."

# Push para Vercel
git push
```

---

## ⏳ Passo 3: Aguardar Deploy

1. Abra https://vercel.com/dashboard
2. Procure seu projeto
3. Aguarde status mudar para ✅ "Ready"
4. Isso leva ~2-3 minutos

---

## ✅ Passo 4: Testar

1. **Abra em modo incógnito/privado:**
   - Chrome/Edge: Ctrl + Shift + N
   - Firefox: Ctrl + Shift + P
   - Safari: Cmd + Shift + N

2. **Cole URL do dashboard:**
   ```
   https://seu-dominio.vercel.app/index.html
   ```

3. **Cole URL da planilha publicada:**
   - Cole URL do Google Sheets
   - Clique em "Carregar"

4. **Verifique Console (F12):**
   ```
   ✅ Deveria ver: "📊 Carregando planilha via proxy..."
   ✅ Deveria ver: "✅ Planilha carregada com sucesso"
   ❌ Não deveria ver nenhum erro de CSP
   ```

---

## 🚀 O Que Mudou

| Arquivo | Mudança |
|---------|---------|
| `vercel.json` | Adicionado regra específica `no-cache` para HTML |
| `index.html` | Atualizado para v=3, adicionado meta tags de no-cache |
| `login.html` | Atualizado para v=3, adicionado meta tags de no-cache |
| `version.js` | ✨ NOVO - arquivo de controle de versão |

---

## 🎯 Por que isso funciona:

```
ANTES (❌ com cache):
┌─────────────────────┐
│ Vercel               │
│ ├─ index.html (old)  │  ← Cache antigo
│ ├─ script.js (old)   │  ← Faz fetch direto
│ └─ CSP antigo        │
└─────────────────────┘
     └──► Erro de CSP!

DEPOIS (✅ sem cache):
┌─────────────────────┐
│ Vercel               │
│ ├─ index.html (new)  │  ← Sem cache, sempre novo
│ ├─ script.js (new)   │  ← Usa proxy /api/...
│ └─ CSP permitido     │  ← Permite Google Sheets
└─────────────────────┘
     └──► Funciona! ✅
```

---

## 💡 Se Ainda Não Funcionar

### Opção 1: Verificar Vercel
```bash
# Verifique se arquivo foi enviado
git log --oneline -3

# Verifique status do deploy
# https://vercel.com/dashboard → seu projeto → Deployments
```

### Opção 2: Verificar se Backend Está Online
```
Abra: https://seu-dominio.vercel.app/health
Resultado esperado: {"status":"OK","timestamp":"..."}
```

### Opção 3: Verificar erro no F12
```
1. F12 → Console
2. Procure por "CSP violation"
3. Se não houver erro de CSP, significa que funcionou!
```

### Opção 4: Clear Cloudflare Cache
Se usar Cloudflare entre Vercel:
```
Cloudflare Dashboard → Caching → Purge Everything
```

---

## 📝 Checklist Final

- [ ] Fiz `git push` com novo commit
- [ ] Aguardei deploy na Vercel (~2-3 min)
- [ ] Fiz hard refresh (Ctrl+Shift+R)
- [ ] Abri em modo incógnito
- [ ] Cola URL da planilha
- [ ] Cliquei em "Carregar"
- [ ] Verifiquei F12 Console para "📊 Carregando..."
- [ ] Dados aparecem no dashboard ✅

Se tudo ✅, seu dashboard está funcionando!

---

**Versão:** 3.0.0  
**Data:** 26 de maio de 2026  
**Status:** 🚀 Pronto para deploy
