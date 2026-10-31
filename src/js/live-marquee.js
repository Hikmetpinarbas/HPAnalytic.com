// Canlı Skor & Yapay Zeka Hikaye Şeridi
const STATIC_FACTS = [
  "2005 İstanbul: Milan 3-0 öndeydi. 6 dakikada 3 gol. Futbol skorla bitmez.",
  "Kadın futbolcuların eklem esnekliği daha yüksek. Dar alanda çalım avantajı.",
  "Mesut Özil: Türkiye'de hiç oynamadı. Ama Real Madrid'e gitti. Kimlik formayla mı ölçülür?",
  "Sürpriz sonuç: Leicester City. 5000'e 1 oran. Ama model değil, mekanizma kazandı.",
  "Türk voleybolu: 2023 Milletler Ligi şampiyonluğu. Bu bir tesadüf değil, sistemin sonucu."
];

function initLiveMarquee() {
  const jersey = document.querySelector('.jersey-section');
  if (!jersey) {
    console.warn('Jersey section bulunamadı, marquee eklenemedi.');
    return;
  }

  // Eski şeridi kaldır
  const old = document.querySelector('.marquee-section');
  if (old) old.remove();

  // Şeridi hemen statik verilerle oluştur (API beklerken sayfa boş kalmasın)
  const createHTML = (text) => `
    <span style="padding: 0 4rem; font-size: 11px; letter-spacing: 0.15em; color: var(--ink-soft); display: inline-flex; align-items: center;">${text}</span>
    <span style="padding: 0 4rem; font-size: 11px; letter-spacing: 0.15em; color: var(--ink-soft); display: inline-flex; align-items: center;">${text}</span>
  `;

  const section = document.createElement('section');
  section.className = 'marquee-section';
  section.style.cssText = 'overflow: hidden; white-space: nowrap; padding: 20px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); display: flex; cursor: default;';
  section.innerHTML = `<div class="marquee-track" style="animation-duration: 35s;">${createHTML(STATIC_FACTS[0])}</div>`;
  
  jersey.insertAdjacentHTML('afterend', section.outerHTML);

  // API'lerden veri çekip havuzu güncelle
  async function loadData() {
    let pool = [...STATIC_FACTS];
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const matchRes = await fetch(`/api/footballdata/matches?dateFrom=${today}&dateTo=${today}`);
      const matchData = await matchRes.json();
      
      if (matchData.matches && matchData.matches.length > 0) {
        const active = matchData.matches.filter(m => ['IN_PLAY', 'PAUSED', 'SCHEDULED'].includes(m.status));
        const matchStrings = active.map(m => {
          const home = m.homeTeam.shortName || m.homeTeam.name;
          const away = m.awayTeam.shortName || m.awayTeam.name;
          if (['IN_PLAY', 'PAUSED'].includes(m.status)) {
            return `🔴 CANLI: ${home} ${m.score.fullTime.home} - ${m.score.fullTime.away} ${away}`;
          }
          const time = new Date(m.utcDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
          return `⏰ ${time} · ${home} - ${away}`;
        }).slice(0, 3);
        
        pool = [...matchStrings, ...pool];
      }
    } catch(e) { console.warn('Maç verisi çekilemedi:', e); }

    try {
      const aiRes = await fetch('/api/groq/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: 'Sen bir futbol tarihçisisin. Sadece istenen bilgiyi ver. En fazla 15 kelime.' },
            { role: 'user', content: 'Futbol tarihinden çok ilginç bir gerçeği tek bir kısa cümleyle yaz.' }
          ],
          max_tokens: 30, temperature: 0.8
        })
      });
      const aiData = await aiRes.json();
      if (aiData.choices && aiData.choices[0]) {
        const fact = aiData.choices[0].message.content.trim().replace(/^"|"$/g, '');
        pool.unshift(fact); // AI'ı en başa koy
      }
    } catch(e) { console.warn('AI verisi çekilemedi:', e); }

    return pool;
  }

  // Verileri al ve şeridi döndür
  loadData().then(finalPool => {
    let idx = 0;
    setInterval(() => {
      const activeMarquee = document.querySelector('.marquee-section');
      if (!activeMarquee) return;
      idx = (idx + 1) % finalPool.length;
      
      activeMarquee.style.transition = 'opacity 0.5s ease';
      activeMarquee.style.opacity = '0';
      
      setTimeout(() => {
        activeMarquee.innerHTML = `<div class="marquee-track" style="animation-duration: 35s;">${createHTML(finalPool[idx])}</div>`;
        activeMarquee.style.opacity = '1';
      }, 500);
    }, 15000);
  });
}

// DOM hazır olduğunda başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLiveMarquee);
} else {
  initLiveMarquee();
}
