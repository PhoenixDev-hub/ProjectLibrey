# ProjectLibrey Back-end

API REST do ProjectLibrey, responsável por autenticação, autorização, regras de negócio, persistência dos dados, integrações de e-mail e rotinas agendadas.

## Responsabilidades

- Autenticar usuários (JWT em cookie httpOnly ou cabeçalho `Authorization`).
- Autorizar ações por perfil (Aluno, Professor, Bibliotecária, Administrador).
- Gerenciar livros, exemplares, leitores, reservas e empréstimos.
- Registrar retirada e devolução de livros, com prazo configurável.
- Gerenciar notificações, dúvidas, eventos e configurações da biblioteca.
- Enviar e-mails de verificação de cadastro e de recuperação de senha.
- Monitorar prazos de devolução diariamente via cron e notificar leitores e bibliotecárias.
- Persistir dados em PostgreSQL via Prisma.

## Perfis e Permissões

O perfil vem do campo `tipoUsuario` do usuário (valores: `ALUNO`, `PROFESSOR`, `BIBLIOTECARIA`, `ADMINISTRADOR`) e é aplicado pelos middlewares:

- `autenticar` — exige token válido (cabeçalho ou cookie) e valida CSRF em requisições mutantes via cookie.
- `roleMiddleware([...])` — permite apenas os perfis listados; `403` caso contrário.
- `soBibliotecaria` — atalho para `["BIBLIOTECARIA", "ADMINISTRADOR"]`.

Regras por recurso:

| Recurso | Leitura | Escrita |
|---|---|---|
| Livros (`/livros`) | Qualquer perfil autenticado | Bibliotecária/Admin |
| Exemplares (`/exemplares`) | Qualquer perfil autenticado | Bibliotecária/Admin |
| Criação de reserva (`POST /reservas`) | — | Aluno, Bibliotecária/Admin |
| Reservas de Análise Literária (`GET /reservas/analise-literaria`) | Professor, Bibliotecária/Admin | — |
| Aprovação/rejeição, retirada e devolução de reservas | — | Bibliotecária/Admin |
| Lista de usuários (`GET /usuarios`, `PUT /usuarios/:id`) | — | Bibliotecária/Admin |
| Lista de professores (`GET /usuarios/professores`) | Qualquer perfil autenticado | — |
| Criação de leitor (`POST /usuarios`) | — | Bibliotecária/Admin |
| Notificações | Qualquer perfil autenticado (as suas) | Qualquer perfil autenticado (marcar como lida) |
| Dúvidas (`GET/POST`) | Qualquer perfil autenticado | Responder (`PATCH /:id/resolver`): Bibliotecária/Admin |
| Configurações (`GET`) | Qualquer perfil autenticado | Alterar (`PUT`): Bibliotecária/Admin |
| Eventos (`GET`) | Qualquer perfil autenticado | Criar (`POST`): Bibliotecária/Admin |

Observações importantes:

- O cadastro público (`POST /cadastro`) passa pelo mesmo router de usuários mas é liberado para qualquer visitante; já `POST /usuarios` (montado em `/usuarios`) exige Bibliotecária/Admin. Ou seja: alunos e professores se cadastram sozinhos; demais leitores são criados pela administração.
- O schema do cadastro público aceita apenas `ALUNO` e `PROFESSOR`; o schema administrativo aceita os quatro perfis.
- Regras de validação de cadastro (`src/schemas/usuario.schemas.js`): Aluno deve informar `anoSala` (formato `1A`–`3D`) e usar e-mail de domínio público permitido (gmail, outlook, hotmail, live, yahoo, `aluno.ce.gov.br`); Professor, Bibliotecária e Administrador exigem e-mail institucional (`.ce.gov.br`, exceto `aluno.ce.gov.br`).
- Usuários com `status` diferente de `ATIVO` não conseguem logar nem ter dados lidos via `/me`.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Node.js | Runtime da API (ESM, `"type": "module"`) |
| Express | Servidor HTTP e roteamento |
| Prisma | ORM, migrations e Prisma Client |
| PostgreSQL | Banco de dados |
| JWT (`jsonwebtoken`) | Access tokens de curta duração |
| bcrypt | Hash de senha e de tokens de reset |
| Zod | Validação de entradas (`src/schemas/`) |
| Nodemailer | E-mails (Ethereal em desenvolvimento) |
| Winston + daily-rotate-file | Logs com rotação e redação |
| node-cron | Rotinas agendadas |
| express-rate-limit | Rate limiting |
| Helmet | Cabeçalhos de segurança e CSP |
| cookie-parser / CORS | Cookies de sessão e origens permitidas |

