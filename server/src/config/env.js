function validateEnv() {
  if (!process.env.JWT_SECRET) {
    console.error('\x1b[31m✖ ERRO FATAL: JWT_SECRET não definido. Defina a variável no arquivo .env antes de iniciar o servidor.\x1b[0m')
    process.exit(1)
  }

  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM', 'FRONTEND_URL'];
    const missing = required.filter(v => !process.env[v]);

    if (missing.length) {
      throw new Error(`Variáveis de ambiente faltando para produção: ${missing.join(', ')}\nVerifique seu arquivo .env`);
    }
  } else {
    if (!process.env.DATABASE_URL) {
      console.warn('\x1b[33m⚠ AVISO: DATABASE_URL não definido. O projeto pode não conectar ao banco.\x1b[0m');
    }
  }
}

export const config = {
  database: {
    url: process.env.DATABASE_URL || null
  },
  jwt: {
    secret: process.env.JWT_SECRET,
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
