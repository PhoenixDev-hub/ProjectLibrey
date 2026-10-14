import { ZodError } from 'zod'
import logger from '../utils/logger.js'

// SEC-FIX (FIX 4): middleware de validação de corpo com Zod.
// - Sucesso: grava o objeto validado/transformado em req.validatedData.
// - Erro de validação: 400 com details no mesmo formato do errorHandler.
// - Erros não-Zod são repassados ao next(error) (não mascarados como 400).
export function validationMiddleware(schema) {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.body ?? {})
      req.validatedData = validatedData
      next()
    } catch (error) {
      if (!(error instanceof ZodError)) return next(error)
      // SEC-FIX (FIX 4): loga apenas campos/regras — nunca os valores
      // recebidos (evita PII/segredos nos logs, cf. FIX 3). A chave evita
      // 'codigo*' de propósito: o redator do FIX 3 a mascararia (subcadeia).
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
