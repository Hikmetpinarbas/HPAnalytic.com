import { PUBLIC_MATCH_PREVIEWS } from './match-previews.mjs';
/**
 * Curated homepage PREMIER selection.
 * A new approved premier with a higher premier_order supersedes Lille.
 * The match schedule never silently changes this editorial slot.
 */
export const PREMIER_FEATURES = [
  { slug:'lille-galatasaray-2026-10-21', status:'published', premier:true, premier_order:1,
    href:'/mac/lille-galatasaray-2026-10-21/',
    category:'PREMIER · MAÇ ANALİZİ',
    title:'Lille – Galatasaray: ilk pasın kaderi',
    description:'36 takım arasında iki profil. Üç bölge, beş koridor, 15 mekânsal hücre ve karşılaştırmalı taktik hipotezler.',
    team:'Galatasaray × LOSC Lille',
    club:'galatasaray'
  },
  { slug:'besiktas-crystal-palace-2026-10-22', status:'published', premier:true, premier_order:2,
    href:'/mac/besiktas-crystal-palace-2026-10-22/',
    category:'PREMIER · MAÇ ANALİZİ',
    title:'Kristal köşk nasıl yıkılır?',
    description:'Beşiktaş topu alacak, Crystal Palace almak istemeyecek. Beş taktiksel çatışma, dört grafik ve maçta izlenecek üç şey.',
    team:'Beşiktaş × Crystal Palace',
    club:'besiktas',
    competition:'UEFA AVRUPA LİGİ · HPANALYTIC PREMIER',
    home:'Beşiktaş',
    away:'Crystal Palace',
    venue:'Tüpraş Stadı · 22 Ekim 2026 · 22.00 TSİ'
  }
];
export function featuredPremier(now=Date.now(),items=PREMIER_FEATURES,registry=PUBLIC_MATCH_PREVIEWS){
  void now; // deliberately does not expire with kickoff
  return items.filter(x=>x.premier===true&&x.status==='published'&&typeof x.href==='string'&&x.href.startsWith('/')&&['slug','category','team','title','description','club'].every(k=>typeof x[k]==='string'&&x[k].trim())&&registry.some(m=>m.slug===x.slug&&m.status==='published'))
    .sort((a,b)=>(b.premier_order??0)-(a.premier_order??0))[0]??null;
}
