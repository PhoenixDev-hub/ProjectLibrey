import { createUsuarioSchema } from "../schemas/usuario.schemas.js";
import { criarUsuario } from "../service/usuario.service.js";

export async function createUsuarioController(req, res) {
  try {
    const data = createUsuarioSchema.parse(req.body);
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
