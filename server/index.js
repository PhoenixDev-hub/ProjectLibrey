import cors from "cors"
import "dotenv/config"
import express from "express"
import { prisma } from "./lib/prisma.js"
import { initConfig } from "./src/config/env.js"
import verificarPrazos from "./src/cronjobs/verificarPrazos.js"
import { autenticar } from "./src/middlewares/auth.middleware.js"
import { errorHandler } from "./src/middlewares/error.middleware.js"
import { generalLimiter, loginLimiter, strictLimiter } from "./src/middlewares/rate-limit.middleware.js"
import authRoutes from "./src/routes/auth.routes.js"
import exemplarRoutes from "./src/routes/exemplar.routes.js"
import livroRoutes from "./src/routes/livro.routes.js"
import notificacaoRoutes from "./src/routes/notificacaoRoutes.js"
import passwordResetRoutes from "./src/routes/password-reset.routes.js"
import reservaRoutes from "./src/routes/reservaRoutes.js"
import usuarioRoutes from "./src/routes/usuario.routes.js"
import logger from "./src/utils/logger.js"

const config = initConfig()
const app = express()

// ── Middlewares globais ────────────────────────────────────────────
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 204,
}))

app.use(express.json())
app.use(generalLimiter)

// ── Rotas públicas ─────────────────────────────────────────────────
app.use("/cadastro", strictLimiter, usuarioRoutes)
app.use("/login", loginLimiter, authRoutes)
app.use("/password-reset", generalLimiter, passwordResetRoutes)
app.use("/livros", generalLimiter, livroRoutes)
app.use("/exemplares", generalLimiter, exemplarRoutes)

// ── Rotas protegidas ───────────────────────────────────────────────
app.use("/notificacoes", autenticar, notificacaoRoutes)
app.use("/reservas", autenticar, reservaRoutes)

// ── Rotas de sistema ───────────────────────────────────────────────
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

// ── Error handler (sempre por último) ─────────────────────────────
app.use(errorHandler)

// ── Tratamento de exceções globais ─────────────────────────────────
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

// ── Inicialização ──────────────────────────────────────────────────
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
