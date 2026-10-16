// Homepage surface rules: EMPTY SURFACE = HIDDEN SURFACE. Nothing here fabricates content;
// it only decides which real, verified surfaces the homepage may advertise.

const isValidMatchRow = (m) =>
  !!m && typeof m.home === 'string' && m.home.trim() !== '' &&
  typeof m.away === 'string' && m.away.trim() !== '' &&
  typeof m.utcDate === 'string' && !Number.isNaN(Date.parse(m.utcDate));

export function validMatchRows(matchCentre) {
  const rows = Array.isArray(matchCentre?.matches) ? matchCentre.matches : [];
  return rows.filter(isValidMatchRow);
}

export function shouldShowMatchCentre(matchCentre) {
  return matchCentre?.status === 'READY' && validMatchRows(matchCentre).length > 0;
}

export function heroPrimaryCta(publicAnalysisCount) {
  return publicAnalysisCount > 0
    ? {href: '/analysis', label: 'ANALİZLERİ KEŞFET'}
    : {href: '/archive', label: 'YAYIMLANANLARI OKU'};
}

export function launchDirectoryLinks(publicAnalysisCount) {
  const links = [];
  if (publicAnalysisCount > 0) links.push({href: '/analysis', kind: 'ANALİZ', title: 'Oyunu çözümle', note: 'Yayımlanmış futbol analizleri'});
  links.push({href: '/research', kind: 'ARAŞTIRMA YÖNTEMİ', title: 'Kanıtı nasıl sorguluyoruz', note: 'Yöntem notu: kaynak, kanıt ve belirsizlik'});
  links.push({href: '/scouting', kind: 'SCOUTING YÖNTEMİ', title: 'Rolü ve bağlamı nasıl okuyoruz', note: 'Yöntem notu: oyuncu kararına analitik yaklaşım'});
  links.push({href: '/archive', kind: 'ARŞİV', title: 'Yayımlananları oku', note: 'Mevcut onaylı içerikler'});
  return links.map((link, i) => ({...link, index: String(i + 1).padStart(2, '0')}));
}
