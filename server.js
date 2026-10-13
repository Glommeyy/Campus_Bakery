import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.jpg': 'image/jpeg' };
const allowed = new Set(['index.html', 'app.js', 'pos.js', 'illustrations.js', 'assets/tailwind.css']);
for (const product of ['pandesal', 'ensaymada', 'spanish', 'cupcake', 'loaf', 'coffee']) allowed.add(`assets/products/${product}.jpg`);
const port = Number(process.env.PORT || 3000);
http.createServer(async (req, res) => {
  const requested = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!allowed.has(requested)) { res.writeHead(404); res.end('Not found'); return; }
  try { const content = await readFile(path.join(root, requested)); res.writeHead(200, { 'Content-Type': `${types[path.extname(requested)] || 'text/plain'}; charset=utf-8`, 'Cache-Control': 'no-cache' }); res.end(content); }
  catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Campus Bakery is ready at http://localhost:${port}`));
