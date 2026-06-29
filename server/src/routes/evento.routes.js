import { Router } from "express";
import { criarEvento, listarEventos } from "../controllers/evento.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", autenticar, listarEventos);
router.post("/", autenticar, soBibliotecaria, criarEvento);

export default router;
