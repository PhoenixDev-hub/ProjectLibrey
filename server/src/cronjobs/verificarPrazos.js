// src/cronjobs/verificarPrazos.js
import cron from 'node-cron'
import { prisma } from '../../lib/prisma.js'

async function verificarPrazos() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  // 1. Livros com vencimento HOJE
  const vencendoHoje = await prisma.reserva.findMany({
    where: {
      status: 'RETIRADO',
      prazoDevol: { gte: hoje, lt: amanha }
    },
    include: {
      usuario: true,
      exemplar: { include: { livro: true } }
    }
  })

  for (const reserva of vencendoHoje) {
    // Evita notificação duplicada no mesmo dia
    const jaNotificado = await prisma.notificacao.findFirst({
      where: {
        reservaId: reserva.id,
        tipo: 'VENCIMENTO_HOJE',
        createdAt: { gte: hoje }
      }
    })

    if (!jaNotificado) {
      await prisma.notificacao.create({
        data: {
          usuarioId: reserva.usuarioId,
          reservaId: reserva.id,
          tipo: 'VENCIMENTO_HOJE',
          titulo: 'Devolução hoje!',
          mensagem: `O prazo de devolução de "${reserva.exemplar.livro.titulo}" vence hoje. Devolva na biblioteca.`
        }
      })
    }
  }

  // 2. Livros em ATRASO (prazo já passou)
  const emAtraso = await prisma.reserva.findMany({
    where: {
      status: 'RETIRADO',
      prazoDevol: { lt: hoje }
    },
    include: {
      usuario: true,
      exemplar: { include: { livro: true } },
      notificacoes: {
        where: { tipo: 'EM_ATRASO', createdAt: { gte: hoje } }
      }
    }
  })

  // Busca bibliotecárias para também notificar sobre atrasos
  const bibliotecarias = await prisma.usuario.findMany({
    where: { tipoUsuario: { in: ['BIBLIOTECARIA', 'ADMINISTRADOR'] }, status: 'ATIVO' }
  })

  for (const reserva of emAtraso) {
    // Só envia uma vez por dia
    if (reserva.notificacoes.length > 0) continue

    const diasAtraso = Math.floor((hoje - reserva.prazoDevol) / (1000 * 60 * 60 * 24))

    // Notifica o aluno
    await prisma.notificacao.create({
      data: {
        usuarioId: reserva.usuarioId,
        reservaId: reserva.id,
        tipo: 'EM_ATRASO',
        titulo: `Livro em atraso há ${diasAtraso} dia(s)`,
        mensagem: `Você está com "${reserva.exemplar.livro.titulo}" há ${diasAtraso} dia(s) além do prazo. Devolva o quanto antes.`
      }
    })

    // Notifica as bibliotecárias
    await prisma.notificacao.createMany({
      data: bibliotecarias.map((bib) => ({
        usuarioId: bib.id,
        reservaId: reserva.id,
        tipo: 'EM_ATRASO',
        titulo: `Livro em atraso — ${reserva.usuario.nome}`,
        mensagem: `${reserva.usuario.nome} ${reserva.usuario.sobrenome} está com "${reserva.exemplar.livro.titulo}" em atraso há ${diasAtraso} dia(s).`
      }))
    })
  }

  console.log(`[Cron] Verificação de prazos concluída: ${vencendoHoje.length} vencendo hoje, ${emAtraso.length} em atraso.`)
}

// Roda todo dia às 8h da manhã
cron.schedule('0 8 * * *', verificarPrazos)

export default verificarPrazos
