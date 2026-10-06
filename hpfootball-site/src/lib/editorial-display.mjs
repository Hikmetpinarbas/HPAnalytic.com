const ARTICLE_KIND={
  DEEP_ANALYSIS:'Derin analiz',
  EXPLAINER:'Açıklayıcı yazı',
  EVIDENCE_REVIEW:'Kanıt incelemesi',
  FOOTBALL_SCIENCE:'Futbol ve bilim',
  MYTH_REALITY:'İddia ve gerçek',
  DATA_STORY:'Veri anlatısı',
  VIDEO_INTELLIGENCE:'Görüntü analizi',
  HISTORICAL_RECONSTRUCTION:'Tarihsel yeniden kurulum',
  CROSS_DOMAIN_ESSAY:'Disiplinlerarası deneme',
};
const SECTION={
  analysis:'Analiz',
  scouting:'Oyuncu izleme',
  culture:'Kültür',
  method:'Yöntem',
  research:'Araştırma',
};
const RIGHTS={
  OWNED:'HP iç kaynağı',
  ORIGINAL:'Özgün kaynak',
  LICENSED:'Lisanslı kaynak',
  PUBLIC_DOMAIN:'Kamuya açık kaynak',
  SUMMARY_TRANSFORM_ATTRIBUTE:'Özetlenerek ve atıfla kullanılan kaynak',
  ATTRIBUTION_REQUIRED:'Atıf gerekli',
};
const EVIDENCE={
  DIRECT:'Doğrudan kanıt',
  DERIVED:'Türetilmiş kanıt',
  PROXY:'Dolaylı gösterge',
  EDITORIAL:'Editoryal kanıt',
};
const text=(v)=>String(v??'').trim();

export const displayArticleKind=(v)=>ARTICLE_KIND[text(v)]||'Analiz';
export const displaySection=(v)=>SECTION[text(v).toLowerCase()]||'Analiz';
export const displayRights=(v)=>RIGHTS[text(v)]||'Kaynak hakkı kayıtlı';
export const displayEvidenceClass=(v)=>EVIDENCE[text(v)]||'Editoryal kanıt';

export function displayClaimCeiling(v){
  const x=text(v).toUpperCase();
  const out=[];
  if(/NOT_CAUSAL|NO_CAUSAL/.test(x))out.push('Nedensellik iddiası kurulamaz');
  if(/MODEL_SPECIFIC/.test(x))out.push('Model tanımıyla sınırlı');
  if(/OFFICIAL_TOURNAMENT_DESCRIPTIVE/.test(x))out.push('Resmî turnuva verisi; betimleyici');
  if(/TWO_MATCH_DESCRIPTIVE|MATCH_LOCAL/.test(x))out.push('Küçük örneklem; yerel karşılaştırma');
  if(/SOURCE_LEVEL|RESEARCH_ONLY|METHOD_ONLY/.test(x))out.push('Kaynak ve yöntem sınırında');
  return out.length?[...new Set(out)].join(' · '):'İddia gücü kaynak ve bağlamla sınırlıdır';
}
