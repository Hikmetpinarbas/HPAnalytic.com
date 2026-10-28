import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import editorialStudio from './src/studio/integration.mjs';
// `site` drives canonical and Open Graph URLs only; it does not deploy anything.
// Sessions and Cloudflare Images are unused: `session:false` (top-level Astro
// option) and `imageService:'passthrough'` keep the generated Worker config
// free of SESSION KV and IMAGES bindings.
export default defineConfig({
  output:'server',
  session:false,
  adapter:cloudflare({ imageService:'passthrough',prerenderEnvironment:process.env.HPA_PRERENDER_RUNTIME==='node'?'node':'workerd' }),
  site:'https://www.hpanalytic.com',
  integrations:[editorialStudio()],
});
