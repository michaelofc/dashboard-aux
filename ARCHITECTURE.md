# 🏗️ Arquitetura - Backend + Frontend

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAVEGADOR DO USUÁRIO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              frontend/ (Cliente)                           │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ auth.js                                              │ │ │
│  │  │ - renderLogin()                                      │ │ │
│  │  │ - renderRegister()                                   │ │ │
│  │  │ - handleLogin()                                      │ │ │
│  │  │ - handleRegister()                                   │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           │                                │ │
│  │                           ▼                                │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ api/client.js                                        │ │ │
│  │  │ - login()                                            │ │ │
│  │  │ - register()                                         │ │ │
│  │  │ - getDashboardData()                                 │ │ │
│  │  │ - getUsers()                                         │ │ │
│  │  │ - request() [HTTP genérico]                          │ │ │
│  │  │ - setToken() [localStorage]                          │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           │                                │ │
│  └───────────────────────────┼────────────────────────────────┘ │
│                              │                                  │
│                    HTTP + JWT Token                             │
│  ┌───────────────────────────┼────────────────────────────────┐ │
│  │                           ▼                                │ │
│  │              INTERNET / rede local                         │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    SERVIDOR NODE.JS                             │
│                  (localhost:5000)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ server.js                                                  │ │
│  │ - express app                                              │ │
│  │ - cors, helmet, rate-limit                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                     │
│        ┌──────────────────┼──────────────────┐                  │
│        │                  │                  │                  │
│        ▼                  ▼                  ▼                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐          │
│  │ routes/     │  │ middleware/  │  │ db/         │          │
│  │ auth.js     │  │ auth.js      │  │ connection  │          │
│  │ dashboard.js│  │ validation.js│  │ .js         │          │
│  │ users.js    │  │ errorHandler │  └─────────────┘          │
│  │             │  │ .js          │         │                  │
│  │ ✅ POST     │  │              │         ▼                  │
│  │ /register   │  │ ✅ verify    │   ┌──────────┐            │
│  │ /login      │  │ ✅ validate  │   │ sqlite.db│            │
│  │ /refresh    │  │ ✅ authorize │   │ ou       │            │
│  │             │  │ ✅ error     │   │ postgres │            │
│  │ ✅ GET      │  │ handling     │   └──────────┘            │
│  │ /data       │  │              │                            │
│  │ /periods    │  │              │ Tabelas:                  │
│  │ /teams      │  │              │ - users                   │
│  │ /ranking    │  │              │ - inadimplencia           │
│  │             │  │              │ - goals                   │
│  │ ✅ POST     │  │              │ - achievements            │
│  │ /data       │  │              │ - audit_logs              │
│  │ (import)    │  │              │                            │
│  │             │  │              │                            │
│  │ ✅ GET/PUT  │  │              │                            │
│  │ /users/:id  │  │              │                            │
│  └─────────────┘  └──────────────┘  └─────────────┘          │
│        │                                    │                  │
│        └────────────────┬───────────────────┘                  │
│                         │                                      │
│                    JSON + JWT                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Fluxo de Autenticação

```
┌───────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO ACESSA LOGIN.HTML                                  │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│ 2. frontend/auth.js renderiza formulário                      │
│    - email input                                              │
│    - password input                                           │
│    - botão "Entrar"                                           │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│ 3. USUÁRIO ENTRA CREDENCIAIS E CLICA "ENTRAR"                 │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│ 4. frontend/api/client.js.login()                             │
│    POST /api/auth/login                                       │
│    {                                                          │
│      "email": "admin@dashboard.com",                          │
│      "password": "Admin@123456"                               │
│    }                                                          │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│ 5. backend/routes/auth.js (POST /login)                       │
│    - valida email e senha                                     │
│    - busca usuário no BD                                      │
│    - compara hash de senha com bcrypt                         │
└───────────────────────────────────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
          ✅ Válido │           │ ❌ Inválido
                    ▼           ▼
         ┌────────────────┐  ┌──────────────┐
         │ 6. Gera JWT    │  │ 6. Retorna   │
         │    token       │  │ erro 401     │
         │ com expiração  │  └──────────────┘
         │ de 7 dias      │        │
         └────────────────┘        ▼
              │              ┌──────────────────┐
              │              │ Mostra mensagem  │
              │              │ de erro no login │
              │              └──────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────────┐
│ 7. Response (sucesso)                                         │
│    {                                                          │
│      "token": "eyJhbGci...",                                  │
│      "user": {                                                │
│        "id": 1,                                               │
│        "email": "admin@dashboard.com",                        │
│        "role": "admin"                                        │
│      }                                                        │
│    }                                                          │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│ 8. frontend/api/client.js armazena token                      │
│    localStorage.setItem('authToken', token)                   │
│    localStorage.setItem('user', userData)                     │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│ 9. Redirecionar para dashboard (index.html)                   │
│    window.location.href = '/'                                 │
└───────────────────────────────────────────────────────────────┘
```

---

## 📊 Fluxo de Requisição com Autenticação

