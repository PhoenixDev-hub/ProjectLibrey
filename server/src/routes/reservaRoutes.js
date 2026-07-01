
import express from 'express'
import { prisma } from '../../lib/prisma.js'
import { autenticar } from '../middlewares/auth.middleware.js'
import { soBibliotecaria } from '../middlewares/role.middleware.js'
import { atualizarStatusReserva, criarReservas, registrarDevolucao, registrarRetirada } from '../service/reservaService.js'
const router = express.Router()


router.post('/', autenticar, async (req, res, next) => {
  try {
    const { livroId, usuarioId } = req.body
    const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(req.usuario.tipoUsuario)
    const targetUsuarioId = (ehBibliotecaria && usuarioId) ? Number(usuarioId) : req.usuario.id

    const reserva = await criarReservas(targetUsuarioId, livroId)
    res.status(201).json({ mensagem: 'Reserva solicitada com sucesso.', reserva })
  } catch (err) {
    next(err)
  }
})


router.patch('/:id/status', autenticar, soBibliotecaria, async (req, res, next) => {
  try {
    const { acao } = req.body
    await atualizarStatusReserva(req.params.id, req.usuario.id, acao)
    res.json({ mensagem: `Reserva ${acao === 'APROVAR' ? 'aprovada' : 'rejeitada'} com sucesso.` })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/retirar', autenticar, soBibliotecaria, async (req, res, next) => {
  try {
    await registrarRetirada(req.params.id)
    res.json({ mensagem: 'Retirada registrada. Prazo de devolução: 30 dias.' })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/devolver', autenticar, soBibliotecaria, async (req, res, next) => {
  try {
    await registrarDevolucao(req.params.id)
    res.json({ mensagem: 'Devolução registrada com sucesso.' })
  } catch (err) {
    next(err)
  }
})

router.get('/', autenticar, async (req, res, next) => {
  try {
    const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(req.usuario.tipoUsuario)
    const filtro = ehBibliotecaria ? {} : { usuarioId: req.usuario.id }

    const reservas = await prisma.reserva.findMany({
      where: filtro,
      include: {
        usuario: { select: { id: true, nome: true, sobrenome: true, email: true, anoSala: true } },
        exemplar: { include: { livro: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(reservas)
  } catch (err) {
    next(err)
  }
})

export default router
