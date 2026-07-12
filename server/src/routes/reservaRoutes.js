
import express from 'express'
import { prisma } from '../../lib/prisma.js'
import { autenticar } from '../middlewares/auth.middleware.js'
import { roleMiddleware, soBibliotecaria } from '../middlewares/role.middleware.js'
import { atualizarStatusReserva, criarReservas, registrarDevolucao, registrarRetirada } from '../service/reservaService.js'
const router = express.Router()

router.post('/', autenticar, roleMiddleware(['ALUNO', 'BIBLIOTECARIA', 'ADMINISTRADOR']), async (req, res, next) => {
  try {
    const { livroId, usuarioId, tipoReserva, professorId } = req.body
    const ehBibliotecaria = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(req.usuario.tipoUsuario)
    const targetUsuarioId = (ehBibliotecaria && usuarioId) ? Number(usuarioId) : req.usuario.id

    const reserva = await criarReservas(targetUsuarioId, livroId, tipoReserva, professorId ? Number(professorId) : null)
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

const handleRetirada = async (req, res, next) => {
  try {
    await registrarRetirada(req.params.id)
    res.json({ mensagem: 'Retirada registrada. Prazo de devolução: 30 dias.' })
  } catch (err) {
    next(err)
  }
}

router.patch('/:id/retirar', autenticar, roleMiddleware(['ALUNO', 'BIBLIOTECARIA', 'ADMINISTRADOR']), handleRetirada)
router.put('/:id/retirar', autenticar, roleMiddleware(['ALUNO', 'BIBLIOTECARIA', 'ADMINISTRADOR']), handleRetirada)

router.patch('/:id/devolver', autenticar, soBibliotecaria, async (req, res, next) => {
  try {
    await registrarDevolucao(req.params.id)
    res.json({ mensagem: 'Devolução registrada com sucesso.' })
  } catch (err) {
    next(err)
  }
})

router.get('/analise-literaria', autenticar, roleMiddleware(['PROFESSOR', 'BIBLIOTECARIA', 'ADMINISTRADOR']), async (req, res, next) => {
  try {
    const filtro = { tipoReserva: 'ANALISE_LITERARIA' }
    
    // Se for professor, só vê as que ele solicitou
    if (req.usuario.tipoUsuario === 'PROFESSOR') {
      filtro.professorId = req.usuario.id
    }

    const reservas = await prisma.reserva.findMany({
      where: filtro,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            email: true,
            anoSala: true
          }
        },
        professor: {
          select: {
            nome: true,
            sobrenome: true
          }
        },
        exemplar: {
          include: {
            livro: true
          }
        }
      }
    })

    reservas.sort((a, b) => {
      const statusA = a.status
      const statusB = b.status
      
      const scoreA = statusA === 'RETIRADO' ? 1 : (statusA === 'DEVOLVIDO' ? 2 : 3)
      const scoreB = statusB === 'RETIRADO' ? 1 : (statusB === 'DEVOLVIDO' ? 2 : 3)
      
      if (scoreA !== scoreB) {
        return scoreA - scoreB
      }
      
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })

    res.json(reservas)
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
        professor: { select: { nome: true, sobrenome: true } },
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
