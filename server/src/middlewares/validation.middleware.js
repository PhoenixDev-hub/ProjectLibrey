import logger from "../utils/logger.js"

export function validationMiddleware(schema) {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.body)
      req.validatedData = validatedData
      next()
    } catch (error) {
      logger.warn('Validação falhou', { errors: error.errors })
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors || error.message,
      })
    }
  }
}
