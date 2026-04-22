import { Router } from "express";
import { getCurrentUser, loginCadastro } from "../controllers/auth.controllers.js";
import { autenticar as authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router()

router.post("/",  loginCadastro)
router.get("/me", authMiddleware, getCurrentUser)

export default router;
