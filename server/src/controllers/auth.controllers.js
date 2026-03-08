import { loginSchema } from "../schemas/auth.schemas.js";
import { getCurrentUserService, loginService } from "../service/auth.service.js";
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
    const usuarioId = req.user.id;
    const usuario = await getCurrentUserService(usuarioId);

    return res.json(usuario);
  } catch (error) {
    logger.error('Erro ao obter dados do usuário', { usuarioId: req.user.id, error: error.message });
    next(error);
  }
}
