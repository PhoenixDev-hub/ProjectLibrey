import { Router } from "express";
import { createUsuarioController, listarUsuariosController, atualizarUsuarioController, listarProfessoresController } from "../controllers/usuarios.controllers.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { soBibliotecaria } from "../middlewares/role.middleware.js";

const router = Router()

const protegerCriacaoAdministrativa = (req, res, next) => {
  if (req.baseUrl !== "/usuarios") {
    return next()
  }

  return soBibliotecaria(req, res, next)
}

router.post("/", protegerCriacaoAdministrativa, createUsuarioController)
router.get("/", autenticar, soBibliotecaria, listarUsuariosController)
router.get("/professores", autenticar, listarProfessoresController)
router.put("/:id", autenticar, soBibliotecaria, atualizarUsuarioController)

export default router
