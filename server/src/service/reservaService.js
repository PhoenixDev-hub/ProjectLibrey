import { prisma } from "../../lib/prisma.js";

async function criarReservas(usuarioId, livroId, tipoReserva = "LEITURA_PESSOAL", professorId = null) {
    const resultado = await prisma.$transaction(async (tx) => {
        const reservaExistente = await tx.reserva.findFirst({
            where: {
                usuarioId,
                exemplar: {
                    livroId
                },
                status: { in: ["PENDENTE", "APROVADO", "RETIRADO"] }
            }
        });

        if (reservaExistente) {
            throw new Error("Você já tem uma reserva ativa para este livro");
        }

        const config = await tx.configuracao.findFirst({ where: { id: 1 } });
        const limite = config ? config.limiteEmprestimos : 5;

        const totalAtivas = await tx.reserva.count({
            where: {
                usuarioId,
                status: { in: ["PENDENTE", "APROVADO", "RETIRADO"] }
            }
        });

        if (totalAtivas >= limite) {
            throw new Error(`Você atingiu o limite de ${limite} reservas/empréstimos ativos simultâneos.`);
        }

        const exemplar = await tx.exemplar.findFirst({
            where: {
                livroId,
                status: "DISPONIVEL"
            },
            include: {
                livro: true
            }
        });

        if (!exemplar) {
            throw new Error("Nenhum exemplar disponível para reserva");
        }

        const exemplarAtualizado = await tx.exemplar.updateMany({
            where: {
                id: exemplar.id,
                status: "DISPONIVEL"
            },
            data: {
                status: "RESERVADO"
            }
        });

        if (exemplarAtualizado.count !== 1) {
            throw new Error("Este exemplar acabou de ser reservado. Tente novamente.");
        }

        const reserva = await tx.reserva.create({
            data: {
                usuarioId,
                exemplarId: exemplar.id,
                status: "PENDENTE",
                tipoReserva,
                professorId: professorId || null
            },
            include: {
                usuario: true,
                exemplar: {
                    include: {
                        livro: true,
                    }
                }
            }
        });

        const bibliotecarias = await tx.usuario.findMany({
            where: {
                tipoUsuario: {
                    in: [
                        "BIBLIOTECARIA", "ADMINISTRADOR"
                    ],
                },
                status: "ATIVO"
            }
        });

        if (bibliotecarias.length > 0) {
            await tx.notificacao.createMany({
                data: bibliotecarias.map((bib) => ({
                    usuarioId: bib.id,
                    reservaId: reserva.id,
                    tipo: "NOVA_RESERVA",
                    titulo: `Nova reserva para ${reserva.exemplar.livro.titulo}`,
                    mensagem: `O usuário ${reserva.usuario.nome} fez uma nova reserva para o livro ${reserva.exemplar.livro.titulo}.`
                }))
            });
        }

        return reserva;
    });

    return resultado;
}

async function atualizarStatusReserva(reservaId, bibliotecariaId, acao) {
    const reserva = await prisma.reserva.findUnique({
        where: {
            id: reservaId
        },
        include: {
            usuario: true,
            exemplar: {
                include: {
                    livro: true
                }
            }
        }
    });

    if (!reserva) {
        throw new Error("Reserva não encontrada");
    }

    if (reserva.status !== "PENDENTE") {
        throw new Error("Apenas reservas pendentes podem ser atualizadas");
    }

    if (acao === "APROVAR") {
        await prisma.$transaction(async (tx) => {
            await tx.reserva.update({
                where: {
                    id: reservaId
                },
                data: {
                    status: "APROVADO",
                    aprovadoPor: bibliotecariaId,
                    aprovadoEm: new Date()
                }
            });

            await tx.notificacao.create({
                data: {
                    usuarioId: reserva.usuarioId,
                    reservaId: reserva.id,
                    tipo: "RESERVA_APROVADA",
                    titulo: `Reserva aprovada para ${reserva.exemplar.livro.titulo}`,
                    mensagem: `Sua reserva para o livro ${reserva.exemplar.livro.titulo} foi aprovada.`
                }
            });
        });
    } else if (acao === "REJEITAR") {
        await prisma.$transaction(async (tx) => {
            await tx.notificacao.deleteMany({
                where: {
                    reservaId: reservaId
                }
            });

            await tx.reserva.delete({
                where: {
                    id: reservaId
                }
            });

            await tx.exemplar.update({
                where: {
                    id: reserva.exemplarId
                },
                data: {
                    status: "DISPONIVEL"
                }
            });

            await tx.notificacao.create({
                data: {
                    usuarioId: reserva.usuarioId,
                    reservaId: null,
                    tipo: "RESERVA_REJEITADA",
                    titulo: `Reserva rejeitada para ${reserva.exemplar.livro.titulo}`,
                    mensagem: `Sua reserva para o livro ${reserva.exemplar.livro.titulo} foi rejeitada.`
                }
            });
        });
    } else {
        const err = new Error("Ação inválida para atualização de reserva");
        err.status = 400;
        throw err;
    }
}

async function registrarRetirada(reservaId) {
    const reserva = await prisma.reserva.findUnique({
        where: {
            id: reservaId
        },
        include: {
            usuario: true,
            exemplar: {
                include: {
                    livro: true
                }
            }
        }
    });

    if (!reserva) {
        throw new Error("Reserva não encontrada");
    }
    if (reserva.status !== "APROVADO") {
        throw new Error("Apenas reservas aprovadas podem ser retiradas");
    }

    const now = new Date();
    const config = await prisma.configuracao.findFirst({ where: { id: 1 } });
    const diasPrazo = config ? config.prazoDevolucao : 30;

    const prazoDevol = new Date(now);
    prazoDevol.setDate(prazoDevol.getDate() + diasPrazo);

    await prisma.$transaction(async (tx) => {
        await tx.reserva.update({
            where: {
                id: reservaId
            },
            data: {
                status: "RETIRADO",
                retiradoEm: now,
                prazoDevol
            }
        });

        await tx.notificacao.create({
            data: {
                usuarioId: reserva.usuarioId,
                reservaId: reserva.id,
                tipo: "RESERVA_RETIRADA",
                titulo: `Reserva retirada para ${reserva.exemplar.livro.titulo}`,
                mensagem: `Você retirou o livro ${reserva.exemplar.livro.titulo}. O prazo de devolução é ${prazoDevol.toLocaleDateString()}.`
            }
        });
    });
}

async function registrarDevolucao(reservaId) {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: { exemplar: { include: { livro: true } }, usuario: true }
  })

  if (!reserva) throw new Error('Reserva não encontrada.')
  if (reserva.status !== 'RETIRADO') throw new Error('Livro não está em posse do aluno.')

  await prisma.$transaction(async (tx) => {
    await tx.reserva.update({
      where: { id: reservaId },
      data: { status: 'DEVOLVIDO', devolvidoEm: new Date() }
    })

    await tx.exemplar.update({
      where: { id: reserva.exemplarId },
      data: { status: 'DISPONIVEL' }
    })
  })
}

export { atualizarStatusReserva, criarReservas, registrarDevolucao, registrarRetirada };
