import { prisma } from "../../lib/prisma.js";
import logger from "../utils/logger.js";

export async function criarLivro(req, res, next) {
  try {
    const { titulo, autor, editora, anoPublicacao, isbn, area, sinopse } = req.body;

    const livro = await prisma.livro.create({
      data: {
        titulo,
        autor,
        editora,
        anoPublicacao,
        isbn,
        area: String(area),
        sinopse,
      },
    });

    logger.info(`Livro criado: ${livro.id}`, { livroId: livro.id });
    return res.status(201).json(livro);
  } catch (error) {
    logger.error("Erro ao criar livro", { error: error.message });
    next(error);
  }
}

export async function listarLivros(req, res, next) {
  try {
    const livros = await prisma.livro.findMany({
      include: {
        exemplares: true,
      },
    });

    return res.json(livros);
  } catch (error) {
    logger.error("Erro ao listar livros", { error: error.message });
    next(error);
  }
}

export async function obterLivroById(req, res, next) {
  try {
    const { id } = req.params;

    const livro = await prisma.livro.findUnique({
      where: { id },
      include: {
        exemplares: true,
      },
    });

    if (!livro) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    return res.json(livro);
  } catch (error) {
    logger.error("Erro ao obter livro", { error: error.message });
    next(error);
  }
}

export async function atualizarLivro(req, res, next) {
  try {
    const { id } = req.params;
    const { titulo, autor, editora, anoPublicacao, isbn, area, sinopse } = req.body;

    const livro = await prisma.livro.update({
      where: { id },
      data: {
        titulo,
        autor,
        editora,
        anoPublicacao,
        isbn,
        area,
        sinopse,
      },
    });

    logger.info(`Livro atualizado: ${livro.id}`, { livroId: livro.id });
    return res.json(livro);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Livro não encontrado" });
    }
    logger.error("Erro ao atualizar livro", { error: error.message });
    next(error);
  }
}

export async function deletarLivro(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.livro.delete({
      where: { id },
    });

    logger.info(`Livro deletado: ${id}`, { livroId: id });
    return res.json({ mensagem: "Livro deletado com sucesso" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Livro não encontrado" });
    }
    logger.error("Erro ao deletar livro", { error: error.message });
    next(error);
  }
}
