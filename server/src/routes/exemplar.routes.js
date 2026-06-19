import { Router } from "express";
import { atualizarExemplar, criarExemplar, deletarExemplar, listarExemplares, obterExemplarById } from "../controllers/exemplar.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router();


router.get("/", listarExemplares);


router.get("/:id", obterExemplarById);


router.post("/", autenticar, soBibliotecaria, criarExemplar);


router.put("/:id", autenticar, soBibliotecaria, atualizarExemplar);


router.delete("/:id", autenticar, soBibliotecaria, deletarExemplar);

export default router;
