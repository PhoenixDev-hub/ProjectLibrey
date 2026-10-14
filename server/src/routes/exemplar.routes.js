import { Router } from "express";
import { atualizarExemplar, criarExemplar, deletarExemplar, listarExemplares, obterExemplarById } from "../controllers/exemplar.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { roleMiddleware, soBibliotecaria } from "../middlewares/role.middleware.js";
// SEC-FIX (FIX 4): validação de corpo com Zod (VALID-02).
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { atualizarExemplarSchema, criarExemplarSchema } from "../schemas/exemplar.schemas.js";

const router = Router();

// Apenas GET permitido para PROFESSOR
router.get("/", autenticar, roleMiddleware(["ALUNO", "PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"]), listarExemplares);
router.get("/:id", autenticar, roleMiddleware(["ALUNO", "PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"]), obterExemplarById);

// Apenas BIBLIOTECARIA e ADMINISTRADOR
router.post("/", autenticar, soBibliotecaria, validationMiddleware(criarExemplarSchema), criarExemplar);
router.put("/:id", autenticar, soBibliotecaria, validationMiddleware(atualizarExemplarSchema), atualizarExemplar);
router.delete("/:id", autenticar, soBibliotecaria, deletarExemplar);

export default router;
