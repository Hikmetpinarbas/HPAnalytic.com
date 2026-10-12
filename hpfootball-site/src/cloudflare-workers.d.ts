// Minimal ambient type for the Worker runtime module; avoids adding @cloudflare/workers-types.
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
