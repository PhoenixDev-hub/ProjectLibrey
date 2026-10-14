import { prisma } from "../../lib/prisma.js";
import logger from "../utils/logger.js";

const CONFIG_ID = 1;

export async function obterConfiguracoes(req, res, next) {
  try {
    let config = await prisma.configuracao.findFirst({
      where: { id: CONFIG_ID }
    });

    if (!config) {
      config = await prisma.configuracao.create({
        data: {
          id: CONFIG_ID,
          prazoDevolucao: 30,
          limiteEmprestimos: 5,
          permitirRenovacao: true,
          nomeBiblioteca: "Biblioteca ProjectLibrey"
        }
      });
    }

    return res.json(config);
  } catch (error) {
    logger.error("Erro ao obter configurações", { error: error.message });
    next(error);
  }
}

export async function atualizarConfiguracoes(req, res, next) {
  try {
    // SEC-FIX (FIX 4): corpo validado/coerido pelo atualizarConfiguracoesSchema
    // (números já convertidos, permitirRenovacao já boolean, strings já trimmadas).
    const { 
      prazoDevolucao, 
      limiteEmprestimos, 
      permitirRenovacao, 
      nomeBiblioteca 
    } = req.validatedData;

    const config = await prisma.configuracao.upsert({
      where: { id: CONFIG_ID },
      // Campos undefined são ignorados pelo Prisma (atualização parcial).
      update: {
        prazoDevolucao,
        limiteEmprestimos,
        permitirRenovacao,
        nomeBiblioteca,
      },
      create: {
        id: CONFIG_ID,
        prazoDevolucao: prazoDevolucao ?? 30,
        limiteEmprestimos: limiteEmprestimos ?? 5,
        permitirRenovacao: permitirRenovacao ?? true,
        nomeBiblioteca: nomeBiblioteca ?? "Biblioteca ProjectLibrey",
      }
    });

    logger.info(`Configurações da biblioteca atualizadas por ${req.usuario.id}`);
    return res.json(config);
  } catch (error) {
    logger.error("Erro ao atualizar configurações", { error: error.message });
    next(error);
  }
}
