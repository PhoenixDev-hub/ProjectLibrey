// src/routes/reservaRoutes.js
import express from 'express'
import { prisma } from '../../lib/prisma.js'
import { autenticar } from '../middlewares/auth.middleware.js'
import { soBibliotecaria } from '../middlewares/role.middleware.js'
import { atualizarStatusReserva, criarReservas, registrarDevolucao, registrarRetirada } from '../service/reservaService.js'
const router = express.Router()

// Aluno solicita reserva
router.post('/', autenticar, async (req, res) => {
  try {
    const { livroId } = req.body
    const reserva = await criarReservas(req.usuario.id, livroId)
    res.status(201).json({ mensagem: 'Reserva solicitada com sucesso.', reserva })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Bibliotecária aprova ou rejeita
router.patch('/:id/status', autenticar, soBibliotecaria, async (req, res) => {
  try {
    const { acao } = req.body // 'APROVAR' ou 'REJEITAR'
    await atualizarStatusReserva(req.params.id, req.usuario.id, acao)
    res.json({ mensagem: `Reserva ${acao === 'APROVAR' ? 'aprovada' : 'rejeitada'} com sucesso.` })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Registra retirada física
router.patch('/:id/retirar', autenticar, soBibliotecaria, async (req, res) => {
  try {
    await registrarRetirada(req.params.id)
    res.json({ mensagem: 'Retirada registrada. Prazo de devolução: 30 dias.' })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Registra devolução
router.patch('/:id/devolver', autenticar, soBibliotecaria, async (req, res) => {
  try {
    await registrarDevolucao(req.params.id)
    res.json({ mensagem: 'Devolução registrada com sucesso.' })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
})

// Lista reservas (bibliotecária vê todas, aluno vê as suas)
router.get('/', autenticar, async (req, res) => {
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
})

export default router
