# 🚀 Backend - Dashboard de Inadimplência

API segura com autenticação JWT para o Dashboard de Inadimplência.

## 📋 Stack Tecnológico

- **Node.js 18+**
- **Express.js** - Framework web
- **SQLite** - Banco de dados (desenvolvimento)
- **PostgreSQL** - Banco de dados (produção)
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Helmet** - Headers de segurança
- **Express Rate Limit** - Proteção contra brute-force

## 🔧 Instalação

### 1. Clone e instale dependências

```bash
cd backend
npm install
```

### 2. Configure variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com seus dados
# Para desenvolvimento, deixe como SQLite
# Para produção, configure PostgreSQL
```

### 3. Populate banco de dados

```bash
npm run seed
```

Isso criará:
- ✅ Usuário admin: `admin@dashboard.com` / `Admin@123456`
- ✅ Usuário manager: `manager@dashboard.com` / `Manager@12345`
- ✅ Dados de teste de inadimplência

### 4. Inicie o servidor

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

Servidor rodando em: `http://localhost:5000`

---

## 🔐 Autenticação

### Fluxo JWT

1. **Registro**
   ```bash
   POST /api/auth/register
   Content-Type: application/json

   {
     "email": "usuario@example.com",
     "password": "Senha@123456",
     "name": "Seu Nome"
   }
   ```

2. **Login**
   ```bash
   POST /api/auth/login
   Content-Type: application/json

   {
     "email": "usuario@example.com",
     "password": "Senha@123456"
   }
   ```

   **Response:**
   ```json
   {
     "message": "Login realizado com sucesso",
     "user": {
       "id": 1,
       "email": "usuario@example.com",
       "name": "Seu Nome",
       "role": "user"
     },
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "expiresIn": "7d"
   }
   ```

3. **Usar Token em Requisições**
   ```bash
   GET /api/dashboard/data
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 📚 Endpoints da API

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Criar novo usuário | ❌ |
| POST | `/api/auth/login` | Fazer login | ❌ |
| POST | `/api/auth/refresh` | Renovar token | ✅ |
| GET | `/api/auth/me` | Dados do usuário | ✅ |

### Dashboard

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/api/dashboard/data` | Obter dados com filtros | ✅ | user+ |
| GET | `/api/dashboard/periods` | Listar períodos | ✅ | user+ |
| GET | `/api/dashboard/teams` | Listar equipes | ✅ | user+ |
| GET | `/api/dashboard/sellers` | Listar vendedores | ✅ | user+ |
| GET | `/api/dashboard/ranking` | Ranking de filiais | ✅ | user+ |
| POST | `/api/dashboard/data` | Importar dados | ✅ | admin, manager |

### Usuários

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/api/users` | Listar usuários | ✅ | admin |
| GET | `/api/users/:id` | Obter usuário | ✅ | owner, admin |
| PUT | `/api/users/:id` | Atualizar usuário | ✅ | owner, admin |
| PUT | `/api/users/:id/password` | Mudar senha | ✅ | owner, admin |
| PUT | `/api/users/:id/role` | Atualizar role | ✅ | admin |
| DELETE | `/api/users/:id` | Deletar usuário | ✅ | admin |

---

## 🔍 Exemplos de Requisições

### 1. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dashboard.com",
    "password": "Admin@123456"
  }'
```

### 2. Obter dados de inadimplência

```bash
curl -X GET "http://localhost:5000/api/dashboard/data?periodo=202505&equipe=Equipe%201" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Obter ranking

```bash
curl -X GET "http://localhost:5000/api/dashboard/ranking?periodo=202505" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Importar dados (manager/admin)

```bash
curl -X POST http://localhost:5000/api/dashboard/data \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "periodo": "202505",
        "filial": "Filial C",
        "equipe": "Equipe 3",
        "vendedor": "Pedro Silva",
        "status": "ATRASADO",
        "valor_inad": 1500,
        "dias_atraso": 10
      }
    ]
  }'
```

---

## 🛡️ Segurança

### Implementado

✅ **JWT Authentication** - Tokens seguros com expiração
✅ **Password Hashing** - bcrypt com salt rounds
✅ **Rate Limiting** - Proteção contra brute-force
✅ **CORS** - Controle de origem
✅ **Helmet** - Headers de segurança HTTP
✅ **Input Validation** - Validação e sanitização
✅ **SQL Injection Prevention** - Prepared statements
✅ **Authorization** - Controle de acesso por role

### Recomendações para Produção

```javascript
// 1. Use variáveis de ambiente seguras
// 2. Implemente HTTPS/TLS
// 3. Use PostgreSQL com backups automáticos
// 4. Configure firewall/WAF
// 5. Implemente logging centralizado
// 6. Use chaves de API para integração com Google Sheets
// 7. Configure alertas de segurança
```

---

## 📊 Estrutura de Diretórios

```
backend/
├── server.js                 # Arquivo principal
├── package.json              # Dependências
├── .env.example              # Variáveis de ambiente
│
├── db/
│   └── connection.js         # Conexão e inicialização do BD
│
├── middleware/
│   ├── auth.js               # JWT e autenticação
│   ├── validation.js         # Validação de dados
│   └── errorHandler.js       # Tratamento de erros
│
├── routes/
│   ├── auth.js               # Rotas de autenticação
│   ├── dashboard.js          # Rotas de dados
│   └── users.js              # Rotas de usuários
│
└── scripts/
    └── seed.js               # Popular BD com dados de teste
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'dotenv'"

```bash
npm install
```

### Erro: "EADDRINUSE: address already in use :::5000"

```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Erro: "Database locked"

SQLite tem limitação de concorrência. Para produção, use PostgreSQL.

```bash
# Em .env, mude para PostgreSQL
DB_TYPE=postgres
DB_HOST=seu_host
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=dashboard_inadimplencia
```

---

## 📞 Suporte

Para questões sobre a API:
1. Verifique se todas as dependências estão instaladas
2. Valide suas variáveis de ambiente
3. Consulte os logs do servidor
4. Teste com Postman ou curl

---

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para maximizar a segurança e performance**
