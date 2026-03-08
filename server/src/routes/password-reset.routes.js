import { Router } from "express"
import {
    requestPasswordResetController,
    resetPasswordController,
    validatePasswordResetTokenController,
} from "../controllers/password-reset.controllers.js"
import { generalLimiter } from "../middlewares/rate-limit.middleware.js"
import { sendPasswordResetEmail } from "../utils/mailer.js"

const router = Router()



router.post("/", generalLimiter, requestPasswordResetController)


router.post("/request", generalLimiter, requestPasswordResetController)


router.post("/validate", validatePasswordResetTokenController)


router.post("/reset", generalLimiter, resetPasswordController)

router.post('/test', generalLimiter, async (req, res, next) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ error: 'Email é obrigatório' })
        const result = await sendPasswordResetEmail(email, 'dev-test-token', new Date(Date.now() + 60*60*1000))
        return res.status(200).json({ success: true, previewUrl: result ? result.previewUrl : null })
    } catch (err) {
        next(err)
    }
})

export default router
