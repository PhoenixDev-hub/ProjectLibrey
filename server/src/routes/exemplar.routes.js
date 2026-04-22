import { Router } from "express";
import { atualizarExemplar, criarExemplar, deletarExemplar, listarExemplares, obterExemplarById } from "../controllers/exemplar.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router();

// Listar todos os exemplares (público)
router.get("/", listarExemplares);

// Obter exemplar por ID (público)
router.get("/:id", obterExemplarById);

// Criar exemplar (apenas bibliotecária/admin)
router.post("/", autenticar, soBibliotecaria, criarExemplar);

// Atualizar exemplar (apenas bibliotecária/admin)
router.put("/:id", autenticar, soBibliotecaria, atualizarExemplar);

// Deletar exemplar (apenas bibliotecária/admin)
router.delete("/:id", autenticar, soBibliotecaria, deletarExemplar);

export default router;
