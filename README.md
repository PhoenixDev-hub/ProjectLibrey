# Biblioteca Acadêmica — Sistema de Gerenciamento

Sistema digital de gerenciamento para bibliotecas acadêmicas, desenvolvido para substituir os processos manuais em papel que historicamente geram perda de livros, reservas extraviadas e dificuldade de controle do acervo. A solução centraliza as operações de reserva, devolução e consulta do acervo em uma plataforma web acessível a alunos, professores e bibliotecários, reduzindo a burocracia e aumentando a rastreabilidade de cada exemplar.

O projeto encontra-se em fase avançada de desenvolvimento, com as funcionalidades principais implementadas e ajustes finais em andamento.

---

## O Problema que o Sistema Resolve

Bibliotecas acadêmicas que ainda operam com fichas e registros em papel enfrentam problemas recorrentes:

- Reservas perdidas ou ilegíveis por erro de preenchimento manual
- Dificuldade em saber se um livro está disponível, emprestado ou extraviado
- Ausência de histórico confiável de quem retirou cada exemplar
- Processo de devolução lento e dependente da presença física do bibliotecário para consultar registros

Este sistema elimina o papel do fluxo operacional da biblioteca, substituindo-o por registros digitais auditáveis, consultas em tempo real e um painel administrativo para os bibliotecários gerenciarem o acervo com precisão.

---

## Funcionalidades

### Para Alunos e Professores

- Cadastro e autenticação na plataforma
- Consulta ao catálogo de livros disponíveis com busca por título, autor ou categoria
- Reserva de livros diretamente pelo sistema, sem necessidade de deslocamento até a biblioteca
- Visualização do status da reserva (pendente, ativa, concluída ou cancelada)
- Acompanhamento do prazo de devolução dos livros retirados

### Para Bibliotecários

- Painel administrativo para gerenciamento completo do acervo
- Registro de entradas e saídas de exemplares
- Controle de prazos de devolução com visibilidade sobre atrasos
- Consulta ao histórico de reservas por usuário ou por livro
- Gerenciamento de cadastros de usuários (alunos e professores)

---

## Arquitetura da Solução

O sistema é dividido em duas camadas independentes que se comunicam via API RESTful:

- **Backend (servidor):** responsável pela lógica de negócio, autenticação, validação de dados e persistência no banco de dados.
- **Frontend (cliente):** interface web responsiva acessada pelo navegador, que consome a API do backend.

Ambas as camadas podem ser executadas localmente ou em containers Docker, facilitando o deploy em qualquer ambiente.

---

## Tecnologias Utilizadas

### Backend

| Tecnologia | Finalidade |
|---|---|
| Node.js 20+ | Runtime JavaScript no servidor |
| Express | Framework web para construção da API |
| Prisma | ORM para acesso e migração do banco de dados |
| PostgreSQL 16+ | Banco de dados relacional principal |
| JWT | Emissão e validação de tokens de autenticação |
| Zod | Validação e parsing de schemas de entrada |
| Winston | Logging estruturado em múltiplos níveis |
| Express Rate Limit | Controle de taxa de requisições por cliente |
| bcrypt | Hash seguro de senhas com salting |

### Frontend

| Tecnologia | Finalidade |
|---|---|
| React 19 | Biblioteca para construção da interface |
| Vite | Ferramenta de build e servidor de desenvolvimento |
| Tailwind CSS | Estilização utilitária e responsiva |
| React Router | Roteamento declarativo no lado do cliente |
| Lucide React | Biblioteca de ícones SVG |
| Axios | Cliente HTTP com suporte a interceptores |
| JWT Decode | Leitura e decodificação de tokens JWT no cliente |

---

## Pré-requisitos

- Node.js 20 ou superior
- npm ou yarn
- PostgreSQL 16 ou superior (dispensável caso utilize Docker)
- Docker e Docker Compose (necessário apenas para deploy em containers)

---

## Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd ProjectLibrary
```

### 2. Configurar variáveis de ambiente

#### Backend

```bash
cp server/.env.example server/.env
```

Edite o arquivo `server/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/project_library"
JWT_SECRET="sua-chave-super-secreta-minimo-32-caracteres"
PORT=3333
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

