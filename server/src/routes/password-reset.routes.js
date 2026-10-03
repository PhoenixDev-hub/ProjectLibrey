import { Router } from "express"
import {
    requestPasswordResetController,
    resetPasswordController,
    validatePasswordResetTokenController,
} from "../controllers/password-reset.controllers.js"
import { generalLimiter } from "../middlewares/rate-limit.middleware.js"

const router = Router()



router.post("/", generalLimiter, requestPasswordResetController)


router.post("/request", generalLimiter, requestPasswordResetController)


router.post("/validate", validatePasswordResetTokenController)


router.post("/reset", generalLimiter, resetPasswordController)

export default router
