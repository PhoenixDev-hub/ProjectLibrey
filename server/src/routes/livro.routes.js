import { Router } from "express";
import { atualizarLivro, criarLivro, deletarLivro, listarLivros, obterLivroById } from "../controllers/livro.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router();

// Listar todos os livros (público)
router.get("/", listarLivros);

// Obter livro por ID (público)
router.get("/:id", obterLivroById);

// Criar livro (apenas bibliotecária/admin)
router.post("/", autenticar, soBibliotecaria, criarLivro);

// Atualizar livro (apenas bibliotecária/admin)
router.put("/:id", autenticar, soBibliotecaria, atualizarLivro);

// Deletar livro (apenas bibliotecária/admin)
router.delete("/:id", autenticar, soBibliotecaria, deletarLivro);

export default router;
