/**
 * HP//Analytic Motion Token Sistemi — Sinir Sistemi
 * Tüm GSAP animasyonları bu objeden değer okur.
 */

export const ease = {
  editorial:  'power3.out',
  data:       'back.out(1.7)',
  structural: 'power2.inOut',
  ui:         'power2.out',
  cinematic:  'expo.out',
  exit:       'power2.in',
  draw:       'power2.inOut',
};

export const duration = {
  micro:     0.15,
  ui:        0.3,
  reveal:    0.85,
  cinematic: 1.2,
  dramatic:  2.0,
  preloader: 2.5,
};

export const staggerProfiles = {
  fast:   { each: 0.03, from: 'start' },
  medium: { each: 0.06, from: 'start' },
  slow:   { each: 0.12, from: 'start' },
};

export const articleTypes = {
  pre_match: {
    maxConcurrentLayers: 6,
    preloaderDuration: 2.0,
    stagger: 'fast',
    revealEase: 'editorial',
    description: 'Maç öncesi analiz — hızlı, keskin açılış',
  },
  post_match: {
    maxConcurrentLayers: 8,
    preloaderDuration: 2.5,
    stagger: 'medium',
    revealEase: 'cinematic',
    description: 'Maç sonrası dosya — sinematik, katmanlı anlatı',
  },
  tactical: {
    maxConcurrentLayers: 8,
    preloaderDuration: 2.5,
    stagger: 'medium',
    revealEase: 'cinematic',
    description: 'Taktik analiz — derin görselleştirme',
  },
  portrait: {
    maxConcurrentLayers: 4,
    preloaderDuration: 1.8,
    stagger: 'slow',
    revealEase: 'editorial',
    description: 'Portre — yavaş, editoryal tempo',
  },
  metric: {
    maxConcurrentLayers: 6,
    preloaderDuration: 2.0,
    stagger: 'fast',
    revealEase: 'data',
    description: 'Metrik analiz — veri odaklı hareketler',
  },
  culture: {
    maxConcurrentLayers: 4,
    preloaderDuration: 2.0,
    stagger: 'slow',
    revealEase: 'editorial',
    description: 'Kültür yazısı — sakin, editoryal',
  },
  default: {
    maxConcurrentLayers: 6,
    preloaderDuration: 2.0,
    stagger: 'medium',
    revealEase: 'editorial',
    description: 'Standart yazı şablonu',
  },
};

export function getArticleConfig(type) {
  return articleTypes[type] || articleTypes.default;
}

export function getStagger(profileName) {
  return staggerProfiles[profileName] || staggerProfiles.medium;
}
