(() => {
  function init() {
    const news = document.querySelector(".hpa-news");
    if (news) {
      document.body.classList.add("hpa-home");
      news.querySelector(".hpa-ticker-toggle")?.addEventListener("click", e => {
        const paused = news.classList.toggle("is-paused");
        e.currentTarget.setAttribute("aria-pressed", String(paused));
        e.currentTarget.textContent = paused ? "Akışı sürdür" : "Akışı durdur";
      });
    }
    if (!/\/yazi\/[^/]+\.html$/.test(location.pathname)) return;
    const article = document.querySelector("article.article, article");
    if (!article) return;
    document.body.classList.add("hpa-reading");
    let bar = document.getElementById("progress");
    if (!bar) { bar = document.createElement("div"); bar.id = "progress"; document.body.append(bar); }
    if (bar.querySelector(".hpa-reading-fill")) return;
    const fill = document.createElement("span");
    fill.className = "hpa-reading-fill";
    bar.append(fill);
    function update() {
      const rect = article.getBoundingClientRect();
      const start = rect.top + window.scrollY;
      const distance = rect.height - window.innerHeight;
      const fraction = distance <= 0 ? (rect.bottom <= window.innerHeight ? 1 : 0) : (window.scrollY - start) / distance;
      fill.style.transform = `scaleX(${Math.max(0, Math.min(1, fraction))})`;
    }
    let frame = 0;
    window.addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); }, { passive: true });
    window.addEventListener("load", update);
    update();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
