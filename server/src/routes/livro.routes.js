import { Router } from "express";
import { atualizarLivro, criarLivro, deletarLivro, listarLivros, obterLivroById } from "../controllers/livro.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { roleMiddleware, soBibliotecaria } from "../middlewares/role.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { atualizarLivroSchema, criarLivroSchema } from "../schemas/livro.schemas.js";

const router = Router();

router.get("/", autenticar, roleMiddleware(["ALUNO", "PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"]), listarLivros);
router.get("/:id", autenticar, roleMiddleware(["ALUNO", "PROFESSOR", "BIBLIOTECARIA", "ADMINISTRADOR"]), obterLivroById);

router.post("/", autenticar, soBibliotecaria, validationMiddleware(criarLivroSchema), criarLivro);
router.put("/:id", autenticar, soBibliotecaria, validationMiddleware(atualizarLivroSchema), atualizarLivro);
router.delete("/:id", autenticar, soBibliotecaria, deletarLivro);

export default router;
