import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule, request, silentLogger } from './helpers/modules.js';

for (const method of ['PATCH', 'PUT']) {
  for (const role of ['ALUNO', 'PROFESSOR', 'BIBLIOTECARIA', 'ADMINISTRADOR']) {
    test(`A05: ${method} retirada enforces staff role (${role})`, async () => {
      let calls = 0;
      const { default: router } = await loadModule('src/routes/reservaRoutes.js', {
        'lib/prisma.js': { prisma: {} },
        'src/utils/logger.js': { default: silentLogger },
        'src/middlewares/auth.middleware.js': { autenticar: (_req, _res, next) => next() },
        'src/service/reservaService.js': {
          atualizarStatusReserva() {}, criarReservas() {}, registrarDevolucao() {},
          registrarRetirada: async () => { calls++; },
        },
      });
      const equipe = ['BIBLIOTECARIA', 'ADMINISTRADOR'].includes(role);
      for (const id of ['propria', 'outro-aluno']) {
        const response = await request(router, method, `/${id}/retirar`, {}, { id: 1, tipoUsuario: role });
        assert.equal(response.status, equipe ? 200 : 403);
      }
      assert.equal(calls, equipe ? 2 : 0);
    });
  }
}

test('A05: atomic status guard rejects missing, stale and repeated withdrawals without notifying', async () => {
  let exists = true, status = 'APROVADO', notifications = 0;
  const prisma = {
    reserva: { findUnique: async () => exists ? {
      id: 'r1', usuarioId: 2, status: 'APROVADO', exemplar: { livro: { titulo: 'Livro' } },
    } : null },
    configuracao: { findFirst: async () => ({ prazoDevolucao: 15 }) },
    $transaction: async fn => fn({
      reserva: { updateMany: async ({ where, data }) => {
        assert.equal(where.id, 'r1');
        assert.equal(where.status, 'APROVADO');
        assert.equal(data.status, 'RETIRADO');
        assert.equal(Math.round((data.prazoDevol - data.retiradoEm) / 86400000), 15);
        if (status !== where.status) return { count: 0 };
        status = data.status; return { count: 1 };
      } },
      notificacao: { create: async () => { notifications++; } },
    }),
  };
  const { registrarRetirada } = await loadModule('src/service/reservaService.js', { 'lib/prisma.js': { prisma } });
  await registrarRetirada('r1');
  assert.equal(notifications, 1);
  await assert.rejects(registrarRetirada('r1'), { message: 'Reserva indisponível', status: 404 });
  status = 'DEVOLVIDO';
  await assert.rejects(registrarRetirada('r1'), { message: 'Reserva indisponível', status: 404 });
  exists = false;
  await assert.rejects(registrarRetirada('r1'), { message: 'Reserva indisponível', status: 404 });
  assert.equal(notifications, 1);
});
