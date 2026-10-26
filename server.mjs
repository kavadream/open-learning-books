import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { loadBooks, findUnit } from './lib/content.mjs';
import { validatePractice, scriptedPractice } from './lib/teaching.mjs';

const publicDir = resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function send(res, code, body, type = 'application/json; charset=utf-8') {
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
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16384) throw Object.assign(new Error('请求内容过长'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('JSON 格式不正确'), { status: 400 }); }
}

export async function makeServer() {
  const books = await loadBooks();
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/api/status') return send(res, 200, { version: '0.1.0', mode: 'scripted-demo', externalAiEnabled: false, paymentsEnabled: false });
      if (req.method === 'GET' && url.pathname === '/api/books') return send(res, 200, { books });
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
      send(res, err.status || 500, { error: err.status ? err.message : '服务暂时无法完成请求' });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = await makeServer();
  const args = process.argv.slice(2);
  const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
  const port = Number(option('--port') ?? process.env.PORT ?? 3000);
  const host = option('--host') ?? process.env.HOST ?? '127.0.0.1';
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be an integer from 0 to 65535.');
  server.listen(port, host, () => console.log(`Open Learning Books: http://${host}:${server.address().port}\nScripted demonstration; no external AI or payments.`));
}
