import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const root = new URL('../../', import.meta.url);
export async function loadModule(entry, mocks = {}, env = {}) {
  const context = vm.createContext({ process: { env }, console, URL, setTimeout, clearTimeout });
  const cache = new Map();
  async function getModule(id) {
    if (cache.has(id)) return cache.get(id);
    const relative = id.startsWith(root.href) ? id.slice(root.href.length) : id;
    let module;
    if (Object.hasOwn(mocks, relative) || !id.startsWith(root.href) || id.includes('/node_modules/')) {
      const values = Object.hasOwn(mocks, relative) ? mocks[relative] : await import(id);
      module = new vm.SyntheticModule(Object.keys(values), function () {
        for (const [key, value] of Object.entries(values)) this.setExport(key, value);
      }, { context, identifier: id });
    } else {
      module = new vm.SourceTextModule(await readFile(new URL(id), 'utf8'), {
        context, identifier: id,
      });
    }
    cache.set(id, module);
    return module;
  }
  const module = await getModule(new URL(entry, root).href);
  await module.link(async (specifier, parent) => {
    if (Object.hasOwn(mocks, specifier)) return getModule(specifier);
    if (specifier.startsWith('.')) return getModule(new URL(specifier, parent.identifier).href);
    const resolved = createRequire(fileURLToPath(parent.identifier)).resolve(specifier);
    return getModule(resolved.startsWith('/') ? pathToFileURL(resolved).href : resolved);
  });
  await module.evaluate();
  return module.namespace;
}

export function request(router, method, url, body = {}, usuario) {
  return new Promise((resolve, reject) => {
    const req = { method, url, body, usuario, headers: {} };
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(value) { resolve({ status: this.statusCode, body: JSON.parse(JSON.stringify(value)) }); },
      send(value) { resolve({ status: this.statusCode, body: value }); },
    };
    router.handle(req, res, error => error ? reject(error) : resolve({ status: 404 }));
  });
}

export const silentLogger = { info() {}, warn() {}, error() {}, debug() {} };
