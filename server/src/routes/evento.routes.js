import { Router } from "express";
import { criarEvento, listarEventos } from "../controllers/evento.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { criarEventoSchema } from "../schemas/evento.schemas.js";

const router = Router();

router.get("/", autenticar, listarEventos);
router.post("/", autenticar, soBibliotecaria, validationMiddleware(criarEventoSchema), criarEvento);

export default router;
