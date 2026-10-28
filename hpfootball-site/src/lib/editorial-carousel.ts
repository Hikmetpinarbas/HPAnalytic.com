/** Native scroll remains usable without JavaScript. No timer or automatic playback. */
export function initEditorialCarousel(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-story-track]');
  if (!track) return () => {};
  const panels = Array.from(track.querySelectorAll<HTMLElement>('[data-story-panel]'));
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-story-tab]'));
  const previous = root.querySelector<HTMLButtonElement>('[data-story-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-story-next]');
  const count = root.querySelector<HTMLElement>('[data-story-count]');
  if (!panels.length) return () => {};
  const abort = new AbortController();
  const { signal } = abort;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let frame = 0;
  // Use real positions: slide gaps and container padding must not break selection.
  const position = (panel: HTMLElement) => panel.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
  const update = (index: number) => {
    active = Math.max(0, Math.min(panels.length - 1, index));
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === active)); tab.tabIndex = i === active ? 0 : -1; });
    // Inactive links must not be reached while their slide is off screen.
    panels.forEach((panel, i) => { panel.inert = i !== active; });
    if (previous) previous.disabled = active === 0;
    if (next) next.disabled = active === panels.length - 1;
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
  };
  const nearest = () => panels.reduce((best, panel, i) => Math.abs(position(panel) - track.scrollLeft) < Math.abs(position(panels[best]) - track.scrollLeft) ? i : best, 0);
  const go = (index: number, focus = false) => {
    index = Math.max(0, Math.min(panels.length - 1, index));
    update(index);
    track.scrollTo({ left: position(panels[index]), behavior: reduced.matches ? 'instant' : 'smooth' });
    if (focus) tabs[index]?.focus({ preventScroll: true });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => go(i), { signal });
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      go(event.key === 'Home' ? 0 : event.key === 'End' ? panels.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : panels.length - 1)) % panels.length, true);
    }, { signal });
  });
  previous?.addEventListener('click', () => go(active - 1), { signal });
  next?.addEventListener('click', () => go(active + 1), { signal });
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => update(nearest()));
  }, { passive: true, signal });
  // Re-align after resizing rather than interpreting the old pixel offset as a new slide.
  const resize = new ResizeObserver(() => {
    track.scrollTo({ left: position(panels[active]), behavior: 'instant' });
  });
  resize.observe(track);
  update(nearest());
  return () => { abort.abort(); resize.disconnect(); cancelAnimationFrame(frame); panels.forEach(panel => { panel.inert = false; }); };
}
