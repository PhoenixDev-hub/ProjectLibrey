import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadModule } from './helpers/modules.js';

test('A04: Prisma uses required environment URL, with no embedded credential', async () => {
  const url = 'postgresql://test:placeholder@localhost:5432/test';
  const { default: config } = await loadModule('prisma.config.ts', {
    'dotenv/config': {},
    'prisma/config': { defineConfig: x => x, env: key => {
      assert.equal(key, 'DATABASE_URL'); return url;
    } },
  });
  assert.equal(config.datasource.url, url);
  await assert.rejects(loadModule('prisma.config.ts', {
    'dotenv/config': {},
    'prisma/config': { defineConfig: x => x, env: () => { throw new Error('Missing DATABASE_URL'); } },
  }), /Missing DATABASE_URL/);
});

test('A04: Compose requires a password and publishes PostgreSQL on loopback only', () => {
  const compose = readFileSync(new URL('../../docker-compose.yml', import.meta.url), 'utf8');
  assert.match(compose, /POSTGRES_PASSWORD: \$\{DB_PASSWORD:\?Defina DB_PASSWORD\}/);
  assert.match(compose, /"127\.0\.0\.1:5432:5432"/);
  assert.doesNotMatch(compose, /"5432:5432"|DB_PASSWORD:-/);
});
