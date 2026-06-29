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
    const { 
      prazoDevolucao, 
      limiteEmprestimos, 
      permitirRenovacao, 
      nomeBiblioteca 
    } = req.body;

    const config = await prisma.configuracao.upsert({
      where: { id: CONFIG_ID },
      update: {
        prazoDevolucao: prazoDevolucao !== undefined ? Number(prazoDevolucao) : undefined,
        limiteEmprestimos: limiteEmprestimos !== undefined ? Number(limiteEmprestimos) : undefined,
        permitirRenovacao: permitirRenovacao !== undefined ? Boolean(permitirRenovacao) : undefined,
        nomeBiblioteca: nomeBiblioteca !== undefined ? nomeBiblioteca.trim() : undefined,
      },
      create: {
        id: CONFIG_ID,
        prazoDevolucao: prazoDevolucao !== undefined ? Number(prazoDevolucao) : 30,
        limiteEmprestimos: limiteEmprestimos !== undefined ? Number(limiteEmprestimos) : 5,
        permitirRenovacao: permitirRenovacao !== undefined ? Boolean(permitirRenovacao) : true,
        nomeBiblioteca: nomeBiblioteca !== undefined ? nomeBiblioteca.trim() : "Biblioteca ProjectLibrey",
      }
    });

    logger.info(`Configurações da biblioteca atualizadas por ${req.usuario.id}`);
    return res.json(config);
  } catch (error) {
    logger.error("Erro ao atualizar configurações", { error: error.message });
    next(error);
  }
}
