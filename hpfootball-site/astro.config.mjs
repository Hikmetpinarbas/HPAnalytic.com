import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
// `site` drives canonical and Open Graph URLs only; it does not deploy anything.
export default defineConfig({ output:'server', adapter:cloudflare(), site:'https://hpanalytic.com' });
