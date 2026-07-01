
import logger from "../utils/logger.js"

export function roleMiddleware(perfisPermitidos = []) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "Usuário não autenticado" })
    }

    if (perfisPermitidos.length === 0) {
      return next()
    }

    if (!perfisPermitidos.includes(req.usuario.tipoUsuario)) {
      logger.warn("Acesso negado", {
        usuarioId: req.usuario.id,
        tipoUsuario: req.usuario.tipoUsuario,
        rolesPermitidas: perfisPermitidos,
      })
      return res.status(403).json({
        error: "Acesso negado. Permissão insuficiente",
      })
    }

    next()
  }
}

export const soBibliotecaria = roleMiddleware(["BIBLIOTECARIA", "ADMINISTRADOR"])
export const authorizationMiddleware = roleMiddleware
