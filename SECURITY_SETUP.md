Implantacao inicial do modo seguro por filial

Objetivo
- Remover dependencia do link colado no navegador para acesso por filial.
- Isolar dados por sessao autenticada da filial.

O que foi implementado
- Endpoints de autenticacao:
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET /api/auth/me
- Endpoint de dados por sessao:
  - GET /api/data?kind=main
  - GET /api/data?kind=aux
- Sessao com cookie HttpOnly, Secure e SameSite=Strict.
- Mapeamento filial -> chave e filial -> fonte CSV via variaveis de ambiente.

Variaveis de ambiente na Vercel
1) DASH_SESSION_SECRET
- Segredo longo e aleatorio para assinar sessao.
- Exemplo: 64+ caracteres.

2) DASH_FILIAL_KEYS_JSON
- JSON com chave de acesso por filial.
- Exemplo:
{
  "santo-andre": "CHAVE_SA_2026",
  "guarulhos": "CHAVE_GUA_2026"
}

3) DASH_FILIAL_SOURCES_JSON
- JSON com URL publicada CSV por filial.
- Exemplo:
{
  "santo-andre": "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv",
  "guarulhos": "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
}

Fluxo de uso
1. Usuario abre dashboard.
2. Informa chave da filial em Entrar (modo seguro).
3. Front chama /api/auth/login.
4. Backend valida chave, cria sessao e define cookie.
5. Front busca dados em /api/data.
6. Backend usa filial da sessao para retornar somente dados daquela filial.

Importante
- Esta fase ainda usa links publicados do Google Sheets no backend.
- Proxima fase recomendada: Google Sheets API com service account e planilhas privadas (sem publicacao na web).

Proxima fase (recomendada)
- Trocar DASH_FILIAL_SOURCES_JSON para guardar apenas spreadsheetId/ranges.
- Backend ler via Google API autenticada por conta tecnica.
- Remover completamente necessidade de planilha publicada.
