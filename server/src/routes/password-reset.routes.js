import { Router } from "express"
import {
    requestPasswordResetController,
    resetPasswordController,
    validatePasswordResetTokenController,
} from "../controllers/password-reset.controllers.js"
// SEC-FIX (FIX 1): resetLimiter (3/1h) nas rotas sensíveis; a rota /validate
// (somente leitura de token) fica coberta pelo generalLimiter global.
import { resetLimiter } from "../middlewares/rate-limit.middleware.js"

const router = Router()

router.post("/", resetLimiter, requestPasswordResetController)

router.post("/request", resetLimiter, requestPasswordResetController)

router.post("/validate", validatePasswordResetTokenController)

router.post("/reset", resetLimiter, resetPasswordController)

export default router
