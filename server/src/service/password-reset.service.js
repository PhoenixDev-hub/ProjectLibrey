import bcrypt from "bcrypt"
import crypto from "crypto"
import { prisma } from "../../lib/prisma.js"
import logger from "../utils/logger.js"
import { sendPasswordResetEmail } from "../utils/mailer.js"


export async function requestPasswordReset(email) {
  try {

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })


    if (!usuario) {
      logger.warn('Tentativa de reset com email inexistente', { email })
      return {
        message: "Se o email existe em nosso sistema, você receberá instruções para resetar a senha",
        resetSent: false,
      }
    }

    if (usuario.status !== "ATIVO") {
      logger.warn('Tentativa de reset com usuário inativo', { email })
      return {
        message: "Se o email existe em nosso sistema, você receberá instruções para resetar a senha",
        resetSent: false,
      }
    }


    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = await bcrypt.hash(resetToken, 10)


    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordReset.deleteMany({
      where: {
        usuarioId: usuario.id,
        usedAt: null,
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    await prisma.passwordReset.create({
      data: {
        token: hashedToken,
        usuarioId: usuario.id,
        expiresAt,
      },
    })

    logger.info('Token de reset de senha gerado', { email, expiresAt })
    try {
      const sendResult = await sendPasswordResetEmail(usuario.email, resetToken, expiresAt)
      logger.info('Tentativa de envio de email de reset executada', { email: usuario.email })
      if (process.env.NODE_ENV === 'development' && sendResult && sendResult.previewUrl) {
        return {
          message: "Se o email existe em nosso sistema, você receberá instruções para resetar a senha",
          resetSent: true,
          _devToken: resetToken,
          _devPreviewUrl: sendResult.previewUrl,
        }
      }
    } catch (err) {
      logger.error('Falha ao enviar email de reset (não será exibido ao usuário)', { email: usuario.email, error: err.message })
    }

    if (process.env.NODE_ENV === "development") {
      logger.debug('Token de reset (DEV)', { token: resetToken })
      return {
        message: "Se o email existe em nosso sistema, você receberá instruções para resetar a senha",
        resetSent: true,
        _devToken: resetToken,
      }
    }

    return {
      message: "Se o email existe em nosso sistema, você receberá instruções para resetar a senha",
      resetSent: true,
    }
  } catch (error) {
    logger.error('Erro ao solicitar reset de senha', { email, error: error.message })
    throw new Error("Erro ao processar solicitação de reset")
  }
}


export async function resetPassword(token, email, novaSenha) {
  try {

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) {
      logger.warn('Tentativa de reset com email inexistente', { email })
      throw new Error("Email ou token inválido")
    }


    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        usuarioId: usuario.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!passwordReset) {
      logger.warn('Tentativa de reset com token inválido ou expirado', { email })
      throw new Error("Token expirado ou inválido")
    }


    const tokenValido = await bcrypt.compare(token, passwordReset.token)

    if (!tokenValido) {
      logger.warn('Token de reset não corresponde', { email })
      throw new Error("Token inválido")
    }


    const hashNovaSenha = await bcrypt.hash(novaSenha, 10)


    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: hashNovaSenha },
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { usedAt: new Date() },
      }),
    ])

    logger.info('Senha resetada com sucesso', { email })

    return {
      success: true,
      message: "Senha atualizada com sucesso",
    }
  } catch (error) {
    logger.error('Erro ao resetar senha', { email, error: error.message })
    throw error
  }
}


export async function validatePasswordResetToken(token, email) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) {
      return { valid: false, message: "Email não encontrado" }
    }

    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        usuarioId: usuario.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!passwordReset) {
      return { valid: false, message: "Token expirado ou inválido" }
    }

    const tokenValido = await bcrypt.compare(token, passwordReset.token)

    if (!tokenValido) {
      return { valid: false, message: "Token inválido" }
    }

    return {
      valid: true,
      message: "Token válido",
      expiresAt: passwordReset.expiresAt,
    }
  } catch (error) {
    logger.error('Erro ao validar token de reset', { email, error: error.message })
    return { valid: false, message: "Erro ao validar token" }
  }
}
