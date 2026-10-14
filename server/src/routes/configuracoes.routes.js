import { Router } from "express";
import { obterConfiguracoes, atualizarConfiguracoes } from "../controllers/configuracoes.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";
// SEC-FIX (FIX 4): validação de corpo com Zod (VALID-02).
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { atualizarConfiguracoesSchema } from "../schemas/configuracoes.schemas.js";

const router = Router();

router.get("/", autenticar, obterConfiguracoes);
router.put("/", autenticar, soBibliotecaria, validationMiddleware(atualizarConfiguracoesSchema), atualizarConfiguracoes);

export default router;