```
┌────────────────────────────────────────────────┐
│ Dashboard carrega                              │
│ Precisa de dados                               │
└────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────┐
│ frontend/api/client.getDashboardData()         │
│ this.get('/dashboard/data?periodo=202505')     │
└────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────┐
│ this.request() método genérico                 │
│ Pega token do this.token                       │
│ Adiciona no header:                            │
│ Authorization: Bearer eyJhbGci...              │
└────────────────────────────────────────────────┘
              │
              ▼ (HTTP GET)
┌────────────────────────────────────────────────┐
│ Servidor recebe em:                            │
│ GET /api/dashboard/data?periodo=202505         │
│ Header: Authorization: Bearer eyJhbGci...      │
└────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────┐
│ middleware/auth.js (authenticateToken)         │
│ - extrai token do header                       │
│ - verifica assinatura                          │
│ - verifica expiração                           │
│ - decodifica JWT                               │
└────────────────────────────────────────────────┘
              │
        ┌─────┴─────┐
        │           │
    ✅ OK   │           │ ❌ Inválido/Expirado
        ▼           ▼
   Continua   Retorna 403
        │     (Forbidden)
        ▼
┌────────────────────────────────────────────────┐
│ req.user = { id: 1, email: ..., role: ... }    │
│ Passa para próxima rota                        │
└────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────┐
│ routes/dashboard.js GET /data                  │
│ - recebe req.user                              │
│ - valida query params                          │
│ - busca dados no BD                            │
│ - retorna JSON                                 │
└────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────┐
│ Response (JSON)                                │
│ {                                              │
│   "data": [...],                               │
│   "stats": {...}                               │
│ }                                              │
└────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────┐
│ frontend/api/client.js resolve(data)           │
│ Dashboard renderiza gráficos                   │
└────────────────────────────────────────────────┘
```

---

## 🗄️ Modelo de Banco de Dados

```
┌─────────────────────────────────────────┐
│ users                                   │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ email (UNIQUE)                          │
│ password (hash bcrypt)                  │
│ name                                    │
│ role (admin|manager|user)               │
│ status (active|inactive)                │
│ team                                    │
│ created_at, updated_at                  │
└─────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────┐
│ goals                                   │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ user_id (FK)                            │
│ tipo, meta, alcancado                   │
│ periodo, status                         │
└─────────────────────────────────────────┘


┌─────────────────────────────────────────┐
│ inadimplencia                           │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ periodo (YYYY-MM)                       │
│ filial                                  │
│ equipe                                  │
│ vendedor                                │
│ status (ATRASADO|CANCELADO)             │
│ valor_inad                              │
│ data_vencimento                         │
│ dias_atraso                             │
│ created_at, updated_at                  │
└─────────────────────────────────────────┘


┌─────────────────────────────────────────┐
│ achievements                            │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ user_id (FK)                            │
│ badge, pontos, descricao                │
│ data_conquista                          │
└─────────────────────────────────────────┘
           │
           │ belongs to
           ▼
    (veja users acima)


┌─────────────────────────────────────────┐
│ audit_logs                              │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ user_id (FK)                            │
│ acao (INSERT|UPDATE|DELETE|LOGIN)       │
│ tabela, registro_id                     │
│ dados_anteriores, dados_novos           │
│ ip_address                              │
│ created_at                              │
└─────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida de uma Requisição

```
Request chega →  Express middleware →  Rotas  →  BD  →  Response
   │               ▼                    ▼         ▼       ▼
   │          1. CORS                 1. Auth  1. Query 1. JSON
   │          2. Helmet               2. Valid 2. Join  2. Status
   │          3. Rate Limit           3. Error 3. Filter 3. Cache
   │          4. Body Parser
   │          5. Custom middleware
   │
   └→ HTTP request com headers e body
```

---

## 📱 Client State Management

```
┌──────────────────────────────────────────┐
│ frontend/api/client.js (Singleton)       │
├──────────────────────────────────────────┤
│                                          │
│ instance.token ←→ localStorage           │
│ instance.user  ←→ localStorage           │
│                                          │
│ Methods:                                 │
│ - login(email, password)                 │
│ - logout()                               │
│ - isAuthenticated()                      │
│ - request(endpoint, options)             │
│ - getDashboardData(filters)              │
│ - getUsers()                             │
│ - updateUser(id, data)                   │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔒 Camadas de Segurança

```
1. CLIENTE
   └─ Input validation (frontend/auth.js)

2. REDE
   └─ HTTPS/TLS

3. SERVIDOR
   ├─ CORS (origin whitelist)
   ├─ Rate Limiting (100 req/15min)
   ├─ Helmet (headers)
   └─ JWT verification

4. APLICAÇÃO
   ├─ Input validation (validation.js)
   ├─ Sanitização (mongo-sanitize)
   ├─ Role-based access control
   └─ Error handling

5. BANCO DE DADOS
   ├─ Prepared statements
   ├─ Password hashing (bcrypt)
   └─ Audit logs
```

---

**Arquitetura pronta para produção! 🚀**
