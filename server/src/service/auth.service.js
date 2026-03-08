import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../../lib/prisma.js"
import { config } from "../config/env.js"

export async function loginService(email, senha) {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  })

  if (!usuario) {
    throw new Error("Credenciais inválidas")
  }

  if (usuario.status !== "ATIVO") {
    throw new Error("Usuário inativo")
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha)

  if (!senhaCorreta) {
    throw new Error("Credenciais inválidas")
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      tipoUsuario: usuario.tipoUsuario
    },
    config.jwt.secret,
    { expiresIn: "7d" }
  )

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    },
  }
}

export async function getCurrentUserService(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      email: true,
      tipoUsuario: true,
      status: true,
      anoSala: true,
      anoInicioEnsinoMedio: true,
      telefone: true,
      dataCadastro: true,
    },
  })

  if (!usuario) {
    throw new Error("Usuário não encontrado")
  }

  if (usuario.status !== "ATIVO") {
    throw new Error("Usuário inativo")
  }

  return usuario
}
