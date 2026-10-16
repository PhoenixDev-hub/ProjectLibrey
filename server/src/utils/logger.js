import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const SENSITIVE_KEY_PATTERN =
  /(password|senha|token|authorization|cookie|codigo|secret|apikey|api_key|private_key|cpf|creditcard|cartao)/i;
const EMAIL_KEY_PATTERN = /^(email|to|user|from|cc|bcc|replyto|destinatario|remetente)$/i;
const PHONE_KEY_PATTERN = /^(telefone|phone|celular|whatsapp|fone)$/i;

const RESERVED_KEYS = new Set(['level', 'message', 'timestamp', 'service', 'stack']);

const MAX_DEPTH = 5;

const maskEmail = (value) => {
  if (value === null || value === undefined) return value;
  const str = String(value);
  const at = str.indexOf('@');
  if (at < 1) return `${str.charAt(0)}***`;
  const local = str.slice(0, at);
  const domain = str.slice(at);
  const last = local.length > 1 ? local.charAt(local.length - 1) : '';
  return `${local.charAt(0)}***${last}${domain}`;
};

const maskPhone = (value) => {
  if (value === null || value === undefined) return value;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `***${digits.slice(-4)}`;
};

const redactDeep = (value, depth = 0) => {
  if (value === null || typeof value !== 'object') return value;
  if (depth >= MAX_DEPTH) return '[MAX_DEPTH]';
  if (Array.isArray(value)) return value.map((item) => redactDeep(item, depth + 1));

  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      out[key] = '[REDACTED]';
    } else if (EMAIL_KEY_PATTERN.test(key)) {
      out[key] = typeof val === 'string' ? maskEmail(val) : redactDeep(val, depth + 1);
    } else if (PHONE_KEY_PATTERN.test(key)) {
      out[key] = typeof val === 'string' ? maskPhone(val) : redactDeep(val, depth + 1);
    } else if (val !== null && typeof val === 'object') {
      out[key] = redactDeep(val, depth + 1);
    } else {
      out[key] = val;
    }
  }
  return out;
};

const redactionFormat = winston.format((info) => {
  for (const key of Object.keys(info)) {
    if (RESERVED_KEYS.has(key)) continue;
    const value = info[key];
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      info[key] = '[REDACTED]';
    } else if (EMAIL_KEY_PATTERN.test(key)) {
      info[key] = typeof value === 'string' ? maskEmail(value) : redactDeep(value);
    } else if (PHONE_KEY_PATTERN.test(key)) {
      info[key] = typeof value === 'string' ? maskPhone(value) : redactDeep(value);
    } else if (value !== null && typeof value === 'object') {
      info[key] = redactDeep(value);
    }
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    redactionFormat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'project-library-api' },
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '14d',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    ),
  }));
}

export default logger;
