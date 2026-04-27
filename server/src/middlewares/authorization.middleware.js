import logger from "../utils/logger.js"

export function authorizationMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "Usuário não autenticado" })
    }

    if (allowedRoles.length === 0) {
      return next()
    }

    if (!allowedRoles.includes(req.usuario.tipoUsuario)) {
      logger.warn('Acesso negado', {
        usuarioId: req.usuario.id,
        tipoUsuario: req.usuario.tipoUsuario,
        rolesPermitidas: allowedRoles,
      })
      return res.status(403).json({
        error: "Acesso negado. Permissão insuficiente",
      })
    }

    next()
  }
}
