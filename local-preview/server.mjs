import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const previewRoot = fileURLToPath(new URL('./', import.meta.url));
const port = Number(process.env.PORT || 4173);

function parseSnapshot(text) {
  const value = (key) => text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim();
  return { status: value('status') || 'down', code: Number(value('code') || 0), responseTime: Number(value('responseTime') || 0), lastUpdated: value('lastUpdated') || null };
}

function historyFor(slug) {
  const commits = execFileSync('git', ['log', '--format=%H', '--all', '--', `history/${slug}.yml`], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean).slice(0, 90);
  return commits.map((commit) => {
    try {
      const snapshot = execFileSync('git', ['show', `${commit}:history/${slug}.yml`], { cwd: root, encoding: 'utf8' });
      const data = parseSnapshot(snapshot);
      return { ...data, timestamp: data.lastUpdated || new Date(0).toISOString() };
    } catch { return null; }
  }).filter(Boolean).reverse();
}

function data() {
  const summary = JSON.parse(readFileSync(join(root, 'history/summary.json'), 'utf8'));
  return summary.map((service) => ({ ...service, history: historyFor(service.slug) }));
}

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };
const server = createServer((request, response) => {
  try {
    if (request.url === '/data.json') {
      response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      response.end(JSON.stringify(data()));
      return;
    }
    const requested = request.url === '/' ? 'index.html' : request.url.replace(/^\//, '');
    const file = normalize(join(previewRoot, requested));
    if (!file.startsWith(previewRoot) || !existsSync(file)) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'content-type': mime[extname(file)] || 'text/plain; charset=utf-8' });
    response.end(readFileSync(file));
  } catch (error) { response.writeHead(500); response.end(String(error)); }
});

server.listen(port, '127.0.0.1', () => console.log(`Local uptime preview: http://127.0.0.1:${port}`));
