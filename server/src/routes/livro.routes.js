import { Router } from "express";
import { atualizarLivro, criarLivro, deletarLivro, listarLivros, obterLivroById } from "../controllers/livro.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { roleMiddleware, soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router();

// rotas GET — permitir PROFESSOR, BIBLIOTECARIA, ADMINISTRADOR
router.get("/", autenticar, roleMiddleware(["ALUNO", "PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"]), listarLivros);
router.get("/:id", autenticar, roleMiddleware(["ALUNO", "PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"]), obterLivroById);

// rotas POST, PUT, DELETE — apenas BIBLIOTECARIA, ADMINISTRADOR
router.post("/", autenticar, soBibliotecaria, criarLivro);
router.put("/:id", autenticar, soBibliotecaria, atualizarLivro);
router.delete("/:id", autenticar, soBibliotecaria, deletarLivro);

export default router;
