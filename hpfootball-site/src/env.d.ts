// Minimal runtime type declaration for the Cloudflare Workers virtual module.
// Required so `import { env } from 'cloudflare:workers'` type-checks under
// `astro check`. Generated types (`wrangler types`) cannot be produced in this
// PRoot environment (workerd/TCMalloc), so this declares only the bindings this
// release actually reads. Bindings not listed here are intentionally absent.
declare module 'cloudflare:workers' {
  interface Env {
    YOUTUBE_API_KEY?: string;
    YOUTUBE_CHANNEL_ID?: string;
  }
  export const env: Env;
}
