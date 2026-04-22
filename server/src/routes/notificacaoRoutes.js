// src/routes/notificacaoRoutes.js
import express from 'express'
import { prisma } from '../../lib/prisma.js'
import { autenticar } from '../middlewares/auth.middleware.js'
const router = express.Router()

// Busca notificações do usuário logado (inclui não lidas primeiro)
router.get('/', autenticar, async (req, res) => {
  const notificacoes = await prisma.notificacao.findMany({
    where: { usuarioId: req.usuario.id },
    include: {
      reserva: {
        include: {
          usuario: { select: { nome: true, sobrenome: true, anoSala: true } },
          exemplar: { include: { livro: true } }
        }
      }
    },
    orderBy: [{ lida: 'asc' }, { createdAt: 'desc' }]
  })

  const naoLidas = notificacoes.filter(n => !n.lida).length
  res.json({ naoLidas, notificacoes })
})

// Marca uma notificação como lida
router.patch('/:id/lida', autenticar, async (req, res) => {
  await prisma.notificacao.update({
    where: { id: req.params.id, usuarioId: req.usuario.id },
    data: { lida: true }
  })
  res.json({ mensagem: 'Marcada como lida.' })
})

// Marca todas como lidas
router.patch('/marcar-todas-lidas', autenticar, async (req, res) => {
  await prisma.notificacao.updateMany({
    where: { usuarioId: req.usuario.id, lida: false },
    data: { lida: true }
  })
  res.json({ mensagem: 'Todas marcadas como lidas.' })
})

export default router
