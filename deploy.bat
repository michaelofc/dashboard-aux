@echo off
REM Script para fazer deploy com cache busting na Vercel
REM Execute este arquivo: deploy.bat

echo ========================================
echo 🚀 Deploy com Cache Busting - Vercel
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando status do Git...
git status
echo.

echo [2/4] Adicionando todas as mudanças...
git add .
echo ✅ Mudanças adicionadas

echo.
echo [3/4] Fazendo commit com cache busting...
git commit -m "fix: force cache bust and redeploy on Vercel

- Updated vercel.json with aggressive no-cache for HTML
- Cache busting: v=3 for all resources
- No-cache headers for HTML files
- Deployment version tracking
- Forces complete rebuild on Vercel

This resolves CSP issues and ensures latest code is deployed."

echo ✅ Commit realizado

echo.
echo [4/4] Enviando para Vercel...
git push

echo.
echo ========================================
echo ✅ DEPLOY INICIADO!
echo ========================================
echo.
echo 📊 Próximas ações:
echo 1. Aguarde ~2-3 minutos
echo 2. Verifique em: https://vercel.com/dashboard
echo 3. Quando status for ✅ Ready:
echo    - Abra: https://seu-dominio.vercel.app/index.html
echo    - Faça Hard Refresh: Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
echo 4. Teste carregando uma planilha
echo.
echo Para debug:
echo - F12 → Console → procure "📊 Carregando planilha..."
echo - Deve ver "✅ Planilha carregada com sucesso"
echo.
pause
