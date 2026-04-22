# 📚 Biblioteca Acadêmica - Sistema de Gerenciamento

Sistema completo de biblioteca acadêmica com autenticação, gerenciamento de usuários e funcionalidades administrativas.

## 🎯 Características

- ✅ Autenticação segura com JWT
- ✅ Validação de dados com Zod
- ✅ Rate limiting para proteção contra ataques
- ✅ Logging estruturado
- ✅ Health check endpoint
- ✅ API RESTful documentada
- ✅ Frontend responsivo com React + Tailwind CSS
- ✅ Suporte a Docker e Docker Compose
- ✅ Pronto para produção

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Zod** - Validação de dados
- **Winston** - Logging
- **Express Rate Limit** - Proteção contra ataques
- **bcrypt** - Hash de senhas

### Frontend
- **React 19** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Lucide React** - Ícones
- **Axios** - Cliente HTTP
- **JWT Decode** - Decodificação de tokens

## 📋 Pré-requisitos

- Node.js 20+
- Docker e Docker Compose (para deployment em container)
- PostgreSQL 16+ (ou use Docker)
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd ProjectLibrary
```

### 2. Configurar variáveis de ambiente

#### Backend (.env)
```bash
cp server/.env.example server/.env
```

Editar `server/.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/project_library"
JWT_SECRET="sua-chave-super-secreta-minimo-32-caracteres"
PORT=3333
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

#### Frontend (.env.local)
```bash
cp client/.env.example client/.env.local
```

Editar `client/.env.local`:
```env
VITE_API_URL="http://localhost:3333"
VITE_APP_NAME="Biblioteca Acadêmica"
```

### 3. Instalação de dependências

#### Backend
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
cd ..
```

#### Frontend
```bash
cd client
npm install
cd ..
```

## 🏃 Executar em Desenvolvimento

### Opção 1: Separadamente

Terminal 1 - Backend:
```bash
cd server
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

### Opção 2: Docker Compose

```bash
docker-compose up -d
```

Acessar:
- Frontend: http://localhost:5173
- API: http://localhost:3333
- Health check: http://localhost:3333/health

## 📦 Build para Produção

### Backend

```bash
cd server
npm install --production
```

### Frontend

```bash
cd client
npm run build
```

## 🐳 Deployment com Docker

### Build das imagens

```bash
docker build -t project-library-server ./server
docker build -t project-library-client ./client
```

### Executar com Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

### Variáveis de produção (.env)

```env
DATABASE_URL="postgresql://usuario:senha@seu-db-host:5432/project_library"
JWT_SECRET="gere-uma-chave-segura-aleatorios-e-longa"
PORT=3333
NODE_ENV="production"
CORS_ORIGIN="https://seudominio.com"
```

## 🔐 Segurança

- ✅ Rate limiting em rotas de login (5 tentativas a cada 15 minutos)
- ✅ Senha com hash bcrypt
- ✅ JWT com expiração de 7 dias
- ✅ Validação de dados com Zod
- ✅ Headers CORS configuráveis
- ✅ Middleware de autenticação em rotas protegidas
- ✅ Tratamento de erros seguro em produção

## 📚 Rotas da API

### Autenticação
- `POST /login` - Fazer login
- `POST /cadastro` - Registrar novo usuário

### Health
- `GET /health` - Verificar saúde da API
- `GET /` - Info da API

## 🛡️ Middlewares

### Auth Middleware
Protege rotas que requerem autenticação:
```javascript
import { authMiddleware } from './src/middlewares/auth.middleware.js'

router.get('/rota-protegida', authMiddleware, controller)
```

### Rate Limiting
- `loginLimiter` - 5 tentativas a cada 15 minutos
- `generalLimiter` - 100 requisições a cada 15 minutos
- `strictLimiter` - 1000 requisições por hora

## 📊 Estrutura de Pastas

```
ProjectLibrary/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Context API (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Páginas
│   │   ├── services/      # Serviços (API)
│   │   └── styles/        # Estilos globais
│   └── package.json
├── server/                # Backend Node/Express
│   ├── src/
│   │   ├── config/        # Configurações
│   │   ├── controllers/   # Controladores
│   │   ├── middlewares/   # Middlewares
│   │   ├── routes/        # Rotas
│   │   ├── schemas/       # Schemas Zod
│   │   ├── service/       # Serviços
│   │   └── utils/         # Utilitários
│   ├── prisma/            # Banco de dados
│   ├── index.js           # Entrada da API
│   └── package.json
├── docker-compose.yml     # Orquestração de containers
└── .gitignore            # Git ignore
```

## 🧪 Testes

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

## 📝 Logging

Logs são salvos em `server/logs/`:
- `error.log` - Apenas erros
- `combined.log` - Todos os logs

## ⚙️ Variáveis de Ambiente

### Server

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL do banco PostgreSQL | - |
| `JWT_SECRET` | Chave para assinar JWT | - |
| `PORT` | Porta do servidor | 3333 |
| `NODE_ENV` | Ambiente (development/production) | development |
| `CORS_ORIGIN` | Origins permitidas | http://localhost:5173 |

### Client

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | URL base da API | http://localhost:3333 |
| `VITE_APP_NAME` | Nome da aplicação | Biblioteca Acadêmica |

## 🆘 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"
```bash
cd server
npx prisma generate
```

### Erro de conexão com banco de dados
Verificar se PostgreSQL está rodando:
```bash
# Com Docker
docker-compose up postgres

# Ou localmente
psql -U postgres -c "CREATE DATABASE project_library"
```

### Porta já em uso
```bash
# Alterar porta no .env ou docker-compose.yml
```

## 📄 Licença

MIT

## 👤 Autor

PhoenixDev - Sistema de Biblioteca Acadêmica

---

**Última atualização:** 22 de fevereiro de 2026
