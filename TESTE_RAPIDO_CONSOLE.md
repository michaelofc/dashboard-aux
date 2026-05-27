# 🚀 Teste Rápido: Verificar se Dashboard Está Funcionando

## Passo 1: Abrir DevTools (F12)

1. Pressione **F12** para abrir o console do navegador
2. Vá para a aba **"Console"**
3. Cole um dos comandos abaixo

---

## 🧪 Testes

### Teste 1: Verificar se localStorage tem URL
```javascript
console.log('URL da planilha:', localStorage.getItem('sheetUrl'));
```

**Esperado**: 
- `null` se nenhuma URL foi inserida
- Uma URL `https://docs.google.com/...` se foi inserida

---

### Teste 2: Verificar conversão de URL
```javascript
// Copia a função de conversão (se disponível):
const url = "https://docs.google.com/spreadsheets/d/XXXXX/edit#gid=0";
// Esperado: "https://docs.google.com/spreadsheets/d/XXXXX/pub?output=csv"
```

---

### Teste 3: Verificar dados carregados
```javascript
console.log('Dados carregados:', window.rawData?.length, 'registros');
console.log('Equipes encontradas:', window.uniqueTeams);
console.log('Meses disponíveis:', window.uniqueMonths);
```

**Esperado**:
- `Dados carregados: 50 registros` (ou quantidade de dados)
- `Equipes encontradas: ['EQUIPE A', 'EQUIPE B', ...]`
- `Meses disponíveis: ['2025-02', '2025-03', ...]`

---

### Teste 4: Verificar URL Proxy
```javascript
const baseUrl = window.location.origin;
const sheetUrl = localStorage.getItem('sheetUrl');
console.log('URL Proxy:', `${baseUrl}/api/sheet?url=` + encodeURIComponent(sheetUrl));
```

Copie a URL e teste em uma **aba nova** (deve retornar CSV)

---

### Teste 5: Forçar Reload dos Dados
```javascript
// Se loadSheetData existe (função global):
if (window.loadSheetData) {
  console.log('⏳ Recarregando dados...');
  window.loadSheetData();
} else {
  console.log('❌ Função loadSheetData não disponível');
}
```

---

## 📋 Checklist de Troubleshooting

- [ ] URL está salva em localStorage?
- [ ] URL começa com `https://docs.google.com`?
- [ ] URL tem `/pub` ou foi `/edit`?
- [ ] Dados carregam quando clicar em "Carregar"?
- [ ] Console mostra logs com 📊 e ✅?
- [ ] Algum erro HTTP no Network (F12 → Network)?

---

## 🔧 Se Nada Funcionar

1. **Recarregue a página**: Ctrl+Shift+R (hard refresh)
2. **Limpe localStorage**: 
   ```javascript
   localStorage.removeItem('sheetUrl');
   ```
3. **Tente com URL de teste**:
   - Santo André: `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3ToD7PGSzSsse2PknRNR1vBzirmngf3g1nbWz9XFGP1_1viVrs0m95zGfS1PiyG2WSKTIIS1xOVHS/pub?output=csv`

4. **Verifique backend** (se rodando localmente):
   ```bash
   curl "http://localhost:5000/api/sheet?url=URLAQUI"
   ```

---

## 💡 Dica: Ativar Modo Debug

Cole no console:
```javascript
// Ativa logs detalhados
window.DEBUG = true;
console.log('🐛 Modo debug ativado');
```

Depois recarregue os dados - verá muito mais detalhe!

