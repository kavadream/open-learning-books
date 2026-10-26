import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { loadBooks, loadTeaching, findUnit } from './lib/content.mjs';
import { validatePractice, scriptedPractice } from './lib/teaching.mjs';
import { createProvider } from './lib/provider.mjs';
import { createSessions } from './lib/sessions.mjs';
import { failure } from './lib/errors.mjs';

const publicDir = resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function send(res, code, body, type = 'application/json; charset=utf-8') {
  if (res.destroyed || res.writableEnded) return;
  res.writeHead(code, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    'Referrer-Policy': 'same-origin',
    'Cache-Control': 'no-store'
  });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

async function readJson(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw Object.assign(new Error('请使用 JSON 请求'), { status: 415 });
  let size = 0;
  const chunks = [];
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > 16384) { req.resume(); throw Object.assign(new Error('请求内容过长'), { status: 413 }); }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('JSON 格式不正确'), { status: 400 }); }
}

export async function makeServer({ provider = createProvider(), sessionSettings } = {}) {
  const books = await loadBooks();
  const teaching = await loadTeaching();
  const sessions = createSessions({ books, teaching, provider, settings: sessionSettings });
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/api/status') return send(res, 200, { version: '0.2.0-dev', mode: 'scripted-demo', externalAiEnabled: sessions.configured, realAiVerified: false, paymentsEnabled: false, teachingModes: ['explanation', 'role-play', 'feedback'] });
      if (req.method === 'GET' && url.pathname === '/api/books') return send(res, 200, { books });
      if (['POST', 'DELETE'].includes(req.method) && url.pathname.startsWith('/api/')) {
        if ((req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) || req.headers['sec-fetch-site'] === 'cross-site') throw failure('ORIGIN_REJECTED', '请从本服务页面发起请求。', 403);
      }
      if (url.pathname.startsWith('/api/teaching/')) {
        // This unauthenticated pilot must not spend through a public/rebound host.
        if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress) || !/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(req.headers.host || '')) throw failure('LOCAL_ONLY', '教学会话仅支持本机访问，身份验证尚未实现。', 403);
        if (req.method === 'POST' && url.pathname === '/api/teaching/sessions') return send(res, 201, sessions.create(await readJson(req)));
        const match = url.pathname.match(/^\/api\/teaching\/sessions\/([a-f0-9-]{36})(\/turns)?$/);
        if (match && req.method === 'DELETE' && !match[2]) return send(res, 200, sessions.cancel(match[1]));
        if (match && req.method === 'POST' && match[2]) {
          const input = await readJson(req);
          const controller = new AbortController();
          const abort = () => { if (!res.writableEnded) controller.abort(); };
          res.once('close', abort);
          try { return send(res, 200, await sessions.turn(match[1], input, controller.signal)); }
          finally { res.off('close', abort); }
        }
        return send(res, 404, { error: '教学接口不存在', code: 'NOT_FOUND', retryable: false });
      }
      if (req.method === 'POST' && url.pathname === '/api/practice') {
        const input = await readJson(req);
        const error = validatePractice(input);
        if (error) return send(res, 400, { error });
        const { unit } = findUnit(books, input.bookId, input.unitId);
        if (!unit?.practice) return send(res, 404, { error: '找不到可演练的小节' });
        return send(res, 200, scriptedPractice(input.messages));
      }
      if (req.method !== 'GET') return send(res, 405, { error: '不支持的请求方法' });
      if (url.pathname.startsWith('/api/')) return send(res, 404, { error: '接口不存在' });
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { return send(res, 400, { error: '路径不正确' }); }
      const path = resolve(publicDir, pathname === '/' ? 'index.html' : `.${pathname}`);
      if (path !== publicDir && !path.startsWith(publicDir + sep)) return send(res, 403, { error: '无法访问该路径' });
      try {
        const content = await readFile(path);
        return send(res, 200, content, mime[extname(path)] || 'application/octet-stream');
      } catch (err) {
        if (err.code === 'ENOENT' || err.code === 'EISDIR') return send(res, 404, { error: '页面不存在' });
        throw err;
      }
    } catch (err) {
      if (err.status === 413) res.setHeader('Connection', 'close');
      send(res, err.status || 500, { error: err.status ? err.message : '服务暂时无法完成请求', code: err.code || 'REQUEST_FAILED', retryable: Boolean(err.retryable) });
    }
  });
  server.requestTimeout = 20000;
  server.headersTimeout = 10000;
  server.on('close', () => sessions.close());
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = await makeServer();
  const args = process.argv.slice(2);
  const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
  const port = Number(option('--port') ?? process.env.PORT ?? 3000);
  const host = option('--host') ?? process.env.HOST ?? '127.0.0.1';
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be an integer from 0 to 65535.');
  server.listen(port, host, () => console.log(`Open Learning Books: http://${host}:${server.address().port}\nDefault: scripted demo. AI requires explicit server configuration; no payments.`));
}
