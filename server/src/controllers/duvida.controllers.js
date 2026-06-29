import { prisma } from "../../lib/prisma.js";
import logger from "../utils/logger.js";

export async function criarDuvida(req, res, next) {
  try {
    const { duvida } = req.body;

    if (!duvida || duvida.trim() === "") {
      return res.status(400).json({ error: "O texto da dúvida é obrigatório." });
    }

    const novaDuvida = await prisma.duvida.create({
      data: {
        usuarioId: req.usuario.id,
        duvida: duvida.trim(),
      },
      include: {
        usuario: {
          select: {
            nome: true,
            sobrenome: true,
            email: true,
            anoSala: true,
            telefone: true,
          }
        }
      }
    });

    // Notify all active librarians and administrators
    const bibliotecarias = await prisma.usuario.findMany({
      where: {
        tipoUsuario: { in: ['BIBLIOTECARIA', 'ADMINISTRADOR'] },
        status: 'ATIVO',
      },
    });

    if (bibliotecarias.length > 0) {
      const displayDoubt = duvida.length > 60 ? `${duvida.substring(0, 60)}...` : duvida;
      await prisma.notificacao.createMany({
        data: bibliotecarias.map((bib) => ({
          usuarioId: bib.id,
          tipo: "DUVIDA",
          titulo: "Nova dúvida recebida",
          mensagem: `${req.usuario.nome} (${req.usuario.anoSala || "Leitor"}) enviou uma dúvida: "${displayDoubt}"`,
        })),
      });
    }

    logger.info(`Dúvida criada: ${novaDuvida.id} pelo usuário ${req.usuario.id}`);
    return res.status(201).json(novaDuvida);
  } catch (error) {
    logger.error("Erro ao criar dúvida", { error: error.message });
    next(error);
  }
}

export async function listarDuvidas(req, res, next) {
  try {
    const ehBibliotecaria = ["BIBLIOTECARIA", "ADMINISTRADOR"].includes(req.usuario.tipoUsuario);

    let duvidas;
    if (ehBibliotecaria) {
      // Librarians see all doubts
      duvidas = await prisma.duvida.findMany({
        include: {
          usuario: {
            select: {
              nome: true,
              sobrenome: true,
              email: true,
              anoSala: true,
              telefone: true,
            }
          }
        },
        orderBy: [
          { resolvida: "asc" },
          { createdAt: "desc" }
        ]
      });
    } else {
      // Students see only their own doubts
      duvidas = await prisma.duvida.findMany({
        where: {
          usuarioId: req.usuario.id,
        },
        orderBy: {
          createdAt: "desc",
        }
      });
    }

    return res.json(duvidas);
  } catch (error) {
    logger.error("Erro ao listar dúvidas", { error: error.message });
    next(error);
  }
}

export async function resolverDuvida(req, res, next) {
  try {
    const { id } = req.params;
    const { resposta } = req.body;

    const duvidaExistente = await prisma.duvida.findUnique({
      where: { id },
    });

    if (!duvidaExistente) {
      return res.status(404).json({ error: "Dúvida não encontrada." });
    }

    const duvidaAtualizada = await prisma.duvida.update({
      where: { id },
      data: {
        resolvida: true,
        resolvidaEm: new Date(),
        resposta: resposta ? resposta.trim() : null,
      },
    });

    // Notify the student that their doubt has been handled/responded
    await prisma.notificacao.create({
      data: {
        usuarioId: duvidaExistente.usuarioId,
        tipo: "DUVIDA_RESOLVIDA",
        titulo: "Sua dúvida foi respondida!",
        mensagem: resposta
          ? `A bibliotecária respondeu sua dúvida: "${resposta.substring(0, 60)}..."`
          : `A bibliotecária registrou contato para tirar sua dúvida.`,
      }
    });

    logger.info(`Dúvida resolvida: ${id} por ${req.usuario.id}`);
    return res.json(duvidaAtualizada);
  } catch (error) {
    logger.error("Erro ao resolver dúvida", { error: error.message });
    next(error);
  }
}
