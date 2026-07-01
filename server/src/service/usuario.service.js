import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { createAccessToken, createRefreshToken } from "./auth.service.js";

export async function criarUsuario(data) {
  const senhaHash = await bcrypt.hash(data.senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      ...data,
      senha: senhaHash,
    },
  });

  const token = createAccessToken(usuario);
  const refreshToken = await createRefreshToken(usuario.id);

  return {
    token,
    refreshToken,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    },
  };
}

export async function listarUsuarios() {
  const usuarios = await prisma.usuario.findMany({
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
      reservas: {
        select: {
          status: true,
        },
      },
    },
    orderBy: { nome: 'asc' },
  });

  return usuarios.map((user) => {
    const emprestimosCount = user.reservas.filter(r => r.status === "RETIRADO").length;
    const reservasCount = user.reservas.filter(r => ["PENDENTE", "APROVADO"].includes(r.status)).length;
    
    return {
      id: user.id,
      nome: `${user.nome} ${user.sobrenome}`.trim(),
      nomeSolo: user.nome,
      sobrenomeSolo: user.sobrenome,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
      status: user.status,
      anoSala: user.anoSala,
      anoInicioEnsinoMedio: user.anoInicioEnsinoMedio,
      telefone: user.telefone,
      dataCadastro: user.dataCadastro,
      emprestimos: emprestimosCount,
      reservas: reservasCount,
    };
  });
}

export async function atualizarUsuario(id, data) {
  const safeData = {};
  if (data.nome !== undefined) safeData.nome = data.nome;
  if (data.sobrenome !== undefined) safeData.sobrenome = data.sobrenome;
  if (data.email !== undefined) safeData.email = data.email;
  if (data.telefone !== undefined) safeData.telefone = data.telefone;
  if (data.anoSala !== undefined) safeData.anoSala = data.anoSala;
  if (data.anoInicioEnsinoMedio !== undefined) safeData.anoInicioEnsinoMedio = Number(data.anoInicioEnsinoMedio);
  if (data.tipoUsuario !== undefined) safeData.tipoUsuario = data.tipoUsuario;
  if (data.status !== undefined) safeData.status = data.status;

  if (data.senha) {
    safeData.senha = await bcrypt.hash(data.senha, 10);
  }

  const usuario = await prisma.usuario.update({
    where: { id: Number(id) },
    data: safeData,
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
  });

  return usuario;
}

export async function atualizarUsuarioStatus(id, status) {
  const usuario = await prisma.usuario.update({
    where: { id: Number(id) },
    data: { status },
    select: {
      id: true,
      nome: true,
      status: true,
    },
  });
  return usuario;
}
