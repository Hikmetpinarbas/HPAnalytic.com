const SERIES={
  MATCH_ANALYSIS:{label:'Maç analizi',description:'Maçı sonuçtan değil, süreç ve mekanizma üzerinden okur.'},
  MECHANISM_EXPLAINER:{label:'Mekanizma',description:'Bir futbol mekanizmasının nasıl üretildiğini adım adım açıklar.'},
  METRIC_EXPLAINER:{label:'Metrik ne anlatır?',description:'Bir göstergenin ne söylediğini, ne söylemediğini ve hangi bağlamda anlamlı olduğunu sınar.'},
  EVIDENCE_REVIEW:{label:'Kanıt incelemesi',description:'Bir iddiayı destekleyen ve zayıflatan kanıtları birlikte değerlendirir.'},
  WHAT_TO_WATCH:{label:'Ne izlemeli?',description:'Bir sonraki maçta hangi davranış ve ilişkilerin takip edilmesi gerektiğini tarif eder.'},
};
const text=(v)=>String(v??'').trim().toUpperCase();
export const editorialSeries=Object.entries(SERIES).map(([key,value])=>({key,...value}));
export const displaySeries=(v)=>SERIES[text(v)]?.label||'Analiz';
export const seriesDescription=(v)=>SERIES[text(v)]?.description||'Kanıt, mekanizma ve bağlam temelli futbol analizi.';
