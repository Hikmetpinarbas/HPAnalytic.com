// HPAnalytic — Görsel Tema
export const DNA = {
  bg:     '#0A0A0A',
  panel:  '#111311',
  ink:    '#EDEFEA',
  dim:    '#8A8F86',
  grid:   '#1E211D',
  neon:   '#B4FF39',
  orange: '#FF6B35',
  alert:  '#FF3B3B',
  font:   "'IBM Plex Mono', monospace",
  serif:  "'Playfair Display', Georgia, serif",
  ease:   'power3.out',
};
export function applyTheme(root = document.documentElement) {
  const v = {
    '--viz-bg': DNA.bg, '--viz-panel': DNA.panel, '--viz-ink': DNA.ink,
    '--viz-dim': DNA.dim, '--viz-grid': DNA.grid, '--viz-neon': DNA.neon,
    '--viz-orange': DNA.orange, '--viz-alert': DNA.alert,
    '--viz-font': DNA.font, '--viz-serif': DNA.serif,
  };
  for (const [k, val] of Object.entries(v)) root.style.setProperty(k, val);
}
export const scale = {
  neonToDim: (t) => t >= 0.66 ? DNA.neon : t >= 0.33 ? DNA.orange : DNA.dim,
  energy:    (t) => t >= 0.5  ? DNA.neon : DNA.orange,
  phase:     (i) => [DNA.neon, DNA.orange, '#7A8F66', '#4A5A40', '#2A3326'][i % 5],
};