## Estrutura

```txt
server/
├── lib/
│   └── prisma.js            # Instância única do Prisma Client
├── generated/               # Saída do Prisma Client (gerada por `npm run prisma:generate`)
├── prisma/
│   ├── migrations/
│   ├── schema.prisma        # Modelos: Usuario, Livro, Exemplar, Reserva, Notificacao, Duvida, Configuracao, Evento...
│   └── seed.js              # Importa Livros.csv e cria usuários de teste
├── src/
│   ├── config/
│   │   └── env.js           # Validação e leitura das variáveis de ambiente
│   ├── controllers/
│   ├── cronjobs/
│   │   └── verificarPrazos.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── authorization.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   ├── role.middleware.js
│   │   └── validation.middleware.js
│   ├── routes/
│   ├── schemas/             # Schemas Zod
│   ├── service/
│   └── utils/               # cookies.js, logger.js, mailer.js
├── test/                    # Testes (runner nativo do Node)
├── index.js                 # bootstrap da aplicação
├── package.json
├── prisma.config.ts         # Config do Prisma (schema + DATABASE_URL)
└── README.md
```

## Instalação

```bash
cd server
npm install
cp .env.example .env
```

Configure `server/.env`:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Segredo JWT (mínimo 32 bytes; `openssl rand -hex 32`) |
| `DATABASE_URL` | Sim | `postgresql://usuario:senha@localhost:5432/project_library` |
| `PORT` | Não (padrão `3333`) | Porta da API |
| `NODE_ENV` | Não (padrão `development`) | `development` ou `production` |
| `CORS_ORIGIN` | Não | Origens permitidas separadas por vírgula (padrão `http://localhost:5173,http://localhost:3000`) |
| `FRONTEND_URL` | Não (padrão `http://localhost:5173`) | Base dos links enviados por e-mail |
| `LOG_LEVEL` | Não (padrão `info`) | Nível do Winston |
| `TRUST_PROXY_HOPS` | Não (padrão `1`) | Hops de proxy confiáveis |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Só em produção | Se vazias em desenvolvimento, o sistema usa Ethereal automaticamente |

Em produção (`NODE_ENV=production`), o servidor **não sobe** sem `DATABASE_URL`, `JWT_SECRET`, `SMTP_*`, `EMAIL_FROM` e `FRONTEND_URL`.

Para subir apenas o PostgreSQL local (na raiz do repositório):

```bash
docker compose --env-file ../server/.env up -d postgres
```

O Compose usa `DB_USER` (padrão `postgres`) e exige `DB_PASSWORD` — adicione-as também ao `server/.env` se for usar o container. O banco criado é `project_library` e a porta é publicada somente em `127.0.0.1:5432`.

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

O seed faz o seguinte:

- **Apaga** todos os registros de notificações, reservas, exemplares e livros.
- Recria os usuários de teste (apagando-os antes, se existirem).
- Lê `../Livros.csv` e cria livros e exemplares (o campo `Nº. DE TOMBO` vira o código do exemplar; observações com "EXTRAVIADO"/"DESCARTADO"/"INUTILIZADO" definem status do exemplar).
- Cria os usuários de teste (todos com e-mail verificado e senha `Senha123`):
  - `admin@librey.com` — Administrador
  - `bibliotecaria@librey.com` — Bibliotecária
  - `professor@librey.com` — Professor
  - `aluno@librey.com` — Aluno

