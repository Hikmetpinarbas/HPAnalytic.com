// Editorial Studio routes exist ONLY when the Studio is explicitly switched on
// (HP_STUDIO=1, local dev). Without the flag the routes are never injected, so
// a production build contains no Studio page, no Studio code and no Studio
// strings — the private surface cannot leak into the public site or bundle.

export const STUDIO_ROUTES = [
  { pattern: '/studio/editorial', entrypoint: './src/studio/pages/index.astro' },
  { pattern: '/studio/editorial/[id]', entrypoint: './src/studio/pages/topic.astro' },
];

export function studioEnabled(env = process.env) {
  return env.HP_STUDIO === '1';
}

export default function editorialStudio({ env = process.env } = {}) {
  return {
    name: 'hpanalytic-editorial-studio',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, logger }) => {
        if (!studioEnabled(env)) return;
        if (command === 'build') {
          throw new Error('Editorial Studio is local-only: unset HP_STUDIO before `astro build`.');
        }
        for (const route of STUDIO_ROUTES) injectRoute({ ...route, prerender: false });
        logger.info('Editorial Studio enabled at /studio/editorial (local only).');
      },
    },
  };
}
