import cors from "cors"
import "dotenv/config"
import express from "express"
import helmet from "helmet"
import { prisma } from "./lib/prisma.js"
import { initConfig } from "./src/config/env.js"
import { verifyEmailController, resendVerificationController, getCurrentUser, logoutController, refreshTokenController, updateCurrentUser } from "./src/controllers/auth.controllers.js"
import { requestPasswordResetController, resetPasswordController } from "./src/controllers/password-reset.controllers.js"
import verificarPrazos from "./src/cronjobs/verificarPrazos.js"
import { autenticar } from "./src/middlewares/auth.middleware.js"
import { errorHandler } from "./src/middlewares/error.middleware.js"
import { cadastroLimiter, generalLimiter, loginLimiter, resetLimiter, verifyEmailLimiter } from "./src/middlewares/rate-limit.middleware.js"
import authRoutes from "./src/routes/auth.routes.js"
import configuracoesRoutes from "./src/routes/configuracoes.routes.js"
import duvidaRoutes from "./src/routes/duvida.routes.js"
import eventoRoutes from "./src/routes/evento.routes.js"
import exemplarRoutes from "./src/routes/exemplar.routes.js"
import livroRoutes from "./src/routes/livro.routes.js"
import notificacaoRoutes from "./src/routes/notificacaoRoutes.js"
import passwordResetRoutes from "./src/routes/password-reset.routes.js"
import reservaRoutes from "./src/routes/reservaRoutes.js"
import usuarioRoutes from "./src/routes/usuario.routes.js"
import logger from "./src/utils/logger.js"

const config = initConfig()
const app = express()

// SEC-FIX (FIX 1): IP real atrás de proxy reverso/exata.
// TRUST_PROXY_HOPS = número de hops entre o client e o Express.
// Ex.: 1 = um proxy (nginx/ALB); 0 = sem proxy (default seguro).
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1))

// SEC-FIX (FIX 2): expor cabeçalhos de rate limit ao browser (CORS).
app.disable('x-powered-by')

// SEC-FIX (FIX 2): security headers (Helmet + CSP).
// Nota: aplicados em respostas da API; se o client for servido pelo mesmo
// origin (nginx), configure CSP equivalente no bloco de assets do proxy.
const isProd = config.server.nodeEnv === 'production'
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https://covers.openlibrary.org", "https://books.google.com", "https://books.googleusercontent.com"],
      connectSrc: ["'self'", "https://openlibrary.org", "https://www.googleapis.com"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // HSTS apenas em produção (não faz sentido em http://localhost).
  ...(isProd
    ? { hsts: { maxAge: 31536000, includeSubDomains: true, preload: true } }
    : { hsts: false }),
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}))

// SEC-FIX (FIX 2): CORS restritivo — origin validado contra allowlist.
// Requisições sem header Origin (curl, server-to-server) são permitidas.
const allowedOrigins = config.cors.origin
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    const err = new Error(`Origin não permitido por CORS: ${origin}`)
    err.status = 403
    return callback(err)
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-CSRF-Token'],
  exposedHeaders: [
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
    'RateLimit-Policy',
    'Retry-After',
  ],
  optionsSuccessStatus: 204,
  maxAge: 600,
}))

app.use(express.json())

// SEC-FIX (FIX 1): fallback global de rate limit, ANTES das rotas para cobrir
app.use(generalLimiter)


app.use("/auth/login", loginLimiter, authRoutes)
app.use("/auth/cadastro", cadastroLimiter, usuarioRoutes)
app.post("/auth/forgot-password", resetLimiter, requestPasswordResetController)
app.post("/auth/reset-password", resetLimiter, resetPasswordController)
app.post("/auth/verificar-email", verifyEmailLimiter, verifyEmailController)
app.use("/cadastro", cadastroLimiter, usuarioRoutes)
app.use("/login", loginLimiter, authRoutes)
app.post("/verificar-email", verifyEmailLimiter, verifyEmailController)
app.post("/reenviar-verificacao", verifyEmailLimiter, resendVerificationController)
app.post("/auth/refresh", refreshTokenController)
app.post("/auth/logout", logoutController)
app.get("/me", autenticar, getCurrentUser)
app.put("/me", autenticar, updateCurrentUser)
app.use("/usuarios", autenticar, usuarioRoutes)
app.use("/password-reset", passwordResetRoutes)
app.use("/livros", livroRoutes)
app.use("/exemplares", exemplarRoutes)


app.use("/notificacoes", autenticar, notificacaoRoutes)
app.use("/reservas", autenticar, reservaRoutes)
app.use("/duvidas", autenticar, duvidaRoutes)
app.use("/configuracoes", autenticar, configuracoesRoutes)
app.use("/eventos", autenticar, eventoRoutes)


app.get("/", (req, res) => {
  res.json({
    message: "API ProjectLibrary rodando com sucesso!",
    version: "1.0.0",
    status: "online"
  })
})

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// SEC-FIX (FIX 1): o generalLimiter já é aplicado globalmente antes das rotas.
app.use(errorHandler)


process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason })
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('SIGTERM', async () => {
  logger.info('SIGTERM recebido, encerrando servidor...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT recebido, encerrando servidor...')
  await prisma.$disconnect()
  process.exit(0)
})


app.listen(config.server.port, () => {
  logger.info(`Servidor rodando na porta ${config.server.port}`)
  logger.info(`Ambiente: ${config.server.nodeEnv}`)
  logger.info(`http://localhost:${config.server.port}`)

  prisma.$queryRaw`SELECT 1`
    .then(() => {
      logger.info('Banco de dados conectado com sucesso')
      verificarPrazos()
    })
    .catch((err) => {
      logger.error('Erro ao conectar no banco de dados', err)
      process.exit(1)
    })
})
