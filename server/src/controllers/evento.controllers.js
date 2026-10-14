import { prisma } from "../../lib/prisma.js";
import logger from "../utils/logger.js";

export async function listarEventos(req, res, next) {
  try {
    const eventos = await prisma.evento.findMany({
      orderBy: { date: "asc" }
    });
    return res.json(eventos);
  } catch (error) {
    logger.error("Erro ao listar eventos", { error: error.message });
    next(error);
  }
}

export async function criarEvento(req, res, next) {
  try {
    // SEC-FIX (FIX 4): corpo validado pelo criarEventoSchema (validationMiddleware).
    // SEC-FIX: removido o check manual `if (!title || !date || !type) -> 400`
    // porque a validação de presença/formato acontece no schema, antes deste ponto.
    const { title, date, type } = req.validatedData;

    const evento = await prisma.evento.create({
      data: {
        title,
        date,
        type
      }
    });

    logger.info(`Evento criado: ${evento.id}`, { eventoId: evento.id });
    return res.status(201).json(evento);
  } catch (error) {
    logger.error("Erro ao criar evento", { error: error.message });
    next(error);
  }
}