#### Frontend

```bash
cp client/.env.example client/.env.local
```

Edite o arquivo `client/.env.local`:

```env
VITE_API_URL="http://localhost:3333"
VITE_APP_NAME="Biblioteca Academica"
```

### 3. Instalar dependências e configurar o banco de dados

#### Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
cd ..
```

O comando `prisma migrate dev` aplica todas as migrations pendentes e sincroniza o schema com o banco de dados.

#### Frontend

```bash
cd client
npm install
cd ..
```

---

## Execução em Ambiente de Desenvolvimento

### Opção 1: Inicialização manual

Terminal 1 — Backend:

```bash
cd server
npm run start:dev
```

Terminal 2 — Frontend:

```bash
cd client
npm run dev
```

### Opção 2: Docker Compose (recomendado)

```bash
docker-compose up -d
```

Após a inicialização, os serviços estarão disponíveis em:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3333 |
| Health check | http://localhost:3333/health |

---

## Build para Produção

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

Os arquivos estáticos gerados serão disponibilizados no diretório `client/dist/`, prontos para serem servidos por Nginx, Caddy ou qualquer servidor de arquivos estáticos.

---

## Deploy com Docker

### Build das imagens

```bash
docker build -t project-library-server ./server
docker build -t project-library-client ./client
```

### Executar via Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

### Variáveis de ambiente para produção

```env
DATABASE_URL="postgresql://usuario:senha@seu-db-host:5432/project_library"
JWT_SECRET="gere-uma-chave-longa-aleatoria-e-segura"
PORT=3333
NODE_ENV="production"
CORS_ORIGIN="https://seudominio.com"
```

Em ambiente de produção, utilize um gerenciador de segredos (como variáveis de ambiente injetadas pelo orquestrador, AWS Secrets Manager ou HashiCorp Vault) para proteger as credenciais sensíveis.

---

## Perfis de Usuário

O sistema opera com três perfis distintos, cada um com permissões específicas:

| Perfil | Descrição |
|---|---|
| Aluno | Consulta o catálogo, realiza reservas e acompanha prazos de devolução |
| Professor | Mesmas permissões do aluno, podendo ter prazos de empréstimo diferenciados |
| Bibliotecário | Acesso ao painel administrativo; gerencia o acervo, usuários e devoluções |

---

## Referência da API

### Autenticação

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/login` | Autenticar usuário e obter token JWT | Público |
| POST | `/cadastro` | Registrar novo usuário | Público |

### Acervo

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/livros` | Listar todos os livros do acervo | Autenticado |
| GET | `/livros/:id` | Consultar detalhes de um livro específico | Autenticado |
| POST | `/livros` | Adicionar novo livro ao acervo | Bibliotecário |
| PUT | `/livros/:id` | Atualizar informações de um livro | Bibliotecário |
| DELETE | `/livros/:id` | Remover livro do acervo | Bibliotecário |

### Reservas

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/reservas` | Listar reservas do usuário autenticado | Autenticado |
| POST | `/reservas` | Criar uma nova reserva | Autenticado |
| PUT | `/reservas/:id` | Atualizar status de uma reserva | Bibliotecário |
| DELETE | `/reservas/:id` | Cancelar uma reserva | Autenticado |

### Monitoramento

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verificar disponibilidade da API |
| GET | `/` | Informações gerais sobre a API |

### Autenticação nas rotas protegidas

Inclua o token JWT no cabeçalho de todas as requisições a rotas autenticadas:

```
Authorization: Bearer <token>
```

---

## Segurança

- **Rate limiting no login:** máximo de 5 tentativas a cada 15 minutos por IP, prevenindo ataques de força bruta
- **Hash de senhas:** bcrypt com fator de custo adequado; as senhas nunca são armazenadas em texto puro
- **Tokens JWT:** expiração de 7 dias; a rotação do `JWT_SECRET` invalida todos os tokens ativos imediatamente
- **Validação de entrada:** todos os payloads da API são validados com Zod antes de qualquer processamento
- **CORS configurável:** origins autorizadas definidas por variável de ambiente, bloqueando requisições de origens não listadas
- **Tratamento seguro de erros:** stack traces suprimidos em produção para evitar vazamento de informações internas

