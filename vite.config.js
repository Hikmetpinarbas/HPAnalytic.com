import { defineConfig } from 'vite';
export default defineConfig({
  base: '/',
  root: '.',
  publicDir: 'public',
  build: { outDir: 'dist' },
  server: { port: 5173, host: '0.0.0.0' }
});
