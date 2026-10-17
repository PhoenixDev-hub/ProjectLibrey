# ProjectLibrey

Sistema web para gerenciamento de biblioteca escolar/acadêmica, com catálogo digital, reservas, empréstimos, leitores, notificações, dúvidas, eventos e configurações administrativas.

O projeto é dividido em duas aplicações independentes:

- `client/`: front-end em React, responsável pela interface do usuário.
- `server/`: back-end em Node.js/Express, responsável pela API, autenticação, regras de negócio e banco de dados.

## Visão Geral

ProjectLibrey foi criado para substituir controles manuais de biblioteca por um fluxo digital mais rastreável. Alunos e professores consultam o acervo, solicitam reservas e acompanham prazos; a bibliotecária administra livros, exemplares, leitores, reservas, empréstimos, eventos e configurações. Um cron diário monitora prazos de devolução e gera notificações de vencimento e atraso.

## Perfis de Usuário

O sistema possui quatro perfis (`tipoUsuario`), definidos no cadastro e usados como base de toda autorização:

| Perfil | Código | O que pode fazer |
|---|---|---|
| Aluno | `ALUNO` | Consultar o catálogo, favoritar livros, solicitar reservas (Leitura Pessoal), acompanhar empréstimos/reservas e usar a central de ajuda |
| Professor | `PROFESSOR` | Consultar o catálogo e acompanhar, na aba Análise Literária, as reservas que o indicam como professor (criadas pelo aluno no catálogo) |
| Bibliotecária | `BIBLIOTECARIA` | Tudo: gerenciar livros, exemplares, leitores, reservas/aprovação/retirada/devolução, notificações, dúvidas, eventos e configurações |
| Administrador | `ADMINISTRADOR` | Mesmas permissões da bibliotecária |

Observações:

- Todo usuário tem um `status` (`ATIVO` ou `INATIVO`). Usuários inativos não conseguem logar nem usar a API autenticada.
- O cadastro público (`/cadastro`) é autorizado apenas para Aluno e Professor; leitores cadastrados pela bibliotecária recebem o perfil desejado pela administração.
- Regras de validação: Aluno precisa informar `anoSala` (formato `1A`–`3D`) e usar e-mail de domínio público permitido; Professor, Bibliotecária e Administrador exigem e-mail institucional (domínio `.ce.gov.br`).
- As permissões são aplicadas no back-end (`roleMiddleware` / `soBibliotecaria`) e espelhadas no front-end, que filtra as abas do dashboard por perfil.

## Principais Funcionalidades

### Usuários

- Cadastro e login com autenticação JWT (cookies httpOnly + CSRF).
- Verificação de e-mail por código de 6 dígitos no cadastro (validade de 15 minutos, com reenvio).
- Recuperação de senha por e-mail (token de uso único, expira em 1 hora).
- Atualização de dados de perfil (`/me`).
- Controle de status de usuários pela administração.

### Catálogo

- Listagem de livros e exemplares do acervo (com busca por título, autor e área).
- Capas buscadas em serviços externos (Open Library e Google Books) quando o livro não possui imagem cadastrada, com cache local no navegador.
- Favoritos para alunos (guardados localmente no navegador).
- Detalhes do livro em modal e reserva rápida.

### Reservas e Empréstimos

- Solicitação de reserva por alunos (Leitura Pessoal) e reservas de Análise Literária, em que o usuário indica um professor (o professor acompanha pelo painel de Análise Literária).
- Aprovação e rejeição de reservas pela bibliotecária.
- Registro de retirada (define o prazo de devolução) e de devolução.
- Limite de reservas/empréstimos ativos simultâneos configurável e regra de uma reserva ativa por título.
- Notificações automáticas em cada etapa e monitoramento de prazos por cron.

### Administração

- Cadastro, edição e exclusão de livros e exemplares.
- Cadastro, edição e ativação/inativação de leitores.
- Gestão de notificações internas e central de dúvidas (com resposta).
- Eventos da biblioteca e configurações (prazo de devolução, limite de empréstimos, renovação, nome da biblioteca).

## Stack Técnica

### Front-end

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React
- JWT Decode

Documentação específica: [client/README.md](client/README.md)

### Back-end

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod
- Nodemailer (com Ethereal em desenvolvimento)
- Winston (logs com rotação e redação)
- node-cron

Documentação específica: [server/README.md](server/README.md)

## Estrutura do Projeto

```txt
ProjectLibrey/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   ├── constants/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   └── Dashboard/
│   │   │       └── components/
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
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── cronjobs/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── service/
│   │   └── utils/
│   ├── test/
│   ├── index.js
│   ├── package.json
│   └── prisma.config.ts
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

Existe um `docker-compose.yml` na raiz que sobe apenas o PostgreSQL local. Os Dockerfiles de `client/` e `server/` não estão presentes no repositório; para desenvolvimento, use a execução local descrita abaixo.

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

Edite `server/.env`. Variáveis reconhecidas pela aplicação:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Segredo do JWT (mínimo 32 bytes aleatórios; gere com `openssl rand -hex 32`) |
| `DATABASE_URL` | Sim | URL de conexão do PostgreSQL |
| `PORT` | Não (padrão `3333`) | Porta da API |
| `NODE_ENV` | Não (padrão `development`) | `development` ou `production` |
| `CORS_ORIGIN` | Não | Origens permitidas, separadas por vírgula (padrão: `http://localhost:5173,http://localhost:3000`) |
| `FRONTEND_URL` | Não (padrão `http://localhost:5173`) | Base usada nos links de e-mail (reset de senha) |
| `LOG_LEVEL` | Não (padrão `info`) | Nível de log do Winston |
| `TRUST_PROXY_HOPS` | Não (padrão `1`) | Hops de proxy confiáveis (0 se exposto direto) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Obrigatórias em produção | Configuração de e-mail. Em desenvolvimento, se vazias, o sistema usa Ethereal automaticamente |

