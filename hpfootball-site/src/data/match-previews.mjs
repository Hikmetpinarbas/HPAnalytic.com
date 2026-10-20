// Interactive match pages that live outside the markdown collections.
// Each entry is a hand-built, source-checked page under /mac/.
export const MATCH_PREVIEWS = [
  {
    slug: 'fenerbahce-slavia-prag-2026-10-20',
    href: '/mac/fenerbahce-slavia-prag-2026-10-20',
    kind: 'MAÇ ÖNÜ',
    competition: 'UEFA Şampiyonlar Ligi · Lig aşaması 3. hafta',
    date: '2026-10-20',
    kickoff: '2026-10-20T19:45:00+03:00',
    home: 'Fenerbahçe',
    away: 'Slavia Prag',
    club: 'fenerbahce',
    title: 'Fenerbahçe – Slavia Prag: ilk pres hattını geçmek',
    description: "Ligin en yoğun ikinci presi, rakip yarıda en az top kazanan takımlardan biriyle karşılaşıyor. Kazanım ve kayıp haritaları, şut dağılımı, kontratakların başladığı yer ve maç içinde izlenecek beş soru.",
    stats: [
      { value: '4,76', label: "Slavia'nın PPDA'sı", note: '36 takımda en yoğun 2. pres' },
      { value: '13', label: "Fenerbahçe'nin rakip yarıda top kazanımı", note: '36 takımda sondan 2.' },
      { value: '5,06 → 2', label: "Slavia'nın xG'si ve golü", note: 'iki maç toplamı' },
    ],
    evidence: 'SportsBase olay ve takım verisi · 2 maç / takım',
  },
  {
    slug: 'lille-galatasaray-2026-10-21',
    href: '/mac/lille-galatasaray-2026-10-21',
    kind: 'MAÇ ÖNÜ',
    competition: 'UEFA Şampiyonlar Ligi · Lig aşaması 3. hafta',
    date: '2026-10-21',
    kickoff: '2026-10-21T19:45:00+03:00',
    home: 'Lille',
    away: 'Galatasaray',
    club: 'galatasaray',
    title: "Lille – Galatasaray: Lille'in oyun kurulumunu yüksekte boğmak",
    description: "Turnuvanın en az şut atan iki takımı karşı karşıya. Lille topu kendi yarısında Avrupa'da en çok kaybeden ikinci takım; Galatasaray'ın kapısı yüksek baskıda.",
    stats: [
      { value: '12 · 10', label: 'İki maçta atılan şut', note: 'turnuvanın en düşük iki değeri' },
      { value: '41', label: "Lille'in kendi yarısında top kaybı", note: '36 takımda 2.' },
      { value: '−2,81', label: "Lille'in Ligue 1 xG farkı", note: 'son 6 maç' },
    ],
    evidence: 'SportsBase turnuva ve kulüp verisi · 2 maç / takım',
  },
];

// The match page to feature at build time: the next kickoff still ahead, otherwise the most recent one.
export function featuredMatch(now = Date.now()) {
  const ahead = MATCH_PREVIEWS.filter((m) => Date.parse(m.kickoff) > now).sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
  if (ahead.length) return ahead[0];
  return [...MATCH_PREVIEWS].sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff))[0];
}
