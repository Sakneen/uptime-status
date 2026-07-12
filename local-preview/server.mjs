import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const previewRoot = fileURLToPath(new URL('./', import.meta.url));
const port = Number(process.env.PORT || 4173);
let githubToken;

function getGithubToken() {
  if (!githubToken) githubToken = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  return githubToken;
}

function generatedFile(path) {
  return execFileSync('git', ['show', `origin/gh-pages:${path}`], { cwd: root });
}

function rewriteGeneratedAsset(buffer, path) {
  if (!['.html', '.js', '.css'].includes(extname(path))) return buffer;
  return Buffer.from(buffer.toString('utf8')
    .replaceAll('https://api.github.com', `http://127.0.0.1:${port}/github-api`)
    .replace(/https:\/\/status\.sakneen\.com\/status-history\.js\?v=[^"']+/g, '/status-history.js')
    .replace(/https:\/\/status\.sakneen\.com\/status-history\.css\?v=[^"']+/g, '/status-history.css')
    .replace('https://status.sakneen.com/themes/light.css', '/themes/light.css')
    .replace('https://status.sakneen.com/global.css', '/global.css'));
}

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
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith('/github-api/')) {
      const githubPath = url.pathname.slice('/github-api'.length);
      const allowed = /^\/repos\/Sakneen\/uptime-status\/(issues(?:\/\d+(?:\/comments)?)?|commits)$/.test(githubPath);
      if (!allowed) { response.writeHead(403); response.end('Not allowed'); return; }
      const upstream = await fetch(`https://api.github.com${githubPath}${url.search}`, {
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${getGithubToken()}`,
          'user-agent': 'Sakneen-Status-Local-Preview'
        }
      });
      response.writeHead(upstream.status, {
        'content-type': upstream.headers.get('content-type') || 'application/json',
        'cache-control': 'no-store'
      });
      response.end(Buffer.from(await upstream.arrayBuffer()));
      return;
    }
    if (url.pathname === '/status-history.js' || url.pathname === '/status-history.css') {
      const asset = url.pathname.endsWith('.js') ? 'status-history.js' : 'status-history.css';
      response.writeHead(200, { 'content-type': mime[extname(asset)], 'cache-control': 'no-store' });
      response.end(readFileSync(join(root, 'assets', asset)));
      return;
    }
    if (/^\/history\/[^/?]+\/?$/.test(url.pathname)) {
      const file = rewriteGeneratedAsset(generatedFile('404.html'), '404.html');
      response.writeHead(200, { 'content-type': mime['.html'], 'cache-control': 'no-store' });
      response.end(file);
      return;
    }
    if (request.url === '/data.json') {
      response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      response.end(JSON.stringify(data()));
      return;
    }
    if (/^\/(client\/|themes\/|global\.css|manifest\.json|logo-|upptime-icon)/.test(url.pathname)) {
      const branchPath = url.pathname.replace(/^\//, '');
      const file = rewriteGeneratedAsset(generatedFile(branchPath), branchPath);
      response.writeHead(200, { 'content-type': mime[extname(branchPath)] || 'application/octet-stream', 'cache-control': 'no-store' });
      response.end(file);
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
