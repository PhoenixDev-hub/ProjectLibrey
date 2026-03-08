import { requestPasswordResetSchema, resetPasswordSchema } from "../schemas/auth.schemas.js"
import {
    requestPasswordReset,
    resetPassword,
    validatePasswordResetToken,
} from "../service/password-reset.service.js"
import logger from "../utils/logger.js"


export async function requestPasswordResetController(req, res, next) {
  try {
    const { email } = req.body


    const validatedData = requestPasswordResetSchema.parse({ email })

    const result = await requestPasswordReset(validatedData.email)

    logger.info('Solicitação de reset de senha recebida', {
      email: validatedData.email,
      resetSent: result.resetSent,
    })


    return res.status(200).json({
      message: result.message,
      ...(process.env.NODE_ENV === 'development' && result._devToken && { _devToken: result._devToken }),
      ...(process.env.NODE_ENV === 'development' && result._devPreviewUrl && { _devPreviewUrl: result._devPreviewUrl }),
    })
  } catch (error) {
    logger.warn('Erro ao solicitar reset de senha', { error: error.message })
    next(error)
  }
}


export async function validatePasswordResetTokenController(req, res, next) {
  try {
    const { token, email } = req.body

    if (!token || !email) {
      return res.status(400).json({
        error: 'Token e email são obrigatórios',
      })
    }

    const result = await validatePasswordResetToken(token, email)

    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        error: result.message,
      })
    }

    return res.status(200).json({
      valid: true,
      message: result.message,
      expiresAt: result.expiresAt,
    })
  } catch (error) {
    logger.error('Erro ao validar token de reset', { error: error.message })
    next(error)
  }
}


export async function resetPasswordController(req, res, next) {
  try {
    const { token, email, novaSenha, confirmarSenha } = req.body


    const validatedData = resetPasswordSchema.parse({
      token,
      email,
      novaSenha,
      confirmarSenha,
    })

    const result = await resetPassword(
      validatedData.token,
      validatedData.email,
      validatedData.novaSenha
    )

    logger.info('Senha resetada com sucesso', { email: validatedData.email })

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    logger.warn('Erro ao resetar senha', { error: error.message })
    next(error)
  }
}
