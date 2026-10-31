const GOALS = [
  { minute: '27\'', player: 'Yunus Akgün', type: 'Pas + taşıma', steps: ['Jakobs pas', 'Barış Alper taşıma', 'Yunus bitiriş'] },
  { minute: '38\'', player: 'Batrakov', type: 'Taşıma + kilit pas', steps: ['Sallai taşıma', 'Sallai kilit pas', 'Batrakov bitiriş'] },
  { minute: '58\'', player: 'Bentaleb (KK)', type: 'Ceza sahası girişi', steps: ['Sara pas', 'Kutu girişi', 'KK'] },
  { minute: '73\'', player: 'Osimhen', type: 'Top kazanımı + hızlı hücum', steps: ['Bardakcı kazanım', 'Batrakov taşıma', 'Barış Alper pas', 'Osimhen bitiriş'] },
];

export function renderAttackFlow(container) {
  container.innerHTML = `
    <div class="af-wrap">
      <div class="af-grid">
        ${GOALS.map((g, i) => `
          <div class="af-goal" data-idx="${i}">
            <div class="af-head">
              <span class="af-min">${g.minute}</span>
              <span class="af-player">${g.player}</span>
            </div>
            <div class="af-type">${g.type}</div>
            <div class="af-steps">
              ${g.steps.map((s, j) => `<span class="af-step">${j+1}. ${s}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <p class="af-note">Dört gol dört farklı mekanizma. Dördüncü golün ayrımı hız değil: kazanım → taşıma → son pas zinciri.</p>
    </div>`;
}
