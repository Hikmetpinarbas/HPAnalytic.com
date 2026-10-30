(function () {
  if (window.__flipLoaded) return;
  window.__flipLoaded = true;

  // Radar panelindeki listeyi bekle
  const watch = setInterval(() => {
    const list = document.getElementById('rf-list');
    if (!list) return;

    const apply = () => {
      // Her radar-item'ı bir flip card açılış tetikleyicisi yap
      list.querySelectorAll('.radar-item').forEach(item => {
        if (item.dataset.flipReady) return;
        item.dataset.flipReady = '1';
        item.style.cursor = 'pointer';
      });
    };

    apply();
    new MutationObserver(apply).observe(list, { childList: true });
    clearInterval(watch);
  }, 300);

  setTimeout(() => clearInterval(watch), 5000);
})();
