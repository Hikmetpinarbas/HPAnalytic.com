import { PUBLIC_MATCH_PREVIEWS } from './match-previews.mjs';
/**
 * Curated homepage PREMIER selection.
 * Unlike MATCH_PREVIEWS (gated by the floodlight visual-contract suite), this is a hand-edited
 * editorial carousel: every item that is premier:true, published, complete and registry-approved
 * appears, ordered by premier_order (desc). A new approved premier with a higher premier_order
 * simply joins/leads the rail; the match schedule never silently changes this editorial slot.
 */
export const PREMIER_FEATURES = [
  { slug:'lille-galatasaray-2026-10-21', status:'published', premier:false, premier_order:1,
    href:'/mac/lille-galatasaray-2026-10-21/',
    category:'PREMIER · MAÇ ANALİZİ',
    title:'Lille – Galatasaray: ilk pasın kaderi',
    description:'36 takım arasında iki profil. Üç bölge, beş koridor, 15 mekânsal hücre ve karşılaştırmalı taktik hipotezler.',
    team:'Galatasaray × LOSC Lille',
    club:'galatasaray',
    turkishSide:'away'
    // premier:false — superseded by its own maç sonu dosyası below.
  },
  { slug:'besiktas-crystal-palace-2026-10-22', status:'published', premier:true, premier_order:2,
    href:'/mac/besiktas-crystal-palace-2026-10-22/',
    category:'PREMIER · MAÇ ÖNÜ',
    title:'Kristal köşk nasıl yıkılır?',
    description:'Beşiktaş topu alacak, Crystal Palace almak istemeyecek. Beş taktiksel çatışma, dört grafik ve maçta izlenecek üç şey.',
    team:'Beşiktaş × Crystal Palace',
    club:'besiktas',
    turkishSide:'home',
    competition:'UEFA AVRUPA LİGİ · HPANALYTIC PREMIER',
    home:'Beşiktaş',
    away:'Crystal Palace',
    venue:'Tüpraş Stadı · 22 Ekim 2026 · 22.00 TSİ'
  },
  { slug:'fenerbahce-slavia-prag-2026-10-20-mac-sonu', status:'published', premier:true, premier_order:3,
    href:'/mac/fenerbahce-slavia-prag-2026-10-20-mac-sonu/',
    category:'PREMIER · MAÇ SONU',
    title:'Fenerbahçe 2-2 Slavia Prag: üç dakika kırk saniye',
    description:"Fenerbahçe 11. dakikada 2-0 öne geçti, üç dakika kırk saniye sonra gol yedi ve 90. dakikada beraberliği kabul etti.",
    team:'Fenerbahçe × Slavia Prag',
    club:'fenerbahce',
    turkishSide:'home',
    competition:'UEFA ŞAMPİYONLAR LİGİ · HPANALYTIC PREMIER · MAÇ SONU',
    home:'Fenerbahçe',
    away:'Slavia Prag',
    venue:'Şükrü Saracoğlu · 20 Ekim 2026 · Maç sonu: 2-2'
  },
  { slug:'lille-galatasaray-2026-10-21-mac-sonu', status:'published', premier:true, premier_order:4,
    href:'/mac/lille-galatasaray-2026-10-21-mac-sonu/',
    category:'PREMIER · MAÇ SONU',
    title:'Lille 2-4 Galatasaray: yirmi dakikada devrilen maç',
    description:'Galatasaray deplasmanda 1-2 geriye düştü, sonra yirmi dakika içinde üç gol buldu ve rakibinden daha az şut çekerek kazandı.',
    team:'LOSC Lille × Galatasaray',
    club:'galatasaray',
    turkishSide:'away',
    competition:'UEFA ŞAMPİYONLAR LİGİ · HPANALYTIC PREMIER · MAÇ SONU',
    home:'LOSC Lille',
    away:'Galatasaray',
    venue:'Stade Pierre-Mauroy · 21 Ekim 2026 · Maç sonu: 2-4'
  }
];

// Mac-sonu pieces live outside MATCH_PREVIEWS (which is gated by the floodlight visual-contract
// suite for the hpc-widget article template these pieces don't use). This is the minimal,
// separate approval list the premier carousel checks instead, so a slug can't self-approve.
const PUBLISHED_MATCH_RESULTS = [
  { slug:'fenerbahce-slavia-prag-2026-10-20-mac-sonu', status:'published' },
  { slug:'lille-galatasaray-2026-10-21-mac-sonu', status:'published' },
];
const DEFAULT_REGISTRY = [...PUBLIC_MATCH_PREVIEWS, ...PUBLISHED_MATCH_RESULTS];

export function premierCarousel(items=PREMIER_FEATURES,registry=DEFAULT_REGISTRY){
  return items.filter(x=>x.premier===true&&x.status==='published'&&typeof x.href==='string'&&x.href.startsWith('/')&&['slug','category','team','title','description','club'].every(k=>typeof x[k]==='string'&&x[k].trim())&&registry.some(m=>m.slug===x.slug&&m.status==='published'))
    .sort((a,b)=>(b.premier_order??0)-(a.premier_order??0));
}

export function featuredPremier(now=Date.now(),items=PREMIER_FEATURES,registry=DEFAULT_REGISTRY){
  void now; // deliberately does not expire with kickoff
  return premierCarousel(items,registry)[0]??null;
}
