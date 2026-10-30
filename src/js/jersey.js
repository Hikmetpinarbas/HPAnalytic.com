const JERSEYS = [
  {
    num: '7',
    name: 'Lobanovskyi · Dynamo',
    era: '1975—1990',
    info: 'Sistem, bireyden önce gelir.',
    link: '/yazi/articles-valeriy-lobanovskyi-takimin-zekasini-tasarlamak.html',
  },
  {
    num: '14',
    name: 'Cruyff · Ajax',
    era: '1971—1973',
    info: 'Top, en hızlı pasla gider.',
  },
  {
    num: '6',
    name: 'Sacchi · Milan',
    era: '1987—1991',
    info: 'Ofsayt bir savunma değil, tuzaktır.',
  },
  {
    num: '10',
    name: 'Cruyff · Barça',
    era: '1988—1996',
    info: 'Alanı değil, zamanı daraltmak.',
  },
  {
    num: '8',
    name: 'Guardiola · Barça',
    era: '2008—2012',
    info: 'Pozisyonel oyun: top değil, alan.',
  },
  {
    num: '4',
    name: 'Klopp · Liverpool',
    era: '2015—2024',
    info: 'Gegenpressing bir fırsat değil, davettir.',
  },
];

const SVG = (num) => `
<svg class="jersey-svg" viewBox="0 0 100 116" aria-hidden="true">
  <path d="M26,18 L38,12 L50,17 L62,12 L74,18 L84,38 L70,44 L66,102 L34,102 L30,44 L16,38 Z"/>
  <path d="M40,12 Q50,22 60,12" />
  <text x="50" y="72">${num}</text>
</svg>`;

let timer = null;
let idx = 0;
let paused = false;

function setActive(cards, i, scroll = true) {
  cards.forEach((c, j) => c.classList.toggle('on', j === i));
  if (scroll) {
    const card = cards[i];
    const deck = card.parentElement;
    const left = card.offsetLeft - deck.offsetWidth / 2 + card.offsetWidth / 2;
    deck.scrollTo({ left, behavior: 'smooth' });
  }
}

function startAuto(cards) {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (paused) return;
    idx = (idx + 1) % cards.length;
    setActive(cards, idx);
  }, 4000);
}

export function initJersey(deckId) {
  const deck = document.getElementById(deckId);
  if (!deck || deck.dataset.ready === '1') return;

  deck.innerHTML = JERSEYS.map((j, i) => `
    <div class="jersey-card${i === 0 ? ' on' : ''}" data-idx="${i}" role="button" tabindex="0">
      ${SVG(j.num)}
      <div class="jersey-name">${j.name}<br><span style="color:var(--ink-faint);font-size:8px;">${j.era}</span></div>
      <div class="jersey-info">${j.info}</div>
    </div>`).join('');

  const cards = Array.from(deck.querySelectorAll('.jersey-card'));

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      idx = i;
      setActive(cards, i);
      paused = true;
      setTimeout(() => { paused = false; }, 8000);
      const link = JERSEYS[i].link;
      if (link) {
        card.addEventListener('click', () => { window.location.href = link; }, { once: true });
      }
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  startAuto(cards);
  deck.dataset.ready = '1';
}
