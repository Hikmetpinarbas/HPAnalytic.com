// Fluid type scale (Utopia method: linear interpolation between a min and max
// viewport, expressed as CSS clamp()). Re-implemented from the published
// formula; utopia-core (ISC) was used as reference only.
export const TYPE_CONFIG = Object.freeze({
  minWidth: 360,
  maxWidth: 1440,
  minFontSize: 17,
  maxFontSize: 19,
  minTypeScale: 1.2,
  maxTypeScale: 1.333,
});

const round = (n) => Math.round(n * 10000) / 10000;

export function clampFor(minSize, maxSize, { minWidth, maxWidth } = TYPE_CONFIG) {
  const slope = (maxSize - minSize) / (maxWidth - minWidth);
  const intercept = minSize - slope * minWidth;
  const lower = Math.min(minSize, maxSize);
  const upper = Math.max(minSize, maxSize);
  return `clamp(${round(lower / 16)}rem, ${round(intercept / 16)}rem + ${round(slope * 100)}vw, ${round(upper / 16)}rem)`;
}

export function typeStep(step, config = TYPE_CONFIG) {
  const minSize = config.minFontSize * config.minTypeScale ** step;
  const maxSize = config.maxFontSize * config.maxTypeScale ** step;
  return { step, minSize, maxSize, clamp: clampFor(minSize, maxSize, config) };
}

export function typeScale(steps = [-1, 0, 1, 2, 3, 4, 5, 6], config = TYPE_CONFIG) {
  return steps.map((step) => typeStep(step, config));
}

// WCAG 1.4.4: text must remain resizable to 200%. With viewport-relative type,
// that holds only when maxSize <= 2.5 × minSize (Barvian, fluid.style).
export function passesResizeRule({ minSize, maxSize }) {
  return maxSize <= minSize * 2.5;
}