### Perfis de rate limiting disponíveis

| Perfil | Limite | Janela |
|---|---|---|
| `loginLimiter` | 5 requisições | 15 minutos |
| `generalLimiter` | 100 requisições | 15 minutos |
| `strictLimiter` | 1000 requisições | 1 hora |

---

## Middlewares

### Auth Middleware

Valida o token JWT e injeta os dados do usuário autenticado na requisição. Deve ser aplicado em todas as rotas que exigem autenticação.

```javascript
import { authMiddleware } from './src/middlewares/auth.middleware.js'

router.get('/rota-protegida', authMiddleware, controller)
```

---

## Estrutura do Projeto

```
ProjectLibrary/
├── client/                     # Aplicação frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis de UI
│   │   ├── contexts/           # Gerenciamento de estado global (Context API)
│   │   ├── hooks/              # Custom hooks para lógica compartilhada
│   │   ├── pages/              # Páginas da aplicação
│   │   ├── services/           # Camada de comunicação com a API
│   │   └── styles/             # Estilos globais
│   └── package.json
│
├── server/                     # Aplicação backend (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Configurações globais (banco, cors, etc.)
│   │   ├── controllers/        # Controladores das rotas
│   │   ├── middlewares/        # Middlewares de autenticação, erros e logging
│   │   ├── routes/             # Definição e agrupamento de rotas
│   │   ├── schemas/            # Schemas de validação Zod
│   │   ├── service/            # Lógica de negócio e acesso a dados
│   │   └── utils/              # Utilitários e helpers
│   ├── prisma/                 # Schema do banco e histórico de migrations
│   ├── index.js                # Ponto de entrada da aplicação
│   └── package.json
│
├── docker-compose.yml          # Orquestração de todos os serviços
└── .gitignore
```

---

## Logging

Os logs são persistidos no diretório `server/logs/`:

| Arquivo | Conteúdo |
|---|---|
| `error.log` | Apenas registros de nível `error` e `fatal` |
| `combined.log` | Todos os níveis: `debug`, `info`, `warn` e `error` |

Em produção, considere configurar um transporte adicional para envio de logs a serviços externos como Datadog, Logtail ou CloudWatch para monitoramento centralizado.

---

## Variáveis de Ambiente

### Server

| Variável | Descrição | Obrigatório | Padrão |
|---|---|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL | Sim | — |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens | Sim | — |
| `PORT` | Porta em que o servidor irá escutar | Não | `3333` |
| `NODE_ENV` | Ambiente de execução (`development` / `production`) | Não | `development` |
| `CORS_ORIGIN` | Origins autorizadas para requisições cross-origin | Não | `http://localhost:5173` |

### Client

| Variável | Descrição | Obrigatório | Padrão |
|---|---|---|---|
| `VITE_API_URL` | URL base da API consumida pelo frontend | Sim | `http://localhost:3333` |
| `VITE_APP_NAME` | Nome exibido na interface da aplicação | Não | `Biblioteca Academica` |

---

## Solução de Problemas

### Erro: "Cannot find module '@prisma/client'"

O cliente Prisma precisa ser gerado após a instalação das dependências:

```bash
cd server
npx prisma generate
```

### Erro de conexão com o banco de dados

Verifique se o PostgreSQL está em execução:

```bash
# Subir apenas o container do banco via Docker
docker-compose up postgres

# Ou criar o banco manualmente via psql
psql -U postgres -c "CREATE DATABASE project_library;"
```

Certifique-se de que a `DATABASE_URL` no `.env` aponta para o host, porta e credenciais corretos.

### Porta já em uso

Altere a variável `PORT` no `server/.env` ou o mapeamento de portas no `docker-compose.yml` para um valor disponível no sistema.

---

## Status do Projeto

O sistema encontra-se em fase final de desenvolvimento. As funcionalidades de autenticação, catálogo de livros, reservas e painel administrativo estão implementadas. Ajustes de interface, testes de integração e refinamentos de usabilidade estão em andamento.

Contribuições, relatos de bugs e sugestões podem ser enviados via Issues no repositório.

---

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

---

## Autor

Desenvolvido por PhoenixDev.

Última atualização: fevereiro de 2026.
