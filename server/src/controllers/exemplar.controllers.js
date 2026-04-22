import { prisma } from "../../lib/prisma.js";
import logger from "../utils/logger.js";

export async function criarExemplar(req, res, next) {
  try {
    const { livroId, codigo, status } = req.body;

    const exemplar = await prisma.exemplar.create({
      data: {
        livroId,
        codigo,
        status: status || "DISPONIVEL",
      },
    });

    logger.info(`Exemplar criado: ${exemplar.id}`, { exemplarId: exemplar.id });
    return res.status(201).json(exemplar);
  } catch (error) {
    logger.error("Erro ao criar exemplar", { error: error.message });
    next(error);
  }
}

export async function listarExemplares(req, res, next) {
  try {
    const exemplares = await prisma.exemplar.findMany({
      include: {
        livro: true,
      },
    });

    return res.json(exemplares);
  } catch (error) {
    logger.error("Erro ao listar exemplares", { error: error.message });
    next(error);
  }
}

export async function obterExemplarById(req, res, next) {
  try {
    const { id } = req.params;

    const exemplar = await prisma.exemplar.findUnique({
      where: { id },
      include: {
        livro: true,
      },
    });

    if (!exemplar) {
      return res.status(404).json({ erro: "Exemplar não encontrado." });
    }

    return res.json(exemplar);
  } catch (error) {
    logger.error("Erro ao obter exemplar", { error: error.message });
    next(error);
  }
}

export async function atualizarExemplar(req, res, next) {
  try {
    const { id } = req.params;
    const { codigo, status } = req.body;

    const exemplar = await prisma.exemplar.update({
      where: { id },
      data: {
        codigo,
        status,
      },
    });

    logger.info(`Exemplar atualizado: ${exemplar.id}`, { exemplarId: exemplar.id });
    return res.json(exemplar);
  } catch (error) {
    logger.error("Erro ao atualizar exemplar", { error: error.message });
    next(error);
  }
}

export async function deletarExemplar(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.exemplar.delete({
      where: { id },
    });

    logger.info(`Exemplar deletado: ${id}`, { exemplarId: id });
    return res.status(204).send();
  } catch (error) {
    logger.error("Erro ao deletar exemplar", { error: error.message });
    next(error);
  }
}