## Execução

Desenvolvimento:

```bash
npm run start:dev
```

Produção:

```bash
npm start
```

Por padrão, a API roda em `http://localhost:3333`. Health check: `GET /health`.

Ao iniciar, a aplicação valida o ambiente, verifica a conexão com o banco e agenda o cron de prazos.

## Scripts

| Script | Descrição |
|---|---|
| `npm run start:dev` | Inicia com Nodemon |
| `npm start` | Inicia com Node |
| `npm test` | Executa os testes em `test/` (Node test runner, ESM) |
| `npm run prisma:generate` | Gera o Prisma Client em `generated/` |
| `npm run prisma:migrate` | Executa migrations |
| `npm run prisma:seed` | Executa o seed |

## Rotas

Rotas com alias: `/login` e `/auth/login`, `/cadastro` e `/auth/cadastro` apontam para os mesmos handlers.

### Autenticação e Usuário Atual

| Método | Rota | Perfis permitidos |
|---|---|---|
| `POST` | `/login` | Público |
| `POST` | `/cadastro` | Público (auto-cadastro) |
| `POST` | `/verificar-email` | Público |
| `POST` | `/reenviar-verificacao` | Público |
| `POST` | `/auth/refresh` | Público (usa o cookie `refresh_token`) |
| `POST` | `/auth/logout` | Público (apaga cookies e o refresh token) |
| `GET` | `/me` | Autenticado |
| `PUT` | `/me` | Autenticado |

Aliases em `/auth`: `POST /auth/login`, `POST /auth/cadastro`, `POST /auth/verificar-email`, `POST /auth/forgot-password`, `POST /auth/reset-password`.

### Recuperação de Senha

| Método | Rota | Perfis permitidos |
|---|---|---|
| `POST` | `/password-reset` | Público |
| `POST` | `/password-reset/request` | Público |
| `POST` | `/password-reset/validate` | Público |
| `POST` | `/password-reset/reset` | Público |

Todas as rotas de reset respondem de forma genérica para evitar enumeração de usuários (exceto `/validate`, usada pela tela de redefinição).

### Acervo

| Método | Rota | Perfis permitidos |
|---|---|---|
| `GET` | `/livros` | Qualquer perfil autenticado |
| `GET` | `/livros/:id` | Qualquer perfil autenticado |
| `POST` | `/livros` | Bibliotecária/Admin |
| `PUT` | `/livros/:id` | Bibliotecária/Admin |
| `DELETE` | `/livros/:id` | Bibliotecária/Admin |

### Exemplares

| Método | Rota | Perfis permitidos |
|---|---|---|
| `GET` | `/exemplares` | Qualquer perfil autenticado |
| `GET` | `/exemplares/:id` | Qualquer perfil autenticado |
| `POST` | `/exemplares` | Bibliotecária/Admin |
| `PUT` | `/exemplares/:id` | Bibliotecária/Admin |
| `DELETE` | `/exemplares/:id` | Bibliotecária/Admin |

### Reservas e Empréstimos

| Método | Rota | Perfis permitidos |
|---|---|---|
| `GET` | `/reservas` | Autenticado |
| `GET` | `/reservas/analise-literaria` | Professor, Bibliotecária/Admin |
| `POST` | `/reservas` | Aluno, Bibliotecária/Admin |
| `PATCH` | `/reservas/:id/status` | Bibliotecária/Admin (`acao`: `APROVAR` ou `REJEITAR`) |
| `PATCH` | `/reservas/:id/retirar` | Bibliotecária/Admin |
| `PUT` | `/reservas/:id/retirar` | Bibliotecária/Admin |
| `PATCH` | `/reservas/:id/devolver` | Bibliotecária/Admin |

### Administração

