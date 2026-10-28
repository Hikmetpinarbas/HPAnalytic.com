// Single source for header, mega-menu and mobile menu.
import { featuredMatch } from '../data/match-previews.mjs';

const latestMatch = featuredMatch();

export const SITE_MENU = [
  {
    label: 'ANALİZ',
    href: '/analysis',
    intro: { title: 'Metrik değil, mekanizma.', text: 'Maç önü dosyaları, mekanizma açıklamaları ve kanıt incelemeleri.' },
    items: [
      ...(latestMatch ? [{ label: `Maç önü · ${latestMatch.home}–${latestMatch.away}`, href: latestMatch.href, text: 'Kazanım, kayıp ve şut haritalarıyla etkileşimli dosya.' }] : []),
      { label: 'Tüm analizler', href: '/analysis', text: 'Seri seri ayrılmış analiz kütüphanesi.' },
      { label: 'Scouting', href: '/scouting', text: 'Rol, uyum, risk ve karşı kanıtla karar yüzeyi.' },
      { label: 'Oyun kültürü', href: '/culture', text: 'Oyunun tarihi, insanları ve bağlamı.' },
    ],
  },
  {
    label: 'ARAŞTIRMA',
    href: '/research',
    intro: { title: 'Önce soru, sonra kanıt.', text: 'Uzun soluklu monografiler ve yöntem çerçevesi.' },
    items: [
      { label: 'Yöntem', href: '/research', text: 'Kaynak, bağımsızlık, karşı kanıt ve iddia sınırı.' },
      { label: 'Görsel laboratuvar', href: '/visual-lab', text: 'Saha geometrisi ve kanıt sınırı için şemalar.' },
      { label: 'Arşiv', href: '/archive', text: 'Bütün yazılar, yıl ve aya göre.' },
    ],
  },
  { label: 'İNCE İŞLER', href: '/ince-isler', intro: { title: 'Oyunun görünmeyen emeği', text: 'İnsanlar, bilim ve fikirler.' }, items: [{ label: 'Vosse de Boode', href: '/portraits/vosse-de-boode/', text: 'Bilimin sahayla buluştuğu yer.' }] },
  { label: 'HAKKIMDA', href: '/about' },
];

export const MOBILE_MENU = [
  ...(latestMatch ? [{ label: 'Maç önü', href: latestMatch.href, text: `${latestMatch.home} – ${latestMatch.away}` }] : []),
  { label: 'Analiz', href: '/analysis', text: 'Maç, mekanizma ve kanıt incelemeleri' },
  { label: 'Scouting', href: '/scouting', text: 'Karar destek yüzeyi' },
  { label: 'Yöntem', href: '/research', text: 'Kanıtın nasıl kabul edildiği' },
  { label: 'Arşiv', href: '/archive', text: 'Bütün yazılar' },
  { label: 'İnce İşler', href: '/ince-isler', text: 'Portreler ve araştırma hikâyeleri' },
  { label: 'Hakkımda', href: '/about', text: 'Hikmet Pınarbaş ve ilkeler' },
];
