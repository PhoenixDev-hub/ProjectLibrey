import { Router } from "express";
import { createUsuarioController } from "../controllers/usuarios.controllers.js";

const router = Router()

router.post("/", createUsuarioController)

export default router