| Método | Rota | Perfis permitidos |
|---|---|---|
| `POST` | `/usuarios` | Bibliotecária/Admin (criação administrativa) |
| `GET` | `/usuarios` | Bibliotecária/Admin |
| `GET` | `/usuarios/professores` | Autenticado |
| `PUT` | `/usuarios/:id` | Bibliotecária/Admin (edição e status) |
| `GET` | `/configuracoes` | Autenticado |
| `PUT` | `/configuracoes` | Bibliotecária/Admin |
| `GET` | `/eventos` | Autenticado |
| `POST` | `/eventos` | Bibliotecária/Admin |

### Comunicação

| Método | Rota | Perfis permitidos |
|---|---|---|
| `GET` | `/notificacoes` | Autenticado |
| `PATCH` | `/notificacoes/:id/lida` | Autenticado |
| `PATCH` | `/notificacoes/marcar-todas-lidas` | Autenticado |
| `GET` | `/duvidas` | Autenticado |
| `POST` | `/duvidas` | Autenticado |
| `PATCH` | `/duvidas/:id/resolver` | Bibliotecária/Admin |

### Infra

| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/` | Público (banner da API) |
| `GET` | `/health` | Público (health check) |

## Autenticação e Sessão

Rotas protegidas aceitam o token no cabeçalho:

```txt
Authorization: Bearer <token>
```

ou a sessão por cookies httpOnly definida por `POST /login`:

| Cookie | Conteúdo | Validade |
|---|---|---|
| `access_token` | JWT (httpOnly) | 15 minutos |
| `refresh_token` | Token opaco aleatório, armazenado no banco (httpOnly) | 7 dias, rotacionado a cada refresh |
| `csrf_token` | Valor legível pelo JS | 7 dias |

No modo cookie, requisições mutantes (POST/PUT/PATCH/DELETE) devem enviar o cabeçalho `X-CSRF-Token` com o valor do cookie `csrf_token` (double-submit, comparado com comparação segura); sem isso, respondem `403`.

O refresh (`POST /auth/refresh`) valida o refresh token no banco, o apaga e emite um novo (rotação). O logout apaga o refresh token no banco e limpa os cookies. Os tokens nunca aparecem no corpo JSON das respostas.

## Fluxo de Reservas e Empréstimos

Estados de uma reserva: `PENDENTE` → `APROVADO` → `RETIRADO` → `DEVOLVIDO`.

1. **Criação** (`POST /reservas`): valida uma reserva ativa por título, o limite global de reservas/empréstimos ativos (padrão 5, configurável) e a disponibilidade de um exemplar. O exemplar muda para `RESERVADO` e a bibliotecária recebe uma notificação. Tipos: `LEITURA_PESSOAL` (padrão) e `ANALISE_LITERARIA` (com `professorId` indicado pelo usuário no catálogo; o professor acompanha pelo painel de Análise Literária).
2. **Aprovação/Rejeição** (`PATCH /reservas/:id/status`): só reservas `PENDENTE`. Aprovar gera notificação ao usuário; rejeitar **apaga** a reserva, devolve o exemplar a `DISPONIVEL` e notifica o usuário.3. **Retirada** (`PATCH` ou `PUT /reservas/:id/retirar`): muda para `RETIRADO` e define `prazoDevol` com base na configuração `prazoDevolucao` (padrão 30 dias).
4. **Devolução** (`PATCH /reservas/:id/devolver`): muda para `DEVOLVIDO` e libera o exemplar (`DISPONIVEL`).

Status possíveis do exemplar: `DISPONIVEL`, `RESERVADO`, `EXTRAVIADO`, `INDISPONIVEL`.

## Cron de Prazos

`src/cronjobs/verificarPrazos.js` roda diariamente às 08h (`0 8 * * *`) e também na subida do servidor:

- Reservas `RETIRADO` com prazo no dia: notificação `VENCIMENTO_HOJE` para o leitor.
- Reservas `RETIRADO` com prazo vencido: notificação `EM_ATRASO` para o leitor (com dias de atraso) e para todas as bibliotecárias/administradores ativos.

## Configurações da Biblioteca

Tabela única (`configuracoes`):

| Campo | Padrão | Efeito |
|---|---|---|
| `prazoDevolucao` | 30 (dias) | Prazo definido na retirada |
| `limiteEmprestimos` | 5 | Limite de reservas/empréstimos ativos por usuário |
| `permitirRenovacao` | `true` | Flag de renovação |
| `nomeBiblioteca` | `Biblioteca ProjectLibrey` | Nome exibido |

## E-mail e Recuperação de Senha

- E-mails usados: código de verificação de cadastro (6 dígitos, expira em 15 min) e link de redefinição de senha (`{FRONTEND_URL}/reset-password#token=...&email=...`).
- Se `SMTP_*` não estiver configurado em desenvolvimento, o sistema cria uma conta Ethereal automaticamente e registra o link de pré-visualização no log.
- Em produção, sem SMTP o envio falha e é apenas logado (o usuário não vê erro).
- Tokens de reset são armazenados **em hash** (bcrypt), duram 1 hora, são de uso único e o uso bem-sucedido revoga todos os refresh tokens do usuário.

