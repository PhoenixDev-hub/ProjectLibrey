import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { config } from "../config/env.js";

export async function criarUsuario(data) {
  const senhaHash = await bcrypt.hash(data.senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      ...data,
      senha: senhaHash,
    },
  });

  const token = jwt.sign(
    {
      id: usuario.id,
      tipoUsuario: usuario.tipoUsuario,
    },
    config.jwt.secret,
    { expiresIn: "7d" }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    },
  };
}
