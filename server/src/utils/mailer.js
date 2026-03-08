import nodemailer from 'nodemailer'
import logger from './logger.js'

const SMTP_HOST = process.env.SMTP_HOST || null
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : null
const SMTP_USER = process.env.SMTP_USER || null
const SMTP_PASS = process.env.SMTP_PASS || null
let EMAIL_FROM = process.env.EMAIL_FROM || null
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

let transporter = null
let usingEthereal = false

async function initTransporter() {
  if (transporter) return transporter

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
    return transporter
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
      usingEthereal = true
      if (!EMAIL_FROM) EMAIL_FROM = testAccount.user
      logger.info('Ethereal account created for development email testing', { user: testAccount.user })
      return transporter
    } catch (err) {
      logger.error('Failed to create Ethereal test account', { error: err.message })
      return null
    }
  }

  logger.warn('Mailer não configurado: variáveis SMTP ausentes; emails não serão enviados')
  return null
}

export async function sendPasswordResetEmail(to, token, expiresAt) {
  const t = await initTransporter()
  if (!t) return { info: null, previewUrl: null }

  const resetLink = `${FRONTEND_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`
  const expires = expiresAt ? new Date(expiresAt).toLocaleString() : 'em breve'

  const subject = 'Redefinição de senha - ProjectLibrary'
  const text = `Você solicitou a redefinição de senha. Acesse o link abaixo para redefinir (expira em ${expires}): ${resetLink}`
  const html = `<p>Você solicitou a redefinição de senha.</p><p>Clique no link abaixo para redefinir sua senha (expira em ${expires}):</p><p><a href="${resetLink}">${resetLink}</a></p>`

  try {
    const info = await t.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html,
    })
    let previewUrl = null
    if (usingEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info)
      logger.info('Email de reset enviado (Ethereal preview)', { to, messageId: info.messageId, previewUrl })
    } else {
      logger.info('Email de reset enviado', { to, messageId: info.messageId })
    }
    return { info, previewUrl }
  } catch (error) {
    logger.error('Erro ao enviar email de reset', { to, error: error.message })
    throw error
  }
}

export default { sendPasswordResetEmail }
