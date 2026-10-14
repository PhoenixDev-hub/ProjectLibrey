import { Router } from "express";
import { criarEvento, listarEventos } from "../controllers/evento.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";
// SEC-FIX (FIX 4): validação de corpo com Zod (VALID-02).
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { criarEventoSchema } from "../schemas/evento.schemas.js";

const router = Router();

router.get("/", autenticar, listarEventos);
router.post("/", autenticar, soBibliotecaria, validationMiddleware(criarEventoSchema), criarEvento);

export default router;
