import bcrypt from "bcrypt"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { prisma } from "../../lib/prisma.js"
import { config } from "../config/env.js"

export function createAccessToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      tipoUsuario: usuario.tipoUsuario,
    },
    config.jwt.secret,
    { expiresIn: "15m" }
  )
}

export async function createRefreshToken(usuarioId) {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

  await prisma.refreshToken.create({
    data: {
      token,
      usuarioId,
      expiresAt,
    },
  })

  return token
}

function createUnauthorizedRefreshTokenError() {
  const err = new Error("Refresh token inválido ou expirado")
  err.status = 401
  return err
}

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

  if (usuario.emailVerificado === false) {
    return {
      requireVerification: true,
      email: usuario.email
    }
  }

  const token = createAccessToken(usuario)
  const refreshToken = await createRefreshToken(usuario.id)

  return {
    token,
    refreshToken,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    },
  }
}

export async function refreshTokenService(refreshToken) {
  if (!refreshToken) {
    throw createUnauthorizedRefreshTokenError()
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  })

  if (!storedToken) {
    throw createUnauthorizedRefreshTokenError()
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } })
    throw createUnauthorizedRefreshTokenError()
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: storedToken.usuarioId },
  })

  if (!usuario || usuario.status !== "ATIVO") {
    throw createUnauthorizedRefreshTokenError()
  }

  const accessToken = createAccessToken(usuario)
  const newRefreshToken = await createRefreshToken(usuario.id)

  await prisma.refreshToken.delete({ where: { id: storedToken.id } })

  return {
    token: accessToken,
    refreshToken: newRefreshToken,
  }
}

export async function logoutService(refreshToken) {
  if (!refreshToken) {
    return
  }

  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  })
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

export async function verifyEmailService(email, code) {
  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario) {
    throw new Error("Usuário não encontrado")
  }
  if (usuario.emailVerificado) {
    return { message: "E-mail já está verificado" }
  }
  if (usuario.codigoVerificacao !== code) {
    throw new Error("Código de verificação inválido")
  }
  if (usuario.codigoVerificacaoExp < new Date()) {
    throw new Error("Código de verificação expirado")
  }

  await prisma.usuario.update({
    where: { email },
    data: {
      emailVerificado: true,
      codigoVerificacao: null,
      codigoVerificacaoExp: null
    }
  })

  // We could auto-login them here and return tokens, but let's just return success so the frontend redirects to login or logs them in.
  // Actually, returning a token here makes the UX smoother!
  const token = createAccessToken(usuario)
  const refreshToken = await createRefreshToken(usuario.id)

  return {
    message: "E-mail verificado com sucesso",
    token,
    refreshToken,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    }
  }
}

export async function resendVerificationService(email) {
  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario) {
    throw new Error("Usuário não encontrado")
  }
  if (usuario.emailVerificado) {
    throw new Error("E-mail já está verificado")
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.usuario.update({
    where: { email },
    data: {
      codigoVerificacao: code,
      codigoVerificacaoExp: expiresAt
    }
  })

  const { sendVerificationEmail } = await import("../utils/mailer.js");
  await sendVerificationEmail(usuario.email, code);

  return { message: "Código reenviado com sucesso" }
}
