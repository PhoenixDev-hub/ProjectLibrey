import rateLimit from 'express-rate-limit';

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
};

const jsonHandler = (req, res, _next, options) =>
  res.status(options.statusCode ?? 429).json({
    error: 'Muitas requisições. Tente novamente em alguns minutos.',
  });

export const loginLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: jsonHandler,
});


const SPECIFIC_LIMITER_PATHS = [
  '/login',
  '/cadastro',
  '/verificar-email',
  '/reenviar-verificacao',
  '/password-reset',
  '/password-reset/request',
  '/password-reset/reset',
  '/auth/login',
  '/auth/cadastro',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verificar-email',
];

export const generalLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: jsonHandler,
  skip: (req) => SPECIFIC_LIMITER_PATHS.includes(req.path),
});

export const strictLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  max: 10,
  handler: jsonHandler,
});


export const cadastroLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  max: 3,
  handler: jsonHandler,
});

export const resetLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  max: 3,
  handler: jsonHandler,
});

export const verifyEmailLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: jsonHandler,
});
