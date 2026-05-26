# 🔐 Solução: Content Security Policy (CSP) Error

## 🚨 O Erro

```
Connecting to 'https://cdn.jsdelivr.net/...' violates the following 
Content Security Policy directive: "connect-src 'self'". 
The request has been blocked.
```

Também:
```
Connecting to 'https://docs.google.com/spreadsheets/...' violates CSP.
```

---

## ❓ O Que é CSP?

**Content Security Policy (CSP)** é uma camada de segurança que define:
- De onde o navegador pode fazer requisições
- Quais scripts podem executar
- Quais fontes podem carregar

A Vercel configura um CSP restritivo por padrão.

---

## ✅ Solução Aplicada

### 1️⃣ Atualizar `vercel.json`
Permiti conexões para CDNs e Google Sheets:

**Antes:**
```
connect-src 'self'
```

**Depois:**
```
connect-src 'self' https://cdn.jsdelivr.net https://docs.google.com
```

### 2️⃣ Cache Busting
Adicionei `?v=2` nos scripts para forçar recarregamento:

```html
<script src="script.js?v=2"></script>
<script src="login.js?v=2"></script>
<script src="gamification.js?v=2"></script>
```

### 3️⃣ Melhor Tratamento de Erros
Adicionei mensagens descritivas quando algo falha:

```javascript
console.log('📊 Carregando planilha via proxy:', proxyUrl);
console.log('✅ Planilha carregada com sucesso');
console.error('❌ Erro ao carregar dados:', e);
```

---

## 🧹 Como Limpar Cache Completamente

### Opção 1: Developer Tools (F12)
```
1. Abra F12 (Developer Tools)
2. Vá em "Application" ou "Storage"
3. Clique em "Clear site data"
4. Selecione:
   ✅ Cookies
   ✅ Cache storage
   ✅ Local storage
5. Clique em "Clear"
6. Recarregue a página (Ctrl+Shift+R)
```

### Opção 2: Hard Refresh
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Opção 3: Modo Incógnito
```
1. Abra nova aba em Modo Incógnito/Privado
2. Cole a URL do dashboard
3. Teste novamente
```

### Opção 4: Service Worker
Se tiver um Service Worker cacheando:
```
F12 → Application → Service Workers
→ Clique "Unregister"
```

---

## 🔍 Como Verificar se Funcionou

1. **Abra F12 (DevTools)**
2. **Vá em Console**
3. **Procure por:**
   ```
   ✅ Viu "📊 Carregando planilha via proxy: ..."?
   ✅ Viu "✅ Planilha carregada com sucesso"?
   ```

4. **Verifique Network:**
   - F12 → Network
   - Procure por `/api/sheet/fetch-csv`
   - Status deve ser 200 ✅
   - Resposta deve ser CSV

---

## 🐛 Se Ainda Não Funcionar

### Erro 1: "CSP violation still happening"
**Causa:** CSP não foi atualizado na Vercel

**Solução:**
```bash
# Force redeploy
git commit --allow-empty -m "force CSP update"
git push
# Aguarde 2-3 minutos
```

### Erro 2: "/api/sheet/fetch-csv not found"
**Causa:** Backend não fez deploy

**Solução:**
```bash
# Verifique se backend/routes/sheet.js existe
ls backend/routes/sheet.js

# Force redeploy
git commit --allow-empty -m "trigger backend deploy"
git push
```

### Erro 3: "Timeout na requisição"
**Causa:** Planilha muito grande ou conexão lenta

**Solução:**
- Aguarde até 30 segundos
- Tente outra planilha menor
- Verifique sua conexão

### Erro 4: "Planilha não está publicada"
**Solução:**
1. Abra Google Sheets
2. Clique em "Compartilhar"
3. Clique em "Publicar na web"
4. Copie a URL exata
5. Cole no dashboard

---

## 📋 Arquivo Modificado

| Arquivo | Mudança |
|---------|---------|
| `vercel.json` | Atualizado CSP para permitir CDNs |
| `index.html` | Adicionado `?v=2` nos scripts |
| `login.html` | Adicionado `?v=2` nos scripts |
| `script.js` | Adicionados console.logs e melhor tratamento de erro |

---

## 🚀 Deploy

```bash
git add .
git commit -m "fix: CSP violations and add cache busting

- Updated vercel.json CSP to allow cdn.jsdelivr.net
- Added cache busting (?v=2) to all script imports
- Improved error handling with descriptive messages
- Added debug console logs for proxy usage"
git push
# Aguarde deploy (1-2 minutos)
```

---

## ✨ O Que Mudou

### Antes ❌
```
CSP bloqueava: cdn.jsdelivr.net
CSP bloqueava: docs.google.com
Scripts cacheados
Erro genérico sem contexto
```

### Depois ✅
```
CSP permite: cdn.jsdelivr.net
CSP permite: docs.google.com
Cache busting com ?v=2
Erros descritivos com soluções
Console logs para debug
```

---

## 🎯 Verificação Final

Após fazer o deploy, verifique:

```
Dashboard carrega sem erro de CSP? ✅
Scripts são baixados com ?v=2? ✅
Console mostra "📊 Carregando planilha via proxy"? ✅
Dados aparecem no dashboard? ✅
Gamificação funciona? ✅
```

Se todos estiverem ✅, você está pronto!

---

## 📚 Referências

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Vercel: Headers Documentation](https://vercel.com/docs/concepts/projects/project-settings)
- [OWASP: CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---

**Versão:** 2.0  
**Data:** 26 de maio de 2026  
**Status:** ✅ Pronto para produção