Exemplo mínimo para desenvolvimento:

```env
NODE_ENV=development
PORT=3333
JWT_SECRET=cole-aqui-um-segredo-aleatorio-forte
DATABASE_URL=postgresql://postgres:SUBSTITUA_PELA_SENHA_URL_ENCODED@localhost:5432/project_library
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

`DATABASE_URL` é obrigatória tanto para a API quanto para os comandos Prisma. Substitua os placeholders e não versione o arquivo `.env` preenchido.

Para iniciar somente o PostgreSQL local, execute **na raiz do repositório**:

```bash
docker compose --env-file server/.env up -d postgres
```

O Compose exige `DB_PASSWORD` não vazia (adicione também ao `server/.env`) e publica a porta apenas em `127.0.0.1:5432`. `DB_USER` é opcional (padrão `postgres`). O banco criado se chama `project_library`. Alterar essas variáveis não troca as credenciais de um volume já inicializado; nesse caso, altere a senha no próprio PostgreSQL.

### 3. Preparar banco de dados

Execute em `server/`:

```bash
npx prisma generate
npx prisma migrate dev
```

Opcionalmente, importe o acervo do CSV e crie usuários de teste:

```bash
npm run prisma:seed
```

> Atenção: o seed **apaga** livros, exemplares, reservas, notificações e os usuários de teste antes de recriá-los. Detalhes em [server/README.md](server/README.md).

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
| `npm test` | Executa os testes com o runner nativo do Node |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | Executa migrations em desenvolvimento |
| `npm run prisma:seed` | Importa o acervo do CSV e cria usuários de teste |

## Rotas Principais da API

| Grupo | Rotas |
|---|---|
| Autenticação | `/login`, `/cadastro`, `/me`, `/verificar-email`, `/reenviar-verificacao`, `/auth/refresh`, `/auth/logout` |
| Recuperação de senha | `/password-reset` |
| Livros | `/livros` |
| Exemplares | `/exemplares` |
| Reservas | `/reservas` |
| Usuários | `/usuarios` |
| Notificações | `/notificacoes` |
| Dúvidas | `/duvidas` |
| Configurações | `/configuracoes` |
| Eventos | `/eventos` |

A tabela completa de rotas, níveis de acesso e perfis permitidos está em [server/README.md](server/README.md).

Rotas protegidas aceitam duas formas (mesmo middleware `autenticar`):

```txt
Authorization: Bearer <token>
```

ou a sessão por cookies httpOnly (`access_token`) definida no login — usada pelo front-end, que espelha o cookie legível `csrf_token` no cabeçalho `X-CSRF-Token` nas mutações (double-submit). Nenhum endpoint devolve `token`/`refreshToken` no corpo JSON.

## Segurança

- Senhas criptografadas com bcrypt.
- Sessão com access token JWT de curta duração (15 min) em cookie httpOnly e refresh token opaco de 7 dias, armazenado no banco e rotacionado a cada renovação.
- Proteção CSRF por double-submit do cookie `csrf_token` em requisições mutantes.
- Rate limiting global e específico (login, cadastro, verificação de e-mail e reset de senha).
- Helmet com Content Security Policy restritiva e HSTS em produção.
- CORS configurável por origem permitida.
- Validação de entradas com schemas Zod.
- Recuperação de senha com token armazenado em hash, uso único e expiração de 1 hora; respostas genéricas para evitar enumeração de usuários.
- Logs com redação automática de dados sensíveis (senhas, tokens, e-mails, telefones, CPF).

## Observações de Desenvolvimento

- O front-end consome a URL definida em `VITE_API_URL` (padrão `http://localhost:3333`).
- O back-end libera as origins definidas em `CORS_ORIGIN`.
- As capas do catálogo são buscadas por título/autor no Open Library e Google Books e armazenadas em cache local do navegador.
- O cron de prazos roda todo dia às 08h e notifica o leitor (vencimento/atraso) e a bibliotecária (atrasos).
- Logs do back-end ficam em `server/logs/` (arquivos rotacionados por dia).
- As migrations ficam em `server/prisma/migrations/`.
- Existem usuários de teste criados pelo seed (senha `Senha123`): `admin@librey.com`, `bibliotecaria@librey.com`, `professor@librey.com`, `aluno@librey.com`.

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

Verifique se o banco está rodando (`docker compose --env-file server/.env up -d postgres`) e se `DATABASE_URL` está correta.

## Status

Projeto em desenvolvimento ativo. As principais áreas do sistema já estão implementadas, com refinamentos de interface, organização e estabilidade em andamento.

## Autor

Desenvolvido por PhoenixDev.