## Rate Limiting

| Limiter | Janela | Máximo | Onde é usado |
|---|---|---|---|
| `generalLimiter` | 15 min | 100 | Global (ignora as rotas sensíveis) |
| `loginLimiter` | 15 min | 5 | `/login`, `/auth/login` |
| `cadastroLimiter` | 1 h | 3 | `/cadastro`, `/auth/cadastro` |
| `resetLimiter` | 1 h | 3 | Rotas de reset de senha |
| `verifyEmailLimiter` | 15 min | 5 | Verificação e reenvio de código |

## Segurança

- Senhas com hash bcrypt.
- Access JWT de 15 min em cookie httpOnly; refresh token opaco rotacionado e persistido no banco.
- CSRF por double-submit (`X-CSRF-Token` vs cookie `csrf_token`) em requisições mutantes via cookie.
- Helmet com CSP restritiva (permite apenas as fontes de capas usadas pelo catálogo), HSTS em produção, sem `x-powered-by`, frameguard e noSniff.
- Rate limiting global e específico por rota sensível.
- CORS por allowlist configurada em `CORS_ORIGIN` (origens fora da lista recebem 403).
- Validação de payloads com schemas Zod (`validationMiddleware`).
- Respostas genéricas na recuperação de senha para evitar enumeração de usuários.
- Logs com redação automática de senhas, tokens, segredos, e-mails, telefones e CPF.

## Logs

Logs são escritos em `server/logs/` pelo Winston, com rotação diária:

| Arquivo | Conteúdo |
|---|---|
| `app-AAAA-MM-DD.log[.gz]` | Log JSON estruturado do dia (retidos por 14 dias, máx. 10 MB por arquivo) |

Em desenvolvimento, os logs também aparecem no console. O nível é controlado por `LOG_LEVEL`.

## Testes

```bash
npm test
```

Usa o runner nativo do Node (`node --test`, com `--experimental-vm-modules`) contra os arquivos em `test/`. Os testes cobrem, por exemplo, o fluxo de reset de senha e a configuração de banco.

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

Confira `DATABASE_URL`, usuário, senha, porta e nome do banco (`project_library`). Se usar o Compose, confira `DB_PASSWORD`.

### "JWT_SECRET não definido"

O servidor aborta sem `JWT_SECRET`. Gere um com `openssl rand -hex 32` e coloque no `server/.env`.

### Reset de senha não envia e-mail

Em desenvolvimento, deixe as variáveis SMTP vazias para usar Ethereal (o link de preview aparece no log). Em produção, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `EMAIL_FROM`.

### Porta em uso

Altere `PORT` no `.env`.

### Erro 403 em requisições com cookie

Falta o cabeçalho `X-CSRF-Token` igual ao cookie `csrf_token` em POST/PUT/PATCH/DELETE.
