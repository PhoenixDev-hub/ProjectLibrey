import { ZodError } from 'zod';
import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Erro capturado:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map(e => ({
        campo: e.path.join('.'),
        mensagem: e.message,
        código: e.code
      }))
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Email já cadastrado'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Recurso não encontrado'
    });
  }

  if (err.message && err.message.includes('Token')) {
    return res.status(401).json({
      error: 'Token inválido ou expirado'
    });
  }

  if (err.message && err.message.includes('Credenciais')) {
    return res.status(401).json({
      error: 'Credenciais inválidas'
    });
  }

  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message;

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
