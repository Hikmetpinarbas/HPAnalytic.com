// Disclosure-pattern reducer for the mobile navigation panel.
// The panel is non-modal (WAI-ARIA APG "disclosure navigation"), so it closes
// whenever the user leaves it instead of trapping focus.
const CLOSING_EVENTS = new Set(['escape', 'navigate', 'outside', 'focusout', 'desktop']);

export function nextMobileMenuState(isOpen, event) {
  if (event === 'trigger') return !isOpen;
  if (CLOSING_EVENTS.has(event)) return false;
  return Boolean(isOpen);
}
