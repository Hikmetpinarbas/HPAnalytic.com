import { defineConfig } from 'vite';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: { outDir: 'dist' },
  server: { port: 5173, host: '0.0.0.0' },
  plugins: [{
    name: 'content-loader',
    configureServer(server) {
      server.middlewares.use('/api/analiz', (req, res) => {
        const dir = resolve(process.cwd(), 'content/analiz');
        try {
          const files = readdirSync(dir).filter(f => f.endsWith('.md'));
          const list = files.map(f => {
            const raw = readFileSync(resolve(dir, f), 'utf-8');
            const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            const meta = {};
            if (m) m[1].split('\n').forEach(line => {
              const [k, ...v] = line.split(':');
              if (k) meta[k.trim()] = v.join(':').trim();
            });
            return { slug: f.replace('.md', ''), ...meta };
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(list));
        } catch { res.end('[]'); }
      });
    }
  }]
});
