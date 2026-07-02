import { createUsuarioAdminSchema, createUsuarioSchema } from "../schemas/usuario.schemas.js";
import { criarUsuario, listarUsuarios, atualizarUsuario } from "../service/usuario.service.js";
import logger from "../utils/logger.js";

export async function createUsuarioController(req, res, next) {
  try {
    const isAdmin = req.baseUrl === "/usuarios";
    const schema = isAdmin ? createUsuarioAdminSchema : createUsuarioSchema;
    const data = schema.parse({
      tipoUsuario: "ALUNO",
      ...req.body,
    });
    const result = await criarUsuario(data, isAdmin);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listarUsuariosController(req, res, next) {
  try {
    const users = await listarUsuarios();
    return res.json(users);
  } catch (error) {
    logger.error("Erro ao listar usuários", { error: error.message });
    next(error);
  }
}

export async function atualizarUsuarioController(req, res, next) {
  try {
    const { id } = req.params;
    const user = await atualizarUsuario(id, req.body);
    return res.json(user);
  } catch (error) {
    logger.error("Erro ao atualizar usuário", { error: error.message });
    next(error);
  }
}
