# ProjectLibrey Front-end

Interface web do ProjectLibrey, construída com React e Vite. Esta aplicação consome a API do back-end e entrega as telas de login, cadastro, catálogo, reservas, empréstimos, leitores, configurações e ajuda.

## Responsabilidades

- Renderizar a interface principal do sistema.
- Controlar rotas públicas e privadas.
- Consumir a API REST do back-end.
- Manter sessão do usuário via token JWT.
- Exibir dashboards por perfil de usuário.
- Permitir reservas, favoritos e consulta ao catálogo.
- Fornecer telas administrativas para bibliotecária/admin.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 | Interface |
| Vite | Build e servidor dev |
| React Router | Rotas |
| Tailwind CSS | Estilos |
| Axios | HTTP client |
| Lucide React | Ícones |
| JWT Decode | Leitura de JWT |

## Estrutura

```txt
client/
├── src/
│   ├── components/
│   │   └── layout/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   │   ├── Auth/
│   │   └── Dashboard/
│   ├── routes/
│   ├── services/
│   └── styles/
├── index.html
├── package.json
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

Se a variável não existir, o client usa `http://localhost:3333` por padrão.

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
| `/reset-password` | Redefinir senha | Público |
| `/dashboard` | Sistema principal | Autenticado |

## Fluxo de Autenticação

1. O usuário faz login.
2. O front-end recebe o token da API.
3. O token é salvo no `localStorage`.
4. Axios injeta `Authorization: Bearer <token>` nas requisições.
5. Rotas privadas validam se o usuário está autenticado.
6. Em logout, o token é removido.

## Serviços

| Arquivo | Responsabilidade |
|---|---|
| `src/services/api.js` | Instância Axios e interceptadores |
| `src/services/auth.service.js` | Login e cadastro |
| `src/services/password.service.js` | Recuperação de senha |

## Contextos

| Arquivo | Responsabilidade |
|---|---|
| `src/contexts/AuthContext.jsx` | Sessão e autenticação |
| `src/contexts/DashboardContext.jsx` | Estado do dashboard, dados e ações globais |

## Dashboard

O dashboard usa abas internas controladas por `DashboardContext`.

Principais áreas:

- Início
- Catálogo
- Empréstimos
- Reservas
- Central de ajuda
- Leitores
- Configurações

As abas de administração são filtradas conforme o perfil do usuário.

## Catálogo

O catálogo exibe livros do banco e possui:

- Busca por título, autor e área.
- Coleções por categoria.
- Favoritos para alunos.
- Reserva rápida.
- Modal de detalhes.
- Capas buscadas por título/autor em serviços externos.
- Cache local de capas no navegador.

## Integração com Back-end

O front-end espera que a API esteja disponível em:

```txt
http://localhost:3333
```

Para alterar:

```env
VITE_API_URL=http://outra-url-da-api
```

## Build de Produção

```bash
npm run build
```

O resultado fica em:

```txt
client/dist/
```

Esse diretório pode ser servido por Nginx, Caddy, Apache ou outro servidor estático.

## Problemas Comuns

### Tela branca

Abra o console do navegador e verifique erros JavaScript. Depois rode:

```bash
npm run build
```

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

As capas são buscadas em serviços externos. Verifique a internet do navegador e limpe o cache com `Ctrl + F5`.
