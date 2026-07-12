# ProjectLibrey Back-end

API REST do ProjectLibrey, responsável por autenticação, autorização, regras de negócio, persistência dos dados e integrações de e-mail.

## Responsabilidades

- Autenticar usuários com JWT.
- Gerenciar livros, exemplares, leitores, reservas e empréstimos.
- Controlar perfis de acesso.
- Registrar retirada e devolução de livros.
- Gerenciar notificações, dúvidas, eventos e configurações da biblioteca.
- Enviar e-mails de recuperação de senha.
- Executar verificações de prazos por cronjob.
- Persistir dados em PostgreSQL via Prisma.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Node.js | Runtime da API |
| Express | Servidor HTTP e roteamento |
| Prisma | ORM e migrations |
| PostgreSQL | Banco de dados |
| JWT | Autenticação |
| bcrypt | Hash de senha |
| Zod | Validação |
| Nodemailer | E-mails |
| Winston | Logs |
| node-cron | Rotinas agendadas |

## Estrutura

```txt
server/
├── lib/
│   └── prisma.js
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   ├── controllers/
│   ├── cronjobs/
│   ├── middlewares/
│   ├── routes/
│   ├── schemas/
│   ├── service/
│   └── utils/
├── index.js
├── package.json
└── README.md
```

## Instalação

```bash
cd server
npm install
cp .env.example .env
```

Configure `server/.env`:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://usuario:senha@localhost:5432/project_librey
JWT_SECRET=sua-chave-secreta
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

## Banco de Dados

Gerar Prisma Client:

```bash
npm run prisma:generate
```

Aplicar migrations:

```bash
npm run prisma:migrate
```

Importar dados iniciais:

```bash
npm run prisma:seed
```

O seed lê `../Livros.csv` e cria livros/exemplares conforme os dados disponíveis. Além disso, o seed cria **usuários de teste** para facilitar o desenvolvimento:

- `admin@librey.com` (Senha: `Senha123`) - Perfil: Administrador
- `bibliotecaria@librey.com` (Senha: `Senha123`) - Perfil: Bibliotecária
- `professor@librey.com` (Senha: `Senha123`) - Perfil: Professor
- `aluno@librey.com` (Senha: `Senha123`) - Perfil: Aluno

## Execução

Desenvolvimento:

```bash
npm run start:dev
```

Produção:

```bash
npm start
```

Por padrão, a API roda em:

```txt
http://localhost:3333
```

Health check:

```txt
GET /health
```

## Scripts

| Script | Descrição |
|---|---|
| `npm run start:dev` | Inicia com Nodemon |
| `npm start` | Inicia com Node |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:migrate` | Executa migrations |
| `npm run prisma:seed` | Executa seed |

## Rotas

### Autenticação e Usuário Atual

| Método | Rota | Acesso |
|---|---|---|
| `POST` | `/login` | Público |
| `POST` | `/cadastro` | Público |
| `POST` | `/auth/verify` | Público |
| `POST` | `/auth/resend-verification` | Público |
| `GET` | `/me` | Autenticado |
| `PUT` | `/me` | Autenticado |

### Recuperação de Senha

| Método | Rota | Acesso |
|---|---|---|
| `POST` | `/password-reset` | Público |
| `POST` | `/password-reset/request` | Público |
| `POST` | `/password-reset/validate` | Público |
| `POST` | `/password-reset/reset` | Público |
| `POST` | `/password-reset/test` | Desenvolvimento |

### Acervo

| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/livros` | Público com rate limit |
| `GET` | `/livros/:id` | Público com rate limit |
| `POST` | `/livros` | Bibliotecária/Admin |
| `PUT` | `/livros/:id` | Bibliotecária/Admin |
| `DELETE` | `/livros/:id` | Bibliotecária/Admin |

### Exemplares

| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/exemplares` | Público com rate limit |
| `GET` | `/exemplares/:id` | Público com rate limit |
| `POST` | `/exemplares` | Bibliotecária/Admin |
| `PUT` | `/exemplares/:id` | Bibliotecária/Admin |
| `DELETE` | `/exemplares/:id` | Bibliotecária/Admin |

### Reservas e Empréstimos

| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/reservas` | Autenticado |
| `GET` | `/reservas/analise-literaria` | Autenticado (Prof/Bib/Admin) |
| `POST` | `/reservas` | Autenticado |
| `PATCH` | `/reservas/:id/status` | Bibliotecária/Admin |
| `PATCH` | `/reservas/:id/retirar` | Autenticado |
| `PATCH` | `/reservas/:id/devolver` | Bibliotecária/Admin |

### Administração

| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/usuarios` | Bibliotecária/Admin |
| `PUT` | `/usuarios/:id` | Bibliotecária/Admin |
| `GET` | `/configuracoes` | Autenticado |
| `PUT` | `/configuracoes` | Bibliotecária/Admin |
| `GET` | `/eventos` | Autenticado |
| `POST` | `/eventos` | Bibliotecária/Admin |

### Comunicação

| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/notificacoes` | Autenticado |
| `PATCH` | `/notificacoes/:id/lida` | Autenticado |
| `PATCH` | `/notificacoes/marcar-todas-lidas` | Autenticado |
| `GET` | `/duvidas` | Autenticado |
| `POST` | `/duvidas` | Autenticado |
| `PATCH` | `/duvidas/:id/resolver` | Bibliotecária/Admin |

## Autenticação

Rotas protegidas recebem o token no cabeçalho:

```txt
Authorization: Bearer <token>
```

O middleware de autenticação valida o token, identifica o usuário e injeta os dados na requisição.

## E-mail e Recuperação de Senha

Em desenvolvimento, se SMTP não estiver configurado, o sistema usa Ethereal para pré-visualização de e-mails.

Também é possível usar:

```txt
POST /password-reset/test
```

com corpo:

```json
{
  "email": "usuario@example.com"
}
```

## Segurança

- Senhas com hash bcrypt.
- Tokens JWT.
- Rate limiting global, estrito e específico para login.
- CORS configurável por ambiente.
- Respostas genéricas na recuperação de senha para evitar enumeração de usuários.
- Tokens de reset armazenados com hash, uso único e expiração curta.

## Logs

Logs são escritos em `server/logs/`.

Arquivos esperados:

| Arquivo | Conteúdo |
|---|---|
| `error.log` | Erros |
| `combined.log` | Logs gerais |

## Integração com o Front-end

O front-end deve apontar para esta API usando:

```env
VITE_API_URL=http://localhost:3333
```

O back-end deve permitir a origem do front-end:

```env
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

## Problemas Comuns

### Prisma Client não encontrado

```bash
npm run prisma:generate
```

### Banco não conecta

Confira `DATABASE_URL`, usuário, senha, porta e nome do banco.

### Reset de senha não envia e-mail

Configure SMTP ou use Ethereal em desenvolvimento deixando as variáveis SMTP vazias.

### Porta em uso

Altere `PORT` no `.env`.
