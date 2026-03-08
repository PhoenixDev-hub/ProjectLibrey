function validateEnv() {
  const env = process.env.NODE_ENV || 'development';


  if (env === 'production') {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM', 'FRONTEND_URL'];
    const missing = required.filter(v => !process.env[v]);
    if (missing.length) {
      throw new Error(`Variáveis de ambiente faltando para produção: ${missing.join(', ')}\nVerifique seu arquivo .env`);
    }
  } else {

    const warnings = [];
    if (!process.env.JWT_SECRET) warnings.push('JWT_SECRET (usando valor padrão de desenvolvimento)');
    if (!process.env.DATABASE_URL) warnings.push('DATABASE_URL (sem conexão com DB)');
    if (warnings.length) {


      console.warn('Aviso de ambiente:', warnings.join('; '));
    }
  }
}

export const config = {
  database: {
    url: process.env.DATABASE_URL || null
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    expiresIn: '7d'
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 3333,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(url => url.trim()) : ['http://localhost:5173', 'http://localhost:3000']
  }
};

// Email / Mailer settings
config.email = {
  smtpHost: process.env.SMTP_HOST || null,
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : null,
  smtpUser: process.env.SMTP_USER || null,
  smtpPass: process.env.SMTP_PASS || null,
  from: process.env.EMAIL_FROM || null,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}

export function initConfig() {
  validateEnv();
  return config;
}
