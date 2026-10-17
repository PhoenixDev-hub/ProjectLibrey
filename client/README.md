# ProjectLibrey Front-end

Interface web do ProjectLibrey, construída com React e Vite. Esta aplicação consome a API do back-end e entrega as telas de login, cadastro, verificação de e-mail, recuperação de senha, catálogo, empréstimos, reservas, análise literária, leitores, configurações e central de ajuda.

## Responsabilidades

- Renderizar a interface principal do sistema (login, cadastro e dashboard).
- Controlar rotas públicas e privadas.
- Consumir a API REST do back-end via Axios (com cookies e CSRF).
- Manter a sessão do usuário (refresh automático em `401`).
- Exibir abas do dashboard filtradas pelo perfil do usuário.
- Permitir reservas, favoritos, consulta ao catálogo e gestão administrativa.

## Perfis e Abas do Dashboard

O perfil (`tipoUsuario`) vem do back-end e controla quais abas aparecem no dashboard (`DashboardShell.jsx`):

| Aba | `id` | Aluno | Professor | Bibliotecária | Administrador |
|---|---|---|---|---|---|
| Início | `inicio` | ✅ | ✅ | ✅ | ✅ |
| Catálogo | `catalogo` | ✅ | ✅ | ✅ | ✅ |
| Empréstimos | `emprestimos` | ✅ | — | ✅ | ✅ |
| Reservas | `reservas` | ✅ | — | ✅ | ✅ |
| Análise Literária | `analise-literaria` | — | ✅ | ✅ | ✅ |
| Central de ajuda | `ajuda` | ✅ | — | ✅ | ✅ |
| Leitores | `leitores` | — | — | ✅ | ✅ |
| Configurações | `configuracoes` | — | — | ✅ | ✅ |

O filtro do front-end é apenas de interface: todas as regras de permissão são aplicadas novamente no back-end.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 | Interface |
| Vite | Build e servidor dev |
| React Router | Rotas (com lazy loading da área logada) |
| Tailwind CSS | Estilos (via plugin `@tailwindcss/vite`) |
| Axios | HTTP client com interceptadores |
| Lucide React | Ícones |
| JWT Decode | Leitura de JWT (opcional; a sessão vive em cookies) |

## Estrutura

```txt
client/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   │   └── layout/          # DashboardShell, Header, Sidebar, Layout, calendar, modais
│   ├── constants/
│   │   └── enums.js         # TipoUsuario e Status
│   ├── contexts/
│   │   ├── AuthContext.jsx  # Sessão, login/logout, refresh
│   │   ├── authContext.js   # Criação do contexto (compatibilidade)
│   │   └── DashboardContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useBiblioteca.js
│   │   └── useBookCover.js  # Capas com cache
│   ├── pages/
│   │   ├── Auth/            # Login, Cadastro, ForgotPassword, ResetPassword
│   │   └── Dashboard/
│   │       ├── Home.jsx     # Switch das abas
│   │       └── components/  # Inicio, Catalogo, Emprestimos, Reservas, AnaliseLiteraria, Leitores, Ajuda, Configuracoes
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   └── PrivateRoute.jsx
│   ├── services/
│   │   ├── api.js           # Instância Axios e interceptadores
│   │   └── auth.service.js  # Login, cadastro e verificação de e-mail
│   └── styles/
│       └── globals.css
├── index.html
├── eslint.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Instalação

```bash
cd client
npm install
```

## Variáveis de Ambiente

Crie `client/.env.local` quando precisar sobrescrever a URL da API:

```env
VITE_API_URL=http://localhost:3333
```

Se a variável não existir, o client usa `http://localhost:3333` por padrão (`src/services/api.js`).

## Execução

Desenvolvimento:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview do build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Rotas da Aplicação

| Rota | Tela | Acesso |
|---|---|---|
| `/` | Login | Público |
| `/login` | Login | Público |
| `/cadastro` | Cadastro | Público |
| `/esqueci-senha` | Solicitar reset | Público |
| `/reset-password` | Redefinir senha | Público (usa o `#token` do e-mail) |
| `/dashboard` | Dashboard (aba Início) | Autenticado |
| `/dashboard/:tab` | Dashboard com a aba indicada | Autenticado |
| `/leitores`, `/catalogo`, `/emprestimos`, `/reservas`, `/ajuda`, `/configuracoes` | Redirect para `/dashboard/<aba>` | Autenticado |

## Fluxo de Autenticação

