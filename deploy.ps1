# Script para fazer deploy com cache busting na Vercel
# Execute este arquivo no PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Deploy com Cache Busting - Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ir para diretório do projeto
Set-Location -Path $PSScriptRoot

Write-Host "[1/4] Verificando status do Git..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "[2/4] Adicionando todas as mudanças..." -ForegroundColor Yellow
git add .
Write-Host "✅ Mudanças adicionadas" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Fazendo commit com cache busting..." -ForegroundColor Yellow
git commit -m "fix: force cache bust and redeploy on Vercel

- Updated vercel.json with aggressive no-cache for HTML
- Cache busting: v=3 for all resources  
- No-cache headers for HTML files
- Deployment version tracking
- Forces complete rebuild on Vercel

This resolves CSP issues and ensures latest code is deployed."

Write-Host "✅ Commit realizado" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Enviando para Vercel..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DEPLOY INICIADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Próximas ações:" -ForegroundColor Cyan
Write-Host "1. Aguarde ~2-3 minutos"
Write-Host "2. Verifique em: https://vercel.com/dashboard"
Write-Host "3. Quando status for ✅ Ready:"
Write-Host "   - Abra: https://seu-dominio.vercel.app/index.html"
Write-Host "   - Faça Hard Refresh: Ctrl+Shift+R (ou Cmd+Shift+R no Mac)"
Write-Host "4. Teste carregando uma planilha"
Write-Host ""
Write-Host "Para debug:" -ForegroundColor Yellow
Write-Host "- F12 → Console → procure '📊 Carregando planilha...'"
Write-Host "- Deve ver '✅ Planilha carregada com sucesso'"
Write-Host "- Não deve ver nenhum erro de CSP"
Write-Host ""

Read-Host "Pressione Enter para sair"
