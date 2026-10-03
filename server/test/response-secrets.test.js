import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { loadModule, request, silentLogger } from './helpers/modules.js';

const user = {
  id: 1, nome: 'Leitor', sobrenome: 'Teste', email: 'reader@example.com',
  tipoUsuario: 'ALUNO', status: 'ATIVO', emailVerificado: true,
  senha: await bcrypt.hash('TestPassword123', 4), codigoVerificacao: '123456',
  codigoVerificacaoExp: new Date(Date.now() + 60000), anoSala: '1A',
  reservas: [],
};
const book = { id: 'book', titulo: 'Livro' };
const exemplar = { id: 'copy', livro: book };
const reserva = { id: 'r1', usuarioId: 1, status: 'PENDENTE', usuario: user, professor: user, exemplar };
const duvida = { id: 'd1', usuarioId: 1, duvida: 'Dúvida', usuario: user };
const notificacao = { id: 'n1', lida: false, reserva };

// Simulate Prisma's scalar/select/include semantics, including unsafe scalar fields.
function project(row, query = {}) {
  if (Array.isArray(row)) return row.map(item => project(item, query));
  if (query === true) query = {};
  if (query.select) return Object.fromEntries(Object.entries(query.select)
    .filter(([, choice]) => choice)
    .map(([key, choice]) => [key, choice === true ? row[key] : project(row[key], choice)]));
  const result = Object.fromEntries(Object.entries(row).filter(([, value]) =>
    value === null || typeof value !== 'object' || value instanceof Date));
  for (const [key, choice] of Object.entries(query.include || {})) {
    result[key] = project(row[key], choice);
  }
  return result;
}
function noSecrets(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert(!['senha', 'codigoVerificacao', 'codigoVerificacaoExp'].includes(key), `Leaked ${key}`);
    noSecrets(child);
  }
}
function boundaryMocks() {
  const prisma = {
    usuario: {
      findUnique: async query => project(user, query),
      findMany: async query => [project(user, query)],
      create: async query => project({ ...user, ...query.data }, query),
      update: async query => project({ ...user, ...query.data }, query),
    },
    reserva: {
      findFirst: async () => null, count: async () => 0,
      create: async query => project(reserva, query),
      findMany: async query => [project(reserva, query)],
    },
    configuracao: { findFirst: async () => null },
    exemplar: { findFirst: async query => project(exemplar, query), updateMany: async () => ({ count: 1 }) },
    notificacao: { createMany: async () => ({}), findMany: async query => [project(notificacao, query)] },
    duvida: { create: async query => project(duvida, query), findMany: async query => [project(duvida, query)] },
    refreshToken: { create: async () => ({}) },
    $transaction: async fn => fn(prisma),
  };
  return {
    'lib/prisma.js': { prisma },
    'src/utils/logger.js': { default: silentLogger },
    'src/config/env.js': { config: { jwt: { secret: 'test-only-not-a-real-secret' } } },
    'src/middlewares/auth.middleware.js': { autenticar: (_req, _res, next) => next() },
  };
}

for (const role of ['ALUNO', 'BIBLIOTECARIA', 'ADMINISTRADOR']) {
  test(`A06: reservation API selects only public user fields (${role})`, async () => {
    const { default: router } = await loadModule('src/routes/reservaRoutes.js', boundaryMocks());
    const actor = { id: 1, tipoUsuario: role };
    const created = await request(router, 'POST', '/', { livroId: 'book', usuarioId: 1 }, actor);
    assert.equal(created.status, 201);
    assert.deepEqual(created.body.reserva.usuario, { id: 1, nome: 'Leitor', sobrenome: 'Teste' });
    noSecrets(created.body);
    noSecrets((await request(router, 'GET', '/', {}, actor)).body);
    if (role !== 'ALUNO') noSecrets((await request(router, 'GET', '/analise-literaria', {}, actor)).body);
  });
}

test('A06: notification API never returns nested user secrets', async () => {
  const { default: router } = await loadModule('src/routes/notificacaoRoutes.js', boundaryMocks());
  const result = await request(router, 'GET', '/', {}, { id: 1 });
  assert.equal(result.status, 200);
  noSecrets(result.body);
});

async function callController(controller, req) {
  let body;
  const res = { status() { return this; }, json(value) { body = value; return this; } };
  await controller(req, res, error => { throw error; });
  assert.notEqual(body, undefined);
  noSecrets(body);
  return body;
}

test('A06: user and authentication responses never expose internal user fields', async () => {
  const mocks = boundaryMocks();
  const auth = await loadModule('src/controllers/auth.controllers.js', mocks);
  const users = await loadModule('src/controllers/usuarios.controllers.js', mocks);
  await callController(auth.loginCadastro, { body: { email: user.email, password: 'TestPassword123' } });
  await callController(auth.getCurrentUser, { usuario: { id: 1 } });
  await callController(auth.updateCurrentUser, { usuario: { id: 1 }, body: { nome: 'Novo' } });
  await callController(users.listarUsuariosController, {});
  await callController(users.listarProfessoresController, {});
  await callController(users.atualizarUsuarioController, { params: { id: '1' }, body: { nome: 'Novo' } });
  await callController(users.createUsuarioController, {
    baseUrl: '/usuarios', body: { nome: 'Leitor', sobrenome: 'Teste', email: 'security-test@gmail.com',
      senha: 'TestPassword123', tipoUsuario: 'ALUNO', anoSala: '1A', anoInicioEnsinoMedio: 2024 },
  });
});

test('A06: doubt responses never expose nested user secrets', async () => {
  const controllers = await loadModule('src/controllers/duvida.controllers.js', boundaryMocks());
  for (const tipoUsuario of ['ALUNO', 'BIBLIOTECARIA']) {
    const req = { usuario: { id: 1, nome: 'Leitor', tipoUsuario }, body: { duvida: 'Dúvida' } };
    await callController(controllers.criarDuvida, req);
    await callController(controllers.listarDuvidas, req);
  }
});
