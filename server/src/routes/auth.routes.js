import { Router } from "express";
import { getCurrentUser, loginCadastro, logoutController, refreshTokenController } from "../controllers/auth.controllers.js";
import { autenticar as authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router()

router.post("/", loginCadastro)
router.post("/refresh", refreshTokenController)
router.post("/logout", logoutController)
router.get("/me", authMiddleware, getCurrentUser)

export default router;
