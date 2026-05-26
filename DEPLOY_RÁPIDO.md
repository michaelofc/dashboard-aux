# ⚡ Deploy Rápido - Vercel

## 5 Passos para Fazer Deploy

### Passo 1: Confirmar as Mudanças
```bash
cd g:\Downloads\dashboard-aux
git status
```

Você deve ver:
- `backend/routes/sheet.js` (NOVO)
- `backend/server.js` (MODIFICADO)
- `script.js` (MODIFICADO)
- Possíveis novos arquivos .md (documentação)

### Passo 2: Fazer Commit
```bash
git add .
git commit -m "fix: solve CORS issue by adding Google Sheets CSV proxy

- Created backend/routes/sheet.js with proxy endpoint
- Updated script.js to use proxy for all sheet fetches
- Fixes dashboard not loading sheets on Vercel
- Works in localhost and production"
```

### Passo 3: Push para GitHub
```bash
git push
```

### Passo 4: Aguardar Deploy Automático
- Vercel verá o push
- Automaticamente fará build e deploy
- Levará ~1-2 minutos
- Verifique na dashboard da Vercel

### Passo 5: Testar
```
1. Abra https://seu-dominio.vercel.app/index.html
2. Cole a URL de uma planilha Google publicada
3. Clique em "Carregar"
4. Verifique se os dados aparecem ✅
```

## Se Algo Deu Errado

### Erro 404 em `/api/sheet/fetch-csv`
❌ **Causa:** Vercel não fez deploy da nova rota

✅ **Solução:**
```bash
# Forçar novo deploy
git commit --allow-empty -m "trigger deploy"
git push
```

### Erro "Falha ao baixar CSV"
❌ **Causa:** URL da planilha incorreta ou planilha não publicada

✅ **Solução:**
1. Abra Google Sheets
2. Clique em "Compartilhar"
3. Selecione "Publicar na web"
4. Copie a URL exata
5. Cola no dashboard

### Erro na Seção de Network (F12)
❌ **Solução 1:** Limpar cache do navegador
```
F12 → Application → Local Storage → apague "sheetUrl"
Recarregue a página
```

❌ **Solução 2:** Verificar se backend está ativo
```bash
# Em desenvolvimento
npm run dev

# A rota deve estar em http://localhost:5000/api/sheet/fetch-csv
```

## Checklist de Verificação

Antes de considerar pronto:

- [ ] Git push realizado com sucesso
- [ ] Vercel fez novo deploy (verifique na dashboard)
- [ ] Acessou https://seu-dominio.vercel.app/index.html
- [ ] Planilha está publicada na web
- [ ] Copiou URL da planilha publicada
- [ ] Colou URL no input "Cole o link publicado"
- [ ] Clicou em "Carregar"
- [ ] Dados aparecem corretamente ✅

## URLs de Teste

Se quiser testar com uma planilha de exemplo:

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3ToD7PGSzSsse2PknRNR1vBzirmngf3g1nbWz9XFGP1_1viVrs0m95zGfS1PiyG2WSKTIIS1xOVHS/pub?output=csv
```

(Use qualquer URL de planilha publicada do seu projeto)

## Comandos Úteis

```bash
# Ver status do git
git status

# Ver histórico de commits
git log --oneline -5

# Desfazer último commit (se necessário)
git reset --soft HEAD~1

# Ver se há mudanças não commitadas
git diff

# Verificar branches
git branch -a
```

## Dúvidas Frequentes

**P: Quanto tempo leva para Vercel fazer deploy?**  
R: Geralmente 1-2 minutos. Verifique a dashboard da Vercel.

**P: Preciso fazer algo no backend da Vercel?**  
R: Não! Vercel detecta automaticamente mudanças e faz rebuild.

**P: Posso testar localmente antes?**  
R: Sim! Use `npm run dev` na pasta backend.

**P: A planilha precisa ser compartilhada publicamente?**  
R: Sim, precisa ser publicada com "Publicar na web".

**P: Posso usar a mesma solução para outras planilhas?**  
R: Sim! A rota proxy funciona com qualquer Google Sheets publicado.

---

✅ **Pronto para fazer deploy!**
