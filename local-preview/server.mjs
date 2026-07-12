import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const previewRoot = fileURLToPath(new URL('./', import.meta.url));
const port = Number(process.env.PORT || 4173);
const historicalEvents = JSON.parse(readFileSync(join(previewRoot, 'historical-events.json'), 'utf8'));
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
  let text = buffer.toString('utf8')
    .replaceAll('https://api.github.com', `http://127.0.0.1:${port}/github-api`)
    .replaceAll('path:"https://status.sakneen.com"', `path:"http://127.0.0.1:${port}"`)
    .replaceAll('incidentReport:"Incident Report for"', 'incidentReport:"Incident #$NUMBER report →"')
    .replaceAll('pastIncidentsResolved:"Resolved in $MINUTES minutes with $POSTS posts"', 'pastIncidentsResolved:"Duration: $MINUTES min · $POSTS update"')
    .replace(/https:\/\/status\.sakneen\.com\/status-history\.js\?v=[^"']+/g, '/status-history.js')
    .replace(/https:\/\/status\.sakneen\.com\/status-history\.css\?v=[^"']+/g, '/status-history.css')
    .replace('https://status.sakneen.com/themes/light.css', '/themes/light.css')
    .replace('https://status.sakneen.com/global.css', '/global.css');
  if (extname(path) === '.js') {
    text = text
      .replaceAll('closed-issues-', 'local-fixture-v1-closed-issues-')
      .replaceAll('maintenance-issues-', 'local-fixture-v1-maintenance-issues-')
      .replaceAll('issue-comments-', 'local-fixture-v1-issue-comments-')
      .replaceAll('`issue-${', '`local-fixture-v1-issue-${');
  }
  return Buffer.from(text);
}

function githubUser() {
  return {
    login: 'sakneen-status',
    html_url: 'https://github.com/Sakneen/uptime-status',
    avatar_url: 'https://img.sakneen.com/logos-email/logo_rOc78V2s7.png'
  };
}

function issueFor(event) {
  const labels = event.type === 'maintenance' ? ['maintenance', event.service] : ['status', event.service];
  const metadata = event.type === 'maintenance'
    ? `<!--\nstart: ${event.startedAt}\nend: ${event.resolvedAt}\n-->\n\n`
    : '';
  return {
    id: event.number,
    number: event.number,
    title: event.title,
    state: 'closed',
    created_at: event.startedAt,
    updated_at: event.resolvedAt,
    closed_at: event.resolvedAt,
    comments: 1,
    body: `${metadata}${event.summary}\n\nEvidence: ${event.source}`,
    html_url: `http://127.0.0.1:${port}/incident/${event.number}`,
    user: githubUser(),
    labels: labels.map((name) => ({ name }))
  };
}

function commentsFor(event) {
  return [{
    id: event.number * 10,
    body: `Resolved. ${event.summary}\n\nEvidence: ${event.source}`,
    created_at: event.resolvedAt,
    updated_at: event.resolvedAt,
    html_url: `http://127.0.0.1:${port}/incident/${event.number}`,
    user: githubUser()
  }];
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(value));
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

function localSummary() {
  const summary = JSON.parse(readFileSync(join(root, 'history/summary.json'), 'utf8'));
  for (const event of historicalEvents) {
    const service = summary.find((item) => item.slug === event.service);
    if (!service) continue;
    const date = event.startedAt.slice(0, 10);
    if (event.type === 'maintenance') {
      service.dailyMaintenance = { ...(service.dailyMaintenance || {}), [date]: true };
      continue;
    }
    const observedEnd = new Date(event.observedUntil || event.resolvedAt).getTime();
    const minutes = Math.max(0.1, (observedEnd - new Date(event.startedAt).getTime()) / 60000);
    service.dailyMinutesDown[date] = Number(((service.dailyMinutesDown[date] || 0) + minutes).toFixed(2));
  }
  return summary;
}

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith('/github-api/')) {
      const githubPath = url.pathname.slice('/github-api'.length);
      const allowed = /^\/repos\/Sakneen\/uptime-status\/(issues(?:\/\d+(?:\/comments)?)?|commits)$/.test(githubPath);
      if (!allowed) { response.writeHead(403); response.end('Not allowed'); return; }
      const localIssueMatch = githubPath.match(/\/issues\/(\d+)(\/comments)?$/);
      if (localIssueMatch) {
        const event = historicalEvents.find((item) => item.number === Number(localIssueMatch[1]));
        if (event) {
          sendJson(response, 200, localIssueMatch[2] ? commentsFor(event) : issueFor(event));
          return;
        }
      }
      const upstream = await fetch(`https://api.github.com${githubPath}${url.search}`, {
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${getGithubToken()}`,
          'user-agent': 'Sakneen-Status-Local-Preview'
        }
      });
      if (githubPath.endsWith('/issues') && upstream.ok) {
        const labels = (url.searchParams.get('labels') || '').split(',').filter(Boolean);
        const state = url.searchParams.get('state') || 'open';
        const localIssues = state === 'closed'
          ? historicalEvents.map(issueFor).filter((issue) => labels.every((label) => issue.labels.some((item) => item.name === label)))
          : [];
        const upstreamIssues = await upstream.json();
        sendJson(response, 200, [...localIssues, ...upstreamIssues].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        return;
      }
      response.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' });
      response.end(Buffer.from(await upstream.arrayBuffer()));
      return;
    }
    if (url.pathname === '/status-history.js' || url.pathname === '/status-history.css') {
      const asset = url.pathname.endsWith('.js') ? 'status-history.js' : 'status-history.css';
      response.writeHead(200, { 'content-type': mime[extname(asset)], 'cache-control': 'no-store' });
      const contents = readFileSync(join(root, 'assets', asset), 'utf8');
      response.end(asset.endsWith('.js') ? contents.replace('https://raw.githubusercontent.com/Sakneen/uptime-status/master/history/summary.json', '/local-history-summary.json') : contents);
      return;
    }
    if (url.pathname === '/local-history-summary.json') {
      sendJson(response, 200, localSummary());
      return;
    }
    if (url.pathname === '/') {
      const file = rewriteGeneratedAsset(generatedFile('index.html'), 'index.html');
      response.writeHead(200, { 'content-type': mime['.html'], 'cache-control': 'no-store' });
      response.end(file);
      return;
    }
    if (/^\/(history\/[^/?]+|incident\/\d+)\/?$/.test(url.pathname)) {
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
    const requested = request.url.replace(/^\//, '');
    const file = normalize(join(previewRoot, requested));
    if (!file.startsWith(previewRoot) || !existsSync(file)) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'content-type': mime[extname(file)] || 'text/plain; charset=utf-8' });
    response.end(readFileSync(file));
  } catch (error) { response.writeHead(500); response.end(String(error)); }
});

server.listen(port, '127.0.0.1', () => console.log(`Local uptime preview: http://127.0.0.1:${port}`));
