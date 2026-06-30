# Sistema da Biblioteca

Sistema web para gerenciamento de biblioteca escolar/acadêmica, com catálogo digital, reservas, empréstimos, leitores, notificações, dúvidas e configurações administrativas.

O projeto é dividido em duas aplicações independentes:

- `client/`: front-end em React, responsável pela interface do usuário.
- `server/`: back-end em Node.js/Express, responsável pela API, autenticação, regras de negócio e banco de dados.

## Visão Geral

ProjectLibrey foi criado para substituir controles manuais de biblioteca por um fluxo digital mais rastreável. A aplicação permite que alunos e professores consultem livros, solicitem reservas e acompanhem prazos, enquanto bibliotecários administram acervo, leitores, reservas, empréstimos e configurações.

## Principais Funcionalidades

### Usuários

- Cadastro e login com autenticação JWT.
- Perfis de acesso para aluno, professor, bibliotecária e administrador.
- Atualização de dados de perfil.
- Recuperação de senha por e-mail.

### Catálogo

- Listagem de livros do acervo.
- Busca por título, autor e área.
- Exibição de capas por busca externa quando o livro não possui imagem cadastrada.
- Favoritos para alunos.
- Detalhes do livro em modal.

### Reservas e Empréstimos

- Solicitação de reserva por alunos/professores.
- Criação de reserva para leitores pela bibliotecária.
- Aprovação e rejeição de reservas.
- Registro de retirada e devolução.
- Controle de prazos e atrasos.

### Administração

- Cadastro e edição de livros.
- Cadastro e edição de leitores.
- Controle de status de usuários.
- Configurações da biblioteca.
- Central de dúvidas.
- Notificações internas.

## Stack Técnica

### Front-end

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

Documentação específica: [client/README.md](client/README.md)

### Back-end

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod
- Nodemailer
- Winston

Documentação específica: [server/README.md](server/README.md)

## Estrutura do Projeto

```txt
ProjectLibrey/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── styles/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── lib/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── cronjobs/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── service/
│   │   └── utils/
│   ├── index.js
│   └── package.json
│
├── Livros.csv
├── docker-compose.yml
└── README.md
```

## Pré-requisitos

- Node.js 20 ou superior
- npm
- PostgreSQL
- Git

Docker Compose existe no repositório, mas os Dockerfiles de `client/` e `server/` não estão presentes atualmente. Para desenvolvimento, use a execução local descrita abaixo.

## Configuração Rápida

### 1. Instalar dependências do back-end

```bash
cd server
npm install
```

### 2. Configurar ambiente do back-end

```bash
cp .env.example .env
```

Edite `server/.env`:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://usuario:senha@localhost:5432/project_librey
JWT_SECRET=sua-chave-secreta
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### 3. Preparar banco de dados

```bash
npx prisma generate
npx prisma migrate dev
```

Opcionalmente, importe livros do CSV:

```bash
npm run prisma:seed
```

### 4. Instalar dependências do front-end

```bash
cd ../client
npm install
```

Crie `client/.env.local` se precisar apontar para outra URL de API:

```env
VITE_API_URL=http://localhost:3333
```

## Execução em Desenvolvimento

Abra dois terminais.

Terminal 1:

```bash
cd server
npm run start:dev
```

Terminal 2:

```bash
cd client
npm run dev
```

URLs padrão:

| Serviço | URL |
|---|---|
| Front-end | `http://localhost:5173` |
| API | `http://localhost:3333` |
| Health check | `http://localhost:3333/health` |

## Scripts Principais

### Front-end

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o Vite em modo desenvolvimento |
| `npm run build` | Gera build de produção em `client/dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | Executa ESLint |

### Back-end

| Comando | Descrição |
|---|---|
| `npm run start:dev` | Inicia a API com Nodemon |
| `npm start` | Inicia a API com Node |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | Executa migrations em desenvolvimento |
| `npm run prisma:seed` | Importa dados do seed |

## Rotas Principais da API

| Grupo | Rotas |
|---|---|
| Autenticação | `/login`, `/cadastro`, `/me` |
| Recuperação de senha | `/password-reset` |
| Livros | `/livros` |
| Exemplares | `/exemplares` |
| Reservas | `/reservas` |
| Usuários | `/usuarios` |
| Notificações | `/notificacoes` |
| Dúvidas | `/duvidas` |
| Configurações | `/configuracoes` |
| Eventos | `/eventos` |

Rotas protegidas exigem:

```txt
Authorization: Bearer <token>
```

## Segurança

- Senhas criptografadas com bcrypt.
- Autenticação via JWT.
- Rate limiting em rotas sensíveis.
- CORS configurável por ambiente.
- Validação de entradas com schemas.
- Recuperação de senha com token de uso único.

## Observações de Desenvolvimento

- O front-end consome a URL definida em `VITE_API_URL`.
- O back-end libera origins definidas em `CORS_ORIGIN`.
- As capas do catálogo são buscadas por título/autor em serviços externos e armazenadas em cache local do navegador.
- Logs do back-end ficam em `server/logs/`.
- As migrations ficam em `server/prisma/migrations/`.

## Solução de Problemas

### Porta 5173 em uso

Finalize o processo Vite antigo ou rode em outra porta:

```bash
cd client
npm run dev -- --port 5174
```

### Porta 3333 em uso

Altere `PORT` em `server/.env`.

### Prisma Client ausente

```bash
cd server
npm run prisma:generate
```

### Erro de conexão com PostgreSQL

Verifique se o banco está rodando e se `DATABASE_URL` está correta.

## Status

Projeto em desenvolvimento ativo. As principais áreas do sistema já estão implementadas, com refinamentos de interface, organização e estabilidade em andamento.

## Autor

Desenvolvido por PhoenixDev.
