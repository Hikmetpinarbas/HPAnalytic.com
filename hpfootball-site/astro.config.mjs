import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import editorialStudio from './src/studio/integration.mjs';
// `site` drives canonical and Open Graph URLs only; it does not deploy anything.
export default defineConfig({
  output:'server',
  adapter:cloudflare({ session: false }),
  site:'https://hpanalytic.com',
  integrations:[editorialStudio()],
});
