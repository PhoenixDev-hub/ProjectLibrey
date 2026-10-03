import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { loadModule, request } from './helpers/modules.js';

const message = 'Se a conta existir, você receberá instruções por e-mail.';
for (const environment of ['development', 'test', 'production', undefined]) {
  test(`A01: generic response and mocked email only (${environment})`, async () => {
    const emails = [], logs = [], rows = [];
    let user = { id: 1, email: 'reader@example.com', status: 'ATIVO' };
    let failMail = false;
    const prisma = {
      usuario: { findUnique: async () => user },
      passwordReset: {
        updateMany: async () => ({}), deleteMany: async () => ({}),
        create: async ({ data }) => { rows.push(data); return data; },
      },
    };
    const { default: router } = await loadModule('src/routes/password-reset.routes.js', {
      'lib/prisma.js': { prisma },
      'src/utils/logger.js': { default: Object.fromEntries(['info', 'warn', 'error', 'debug'].map(k => [k, (...args) => logs.push(args)])) },
      'src/middlewares/rate-limit.middleware.js': { generalLimiter: (_req, _res, next) => next() },
      nodemailer: { default: {
        createTransport: () => ({ sendMail: async mail => {
          if (failMail) throw new Error('SMTP unavailable');
          emails.push(mail); return { messageId: 'test-message' };
        } }),
        createTestAccount: async () => ({ user: 'test', pass: 'fake', smtp: { host: 'mock', port: 587, secure: false } }),
        getTestMessageUrl: () => 'https://preview.example.invalid/secret',
      } },
    }, { NODE_ENV: environment, ...(environment === 'production' ? {
      SMTP_HOST: 'mock', SMTP_PORT: '587', SMTP_USER: 'test', SMTP_PASS: 'fake',
    } : {}) });
    for (const path of ['/', '/request']) {
      const response = await request(router, 'POST', path, { email: user.email });
      assert.deepEqual(response, { status: 200, body: { message } });
    }
    assert.equal(emails.length, 2);
    const token = new URL(emails[0].text.match(/http:\/\/\S+/)[0]).searchParams.get('token');
    assert.equal(await bcrypt.compare(token, rows[0].token), true);
    assert(!JSON.stringify(logs).includes(token));
    assert(!JSON.stringify(logs).includes('https://preview.example.invalid/secret'));
    failMail = true;
    assert.deepEqual((await request(router, 'POST', '/', { email: user.email })).body, { message });
    user = { ...user, status: 'INATIVO' };
    assert.deepEqual((await request(router, 'POST', '/', { email: user.email })).body, { message });
    user = null;
    assert.deepEqual((await request(router, 'POST', '/', { email: 'absent@example.com' })).body, { message });
    assert.equal((await request(router, 'POST', '/test', { email: 'reader@example.com' })).status, 404);
  });
}
