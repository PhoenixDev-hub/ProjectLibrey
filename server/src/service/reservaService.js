import { prisma } from "../../lib/prisma.js";

async function criarReservas(usuarioId, livroId) {
    const exemplar = await prisma.exemplar.findFirst({
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

    const reservaExistente = await prisma.reserva.findFirst({
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

    const resultado = await prisma.$transaction(async (tx) => {
        const reserva = await tx.reserva.create({
            data: {
                usuarioId,
                exemplarId: exemplar.id,
                status: "PENDENTE"
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

        await tx.exemplar.update({
            where: {
                id: exemplar.id
            },
            data: {
                status: "RESERVADO"
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

        await tx.notificacao.createMany({
            data: bibliotecarias.map((bib) => ({
                usuariosId: bib.id,
                reservaId: reserva.id,
                tipo: "NOVA_RESERVA",
                titulo: `Nova reserva para ${reserva.exemplar.livro.titulo}`,
                mensagem: `O usuário ${reserva.usuario.nome} fez uma nova reserva para o livro ${reserva.exemplar.livro.titulo}.`
            }))
        });

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
            await tx.reserva.update({
                where: {
                    id: reservaId,
                },
                data: {
                    status: "REJEITADO",
                    aprovadoPor: bibliotecariaId,
                    aprovadoEm: new Date()
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
                    reservaId: reserva.id,
                    tipo: "RESERVA_REJEITADA",
                    titulo: `Reserva rejeitada para ${reserva.exemplar.livro.titulo}`,
                    mensagem: `Sua reserva para o livro ${reserva.exemplar.livro.titulo} foi rejeitada.`
                }
            });
        });
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
    const prazoDevol = new Date(now);
    prazoDevol.setDate(prazoDevol.getDate() + 30);

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