1. O usuário faz login (`POST /login`).
2. A API responde com `usuario` e define cookies httpOnly (`access_token`, `refresh_token`, `csrf_token`).
3. Nada de tokens é gravado em `localStorage` — o JS nunca lê os tokens.
4. Axios envia os cookies (`withCredentials`) e espelha o cookie `csrf_token` no cabeçalho `X-CSRF-Token` das mutações (POST/PUT/PATCH/DELETE — double-submit).
5. Em `401`, o interceptor renova a sessão via `POST /auth/refresh` (cookie `refresh_token`), repete a fila de requisições pendentes e refaz a chamada original.
6. Se o refresh falhar (`401`/`403`), o interceptor dispara o evento `unauthorized` e a sessão é encerrada.
7. Em logout, o servidor apaga os cookies e o refresh token no banco.

O `AuthContext` carrega o usuário atual via `GET /me` e o `PrivateRoute` bloqueia `/dashboard` para visitantes.

## Serviços

| Arquivo | Responsabilidade |
|---|---|
| `src/services/api.js` | Instância Axios (base URL, cookies, CSRF e interceptadores de 401/refresh) |
| `src/services/auth.service.js` | Login, cadastro, verificação de e-mail e reenvio de código |

A recuperação de senha não tem serviço próprio: as telas `pages/Auth/ForgotPassword.jsx` (envio, `POST /password-reset`) e `pages/Auth/ResetPassword.jsx` (validação e redefine, `POST /password-reset/validate` e `/password-reset/reset`) chamam a API diretamente.

## Contextos

| Arquivo | Responsabilidade |
|---|---|
| `src/contexts/AuthContext.jsx` | Sessão: usuário atual, login, logout, verificação de e-mail |
| `src/contexts/DashboardContext.jsx` | Estado global do dashboard: abas, tema claro/escuro, notificações, dados e ações (livros, reservas, usuários, dúvidas, eventos, configurações) |
| `src/contexts/authContext.js` | Cria o objeto de contexto compartilhado, importado por `AuthContext.jsx` (e reutilizado por `useAuth`) |

## Hooks

| Arquivo | Responsabilidade |
|---|---|
| `src/hooks/useAuth.js` | Acesso conveniente ao `AuthContext` |
| `src/hooks/useBiblioteca.js` | Estado de carregamento/erro e listagem de livros |
| `src/hooks/useBookCover.js` | Busca de capas por título/autor no Open Library e Google Books, com cache em `localStorage` (`book_cover_v3:*`) e deduplicação de requisições |

## Dashboard

O dashboard usa abas internas controladas por `DashboardContext`, com a URL sincronizada (`/dashboard/:tab`). O `DashboardShell` renderiza a sidebar com as abas já filtradas pelo perfil do usuário (tabela acima). O header global oferece busca, alternância de tema claro/escuro, sino de notificações (marcar como lida / marcar todas) e menu de perfil (configurações de conta, ajuda e sair).

## Catálogo

O catálogo exibe livros do banco e possui:

- Busca por título, autor e área.
- Reserva rápida (para Aluno/Bibliotecária/Administrador, conforme as regras do back-end).
- Favoritos para alunos (guardados no `localStorage`, por usuário).
- Modal de detalhes do livro.
- Capas buscadas em serviços externos (Open Library e Google Books) com cache local no navegador.

## Integração com Back-end

O front-end espera que a API esteja disponível em `http://localhost:3333`. Para alterar:

```env
VITE_API_URL=http://outra-url-da-api
```

O back-end precisa permitir a origem do front-end (variável `CORS_ORIGIN` no `server/.env`). A documentação completa de rotas e permissões está em [../server/README.md](../server/README.md).

## Build de Produção

```bash
npm run build
```

O resultado fica em `client/dist/`. O Vite separa os chunks em `vendor`, `auth` e `dashboard` (configurado em `vite.config.js`), e a área logada usa lazy loading.

Esse diretório pode ser servido por Nginx, Caddy, Apache ou outro servidor estático.

## Problemas Comuns

### Tela branca

Abra o console do navegador e verifique erros JavaScript. Depois rode:

```bash
npm run build
```

### É derrubado da sessão imediatamente

Verifique se o back-end está rodando e se `CORS_ORIGIN` inclui a origem do front-end (`http://localhost:5173`). Sem cookies/CSRF corretos, as requisições mutantes recebem `403`.

### API não responde

Verifique se o back-end está rodando:

```txt
http://localhost:3333/health
```

### Porta 5173 ocupada

```bash
npm run dev -- --port 5174
```

### Capas não aparecem

As capas são buscadas em serviços externos (Open Library/Google Books). Verifique a internet do navegador e limpe o cache com `Ctrl + F5` (as capas ficam em `localStorage`).
