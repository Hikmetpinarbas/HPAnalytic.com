(function () {
  if (window.__extras2Loaded) return;
  window.__extras2Loaded = true;

  // ═══ 1. MAGNETIC BUTTONS ═══
  if (window.matchMedia('(hover: hover)').matches) {
    const magneticTargets = document.querySelectorAll(
      '.cta-link, .featured-cta, .jnav, .nav-link, .header-cta, .lab-tab, .filter-btn'
    );
    magneticTargets.forEach((el) => {
      el.setAttribute('data-magnetic', '');
      let active = false;
      el.addEventListener('mouseenter', () => {
        active = true;
        el.classList.add('magnetic-active');
      });
      el.addEventListener('mousemove', (e) => {
        if (!active) return;
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => {
        active = false;
        el.classList.remove('magnetic-active');
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ═══ 2. GLOSSARY TOOLTIPS ═══
  const TERMS = {
    'xG': 'Expected Goals — bir şutun gol olma olasılığı. Kaliteli pozisyonu ölçer, gerçekleşen golü değil.',
    'xT': 'Expected Threat — topun bir bölgeden gole dönüşme olasılığa katkısı. Pas ve dripling değerini ölçer.',
    'xA': 'Expected Assists — pasın asist olma olasılığı.',
    'PPDA': 'Passes Per Defensive Action — rakibin izin verdiği pas sayısı bölü savunma aksiyonu. Düşük = yoğun pres.',
    'xGC': 'Expected Goal Conversion — gol dönüşüm beklentisi.',
    'NxG': 'Net xG — oyuncu sahadayken ürettiği xG eksi yediği xG.',
    'xGD': 'Defensive xG — oyuncunun savunmadaki xG katkısı.',
    'pas ağı': 'Oyuncular arasındaki pas bağlantılarını gösteren harita. Pas kanallarını ve merkezi görselleştirir.',
    'yarı alan': 'Half-space — sahanın ortası ile kanadı arasındaki dikey bölge. Modern taktiğin kalbi.',
    'pres': 'Topa sahip olmayan takımın, rakibi topu kaybetmeye zorlamak için yaptığı baskı.',
    'geçiş': 'Transition — top kazanma veya kaybetme anında oyunun hızlıca değiştiği faz.',
    'yarı saha': 'Sahanın bir takımın hücum ettiği yarı.',
    'bek': 'Full-back — savunmanın sağında ve solunda oynayan, modern futbolda hücuma da katılan oyuncu.',
    'kanat': 'Wing — sahanın kenarlarındaki bölge. Genişlik ve 1v1 için kullanılır.'
  };

  const TERM_KEYS = Object.keys(TERMS).sort((a, b) => b.length - a.length);

  function tagTerms(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        if (n.parentElement.closest('.hpa-gloss, .hpa-gloss-tip, script, style, code, pre')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = node.textContent;
      let replaced = false;
      let result = '';
      let lastIndex = 0;
      TERM_KEYS.forEach((term) => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        let m;
        while ((m = regex.exec(text)) !== null) {
          if (m.index < lastIndex) continue;
          result += text.slice(lastIndex, m.index);
          result += `<span class="hpa-gloss" data-term="${m[0]}">${m[0]}</span>`;
          lastIndex = m.index + m[0].length;
          replaced = true;
        }
      });
      if (replaced) {
        result += text.slice(lastIndex);
        const span = document.createElement('span');
        span.innerHTML = result;
        node.parentNode.replaceChild(span, node);
      }
    });
  }

  // Tooltip
  const tip = document.createElement('div');
  tip.className = 'hpa-gloss-tip';
  document.body.appendChild(tip);

  document.addEventListener('mouseover', (e) => {
    const g = e.target.closest('.hpa-gloss');
    if (!g) return;
    const term = g.dataset.term;
    const def = TERMS[term];
    if (!def) return;
    const r = g.getBoundingClientRect();
    tip.innerHTML = `<b>${term}</b>${def}`;
    tip.style.left = Math.min(r.left, window.innerWidth - 300) + 'px';
    tip.style.top = (r.bottom + 8) + 'px';
    tip.classList.add('show');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.hpa-gloss')) tip.classList.remove('show');
  });
  document.addEventListener('click', (e) => {
    const g = e.target.closest('.hpa-gloss');
    if (!g) return;
    // Mobil: tıklayınca göster
    const term = g.dataset.term;
    const def = TERMS[term];
    if (!def) return;
    const r = g.getBoundingClientRect();
    tip.innerHTML = `<b>${term}</b>${def}`;
    tip.style.left = Math.max(16, Math.min(r.left, window.innerWidth - 300)) + 'px';
    tip.style.top = (r.bottom + 8) + 'px';
    tip.classList.toggle('show');
  });

  // Ana sayfa + yazı içeriğinde terimleri etiketle
  setTimeout(() => {
    tagTerms(document.querySelector('.article, .article-body'));
    tagTerms(document.querySelector('.featured-card, .hero-desc, .hero p'));
    document.querySelectorAll('.c-card-title, .c-card-excerpt').forEach(el => tagTerms(el));
  }, 500);

  // ═══ 3. LIVE TICKER ═══
  fetch('/assets/data/matches.json')
    .then((r) => r.json())
    .then((matches) => {
      const marquee = document.querySelector('.marquee, [class*="marquee"]');
      if (!marquee || !matches.length) return;
      const track = marquee.querySelector('[class*="track"], .marquee-track');
      if (!track) return;

      // İlk 8 maçı al
      const top = matches.slice(0, 8);
      const items = top.map((m) => {
        const match = m.match || '—';
        const goals = m.goals != null ? m.goals : '—';
        const shots = m.shots != null ? m.shots : '—';
        return `<span class="ticker-item"><strong>${match}</strong><span class="ticker-score">${goals} gol · ${shots} şut</span></span>`;
      }).join('');

      // İçeriği değiştir — 2 kopya seamless loop için
      track.innerHTML = `<div class="ticker-group">${items}</div><div class="ticker-group">${items}</div>`;
    })
    .catch(() => {});

  // Ticker grup stili
  const style = document.createElement('style');
  style.textContent = `
    .ticker-group { display: inline-flex; padding-right: 0; }
  `;
  document.head.appendChild(style);
})();
