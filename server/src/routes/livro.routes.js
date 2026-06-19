import { Router } from "express";
import { atualizarLivro, criarLivro, deletarLivro, listarLivros, obterLivroById } from "../controllers/livro.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router();


router.get("/", listarLivros);


router.get("/:id", obterLivroById);


router.post("/", autenticar, soBibliotecaria, criarLivro);


router.put("/:id", autenticar, soBibliotecaria, atualizarLivro);


router.delete("/:id", autenticar, soBibliotecaria, deletarLivro);

export default router;
