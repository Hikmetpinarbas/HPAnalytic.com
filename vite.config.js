import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.env.HOME, '.config/hp-intelligence/api_keys.env');
const apiKeys = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  lines.forEach(line => {
    const idx = line.indexOf('=');
    if (idx > 0) {
      const k = line.slice(0, idx).trim();
      let v = line.slice(idx + 1).trim();
      // Tırnakları temizle (API'lerin reddetmesinin asıl sebebi bu)
      v = v.replace(/^["']|["']$/g, '');
      if (k && v) apiKeys[k] = v;
    }
  });
}

const getKey = (name) => (process.env[name] || apiKeys[name] || '').trim();

export default defineConfig({
  server: {
    proxy: {
      '/api/footballdata': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/footballdata/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key = getKey('FOOTBALL_DATA_TOKEN');
            if (key) proxyReq.setHeader('X-Auth-Token', key);
          });
        }
      },
      '/api/groq': {
        target: 'https://api.groq.com/openai/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/groq/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key = getKey('GROQ_API_KEY');
            if (key) proxyReq.setHeader('Authorization', `Bearer ${key}`);
          });
        }
      }
    }
  }
});
