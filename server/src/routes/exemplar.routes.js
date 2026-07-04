import { Router } from "express";
import { atualizarExemplar, criarExemplar, deletarExemplar, listarExemplares, obterExemplarById } from "../controllers/exemplar.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { roleMiddleware, soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router();

// Apenas GET permitido para PROFESSOR
router.get("/", autenticar, roleMiddleware(["ALUNO", "PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"]), listarExemplares);
router.get("/:id", autenticar, roleMiddleware(["ALUNO", "PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"]), obterExemplarById);

// Apenas BIBLIOTECARIA e ADMINISTRADOR
router.post("/", autenticar, soBibliotecaria, criarExemplar);
router.put("/:id", autenticar, soBibliotecaria, atualizarExemplar);
router.delete("/:id", autenticar, soBibliotecaria, deletarExemplar);

export default router;
