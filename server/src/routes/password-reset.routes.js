import { Router } from "express"
import {
    requestPasswordResetController,
    resetPasswordController,
    validatePasswordResetTokenController,
} from "../controllers/password-reset.controllers.js"
import { resetLimiter } from "../middlewares/rate-limit.middleware.js"

const router = Router()

router.post("/", resetLimiter, requestPasswordResetController)

router.post("/request", resetLimiter, requestPasswordResetController)

router.post("/validate", validatePasswordResetTokenController)

router.post("/reset", resetLimiter, resetPasswordController)

export default router
