import { Router } from "express";
import { obterConfiguracoes, atualizarConfiguracoes } from "../controllers/configuracoes.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", autenticar, obterConfiguracoes);
router.put("/", autenticar, soBibliotecaria, atualizarConfiguracoes);

export default router;
