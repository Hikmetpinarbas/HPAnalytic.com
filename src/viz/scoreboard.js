// HPAnalytic — Skor Tabelası
import { gsap } from 'gsap';
import { DNA } from './theme.js';

export function renderScoreboard(container, data) {
  const s = data.summary;
  const p = data.pressure;
  const teams = Object.keys(s.passes.by_team);

  container.innerHTML = `
    <div class="hp-scoreboard">
      <div class="hs-team hs-team-home">${teams[1].toUpperCase()}</div>
      <div class="hs-vs">VS</div>
      <div class="hs-team hs-team-away">${teams[0].toUpperCase()}</div>
      <div class="hs-val hs-val-home">${s.passes.by_team[teams[1]] || 0}</div>
      <div class="hs-label">Pas</div>
      <div class="hs-val hs-val-away">${s.passes.by_team[teams[0]] || 0}</div>
      <div class="hs-val hs-val-home">${s.shots.by_team[teams[1]] || 0}</div>
      <div class="hs-label">Şut</div>
      <div class="hs-val hs-val-away">${s.shots.by_team[teams[0]] || 0}</div>
      <div class="hs-val hs-val-home">${s.goals.by_team[teams[1]] || 0}</div>
      <div class="hs-label">Gol</div>
      <div class="hs-val hs-val-away">${s.goals.by_team[teams[0]] || 0}</div>
      <div class="hs-val hs-val-home">${p.ppda || '—'}<div class="hs-sub">1Y: ${p.ppda_1h || '—'} | 2Y: ${p.ppda_2h || '—'}</div></div>
      <div class="hs-label">PPDA</div>
      <div class="hs-val hs-val-away">${p.high_press_wins || 0}<div class="hs-sub">Yüksek Pres</div></div>
    </div>
  `;

  // CSS
  const style = document.createElement('style');
  style.textContent = `
    .hp-scoreboard {
      display: grid;
      grid-template-columns: 1fr 100px 1fr;
      background: ${DNA.panel};
      border: 1px solid ${DNA.grid};
      max-width: 760px;
      margin: 0 auto;
      font-family: ${DNA.font};
    }
    .hs-team {
      padding: 24px;
      text-align: center;
      border-bottom: 1px solid ${DNA.grid};
      font-family: ${DNA.serif};
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .hs-team-home { color: ${DNA.orange}; }
    .hs-team-away { color: ${DNA.neon}; }
    .hs-vs {
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${DNA.dim};
      font-size: 0.85rem;
      border-bottom: 1px solid ${DNA.grid};
    }
    .hs-val {
      padding: 20px;
      text-align: center;
      font-size: 2.4rem;
      font-weight: 600;
      border-bottom: 1px solid ${DNA.grid};
    }
    .hs-val-home { color: ${DNA.orange}; border-right: 1px solid ${DNA.grid}; }
    .hs-val-away { color: ${DNA.neon}; border-left: 1px solid ${DNA.grid}; }
    .hs-label {
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${DNA.dim};
      font-size: 0.7rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-bottom: 1px solid ${DNA.grid};
    }
    .hs-sub {
      font-size: 0.7rem;
      color: ${DNA.dim};
      margin-top: 6px;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    .hp-scoreboard > *:nth-last-child(-n+3) {
      border-bottom: none;
    }
  `;
  container.appendChild(style);

  // GSAP giriş
  gsap.from(container.querySelectorAll('.hs-val'), {
    opacity: 0, y: 20, duration: 0.6, stagger: 0.08, ease: 'power3.out'
  });
}
