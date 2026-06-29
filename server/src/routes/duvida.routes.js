
import { Router } from "express";
import { criarDuvida, listarDuvidas, resolverDuvida } from "../controllers/duvida.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/", autenticar, criarDuvida);
router.get("/", autenticar, listarDuvidas);
router.patch("/:id/resolver", autenticar, soBibliotecaria, resolverDuvida);

export default router;
