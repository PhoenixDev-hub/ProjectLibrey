import { ZodError } from 'zod'
import logger from '../utils/logger.js'


export function validationMiddleware(schema) {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.body ?? {})
      req.validatedData = validatedData
      next()
    } catch (error) {
      if (!(error instanceof ZodError)) return next(error)
      logger.warn('Validação falhou', {
        campos: error.issues.map(e => e.path.join('.') || '(raiz)'),
        regras: [...new Set(error.issues.map(e => e.code))],
      })
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.issues.map(e => ({
          campo: e.path.join('.'),
          mensagem: e.message,
          código: e.code,
        })),
      })
    }
  }
}
