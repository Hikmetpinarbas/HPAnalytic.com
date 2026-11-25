// HP-MISTRAL-WAVE1-SITE-01 — Yayın hattı: Son Analizler / Yaklaşan Karşılaşmalar / Arşiv.
// Fail-closed: veri yoksa "veri yok" durumu gösterilir; içerik, tarih veya skor uydurulmaz.
const FIXTURES_URL = '/assets/data/yaklasan-karsilasmalar.json';

async function loadJSON(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderCard(item) {
  const chip = item.durum === 'inceleme'
    ? '<span class="yh-chip">Yayın adayı · İncelemede</span>'
    : `<span class="yh-chip">${escapeHtml(item.durum || 'Belirsiz')}</span>`;
  const date = item.tarih_dogrulanmis === true
    ? `<span class="yh-date">${escapeHtml(item.tarih)}</span>`
    : '<span class="yh-date yh-date-tbc">Tarih doğrulanmadı</span>';
  const body = `<div class="yh-card">
      <div class="yh-card-head"><span class="yh-vs">${escapeHtml(item.yaris)}</span>${date}</div>
      <p class="yh-note">${escapeHtml(item.aciklama || 'İçerik henüz yok; veri uydurulmayacaktır.')}</p>
      ${chip}
    </div>`;
  return item.href ? `<a class="yh-link" href="${escapeHtml(item.href)}">${body}</a>` : body;
}

export async function initYayinHatti() {
  const root = document.getElementById('yayin-hatti');
  if (!root) return;
  const body = root.querySelector('#yh-fixtures');
  if (!body) return;
  const data = await loadJSON(FIXTURES_URL);
  const items = data && Array.isArray(data.items) ? data.items : [];
  const candidates = items.filter(x => x && x.yaris && x.yayin_adayi === true && x.durum === 'inceleme' && x.tarih_dogrulanmis !== true && !x.href && !x.score);
  if (!data || candidates.length === 0) {
    body.innerHTML = '<div class="yh-empty">Doğrulanmış yaklaşan karşılaşma yok — aday ve tarih uydurulmaz.</div>';
    root.dataset.state = 'empty';
    return;
  }
  body.innerHTML = candidates.map(renderCard).join('');
  root.dataset.state = 'ready';
}
