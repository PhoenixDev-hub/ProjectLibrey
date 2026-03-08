import cors from "cors"
import "dotenv/config"
import express from "express"
import { prisma } from "./lib/prisma.js"
import { initConfig } from "./src/config/env.js"
import { errorHandler } from "./src/middlewares/error.middleware.js"
import { generalLimiter, loginLimiter, strictLimiter } from "./src/middlewares/rate-limit.middleware.js"
import authRoutes from "./src/routes/auth.routes.js"
import passwordResetRoutes from "./src/routes/password-reset.routes.js"
import usuarioRoutes from "./src/routes/usuario.routes.js"
import logger from "./src/utils/logger.js"

const config = initConfig()

const app = express()


app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 204,
}))

app.use(express.json())


app.use(generalLimiter)

app.use("/cadastro", strictLimiter, usuarioRoutes)
app.use("/login", loginLimiter, authRoutes)
app.use("/password-reset", generalLimiter, passwordResetRoutes)

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

app.use(errorHandler)

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

app.listen(config.server.port, () => {
  logger.info(`Servidor rodando na porta ${config.server.port}`)
  logger.info(`Ambiente: ${config.server.nodeEnv}`)
  logger.info(`http://localhost:${config.server.port}`)

  prisma.$queryRaw`SELECT 1`.then(() => {
    logger.info('Banco de dados conectado com sucesso')
  }).catch((err) => {
    logger.error('Erro ao conectar no banco de dados', err)
  })
})
