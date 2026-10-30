// Mega Menü — hover + tık + dışarı tıkla
document.querySelectorAll('[data-mega]').forEach(item => {
  const btn = item.querySelector('.nav-btn');
  if (!btn) return;

  let timer;

  item.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    document.querySelectorAll('[data-mega]').forEach(i => {
      if (i !== item) i.classList.remove('is-open');
    });
    item.classList.add('is-open');
  });

  item.addEventListener('mouseleave', () => {
    timer = setTimeout(() => item.classList.remove('is-open'), 160);
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    item.classList.toggle('is-open');
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-mega]')) {
    document.querySelectorAll('[data-mega]').forEach(i => i.classList.remove('is-open'));
  }
});

// Theme toggle — basit dark/light geçiş
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.documentElement.classList.toggle('light-mode');
  });
}
