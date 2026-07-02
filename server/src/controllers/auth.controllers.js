import { loginSchema } from "../schemas/auth.schemas.js";
import { getCurrentUserService, loginService, logoutService, refreshTokenService, verifyEmailService, resendVerificationService } from "../service/auth.service.js";
import { atualizarUsuario } from "../service/usuario.service.js";
import logger from "../utils/logger.js";

export async function loginCadastro(req, res, next) {
  try {
    const { email, password, senha } = req.body;
    const finalPassword = password || senha;


    const validatedData = loginSchema.parse({
      email,
      password: finalPassword,
    });

    const result = await loginService(validatedData.email, validatedData.password);

    logger.info('Login realizado com sucesso', { email: validatedData.email });

    return res.json(result);
  } catch (error) {
    logger.warn('Tentativa de login falhada', { email: req.body.email, error: error.message });
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const usuario = await getCurrentUserService(usuarioId);

    return res.json(usuario);
  } catch (error) {
    logger.error('Erro ao obter dados do usuário', { usuarioId: req.usuario.id, error: error.message });
    next(error);
  }
}

export async function refreshTokenController(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await refreshTokenService(refreshToken);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function logoutController(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await logoutService(refreshToken);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentUser(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { nome, sobrenome, email, telefone } = req.body;

    const usuario = await atualizarUsuario(usuarioId, { nome, sobrenome, email, telefone });

    logger.info(`Perfil do usuário atualizado: ${usuarioId}`);
    return res.json(usuario);
  } catch (error) {
    logger.error('Erro ao atualizar dados do usuário', { usuarioId: req.usuario.id, error: error.message });
    next(error);
  }
}

export async function verifyEmailController(req, res, next) {
  try {
    const { email, code } = req.body;
    const result = await verifyEmailService(email, code);
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function resendVerificationController(req, res, next) {
  try {
    const { email } = req.body;
    const result = await resendVerificationService(email);
    return res.json(result);
  } catch (error) {
    next(error);
  }
}
