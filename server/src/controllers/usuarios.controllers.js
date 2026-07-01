import { createUsuarioAdminSchema, createUsuarioSchema } from "../schemas/usuario.schemas.js";
import { criarUsuario, listarUsuarios, atualizarUsuario } from "../service/usuario.service.js";

export async function createUsuarioController(req, res) {
  try {
    const schema = req.baseUrl === "/usuarios" ? createUsuarioAdminSchema : createUsuarioSchema;
    const data = schema.parse({
      tipoUsuario: "ALUNO",
      ...req.body,
    });
    const result = await criarUsuario(data);

    return res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    if (error.errors) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
}

export async function listarUsuariosController(req, res, next) {
  try {
    const users = await listarUsuarios();
    return res.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    next(error);
  }
}

export async function atualizarUsuarioController(req, res, next) {
  try {
    const { id } = req.params;
    const user = await atualizarUsuario(id, req.body);
    return res.json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    next(error);
  }
}
