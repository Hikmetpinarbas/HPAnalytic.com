export function nextMobileMenuState(isOpen, event) {
  if (event === 'trigger') return !isOpen;
  if (event === 'escape' || event === 'navigate') return false;
  return Boolean(isOpen);
}
