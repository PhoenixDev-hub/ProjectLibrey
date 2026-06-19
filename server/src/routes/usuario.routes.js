import { Router } from "express";
import { createUsuarioController, listarUsuariosController, atualizarUsuarioController } from "../controllers/usuarios.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router()

router.post("/", createUsuarioController)
router.get("/", autenticar, soBibliotecaria, listarUsuariosController)
router.put("/:id", autenticar, soBibliotecaria, atualizarUsuarioController)

export default router

