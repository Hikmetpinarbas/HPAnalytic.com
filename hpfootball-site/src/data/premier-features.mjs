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
  }
];
export function featuredPremier(now=Date.now(),items=PREMIER_FEATURES){
  void now; // deliberately does not expire with kickoff
  return items.filter(x=>x.premier===true&&x.status==='published'&&x.href)
    .sort((a,b)=>(b.premier_order??0)-(a.premier_order??0))[0]??null;
}
