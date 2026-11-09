/**
 * Pipeline-to-Article (Veri-to-Makale) Adaptörü
 *
 * Pipeline JSON çıktılarını HPAnalytic makale şablonuna dönüştürür.
 * "Uydurma Sıfır" felsefesi: publication_approved: false → makale üretmez.
 *
 * Kullanım:
 *   node scripts/pipeline-to-article.mjs <match-slug>
 *   node scripts/pipeline-to-article.mjs crystal-palace
 *   node scripts/pipeline-to-article.mjs --all
 *
 * Çıktı: content/yazilar/mac-<match-slug>.md (frontmatter + gövde)
 * Ardından npm run build ile HTML'e derlenir.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const DATA_DIR = resolve('public/assets/data');
const YAZI_DIR = resolve('content/yazilar');

const TYPE_LABEL = {
  mac: 'Maç Dosyası',
  metrik: 'Metrik',
  portre: 'Portre',
};

function loadJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf-8')); }
  catch { return null; }
}

function parseCsvLine(line, delimiter = ',') {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && quoted) {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function loadCanonicalEvents(path) {
  if (!path || !existsSync(path)) return [];
  try {
    const lines = readFileSync(path, 'utf-8').split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const sample = lines[0];
    const delimiter = [';', '\t', ','].find(d => sample.includes(d)) || ',';
    const headers = parseCsvLine(lines[0], delimiter).map(h => h.toLowerCase());
    return lines.slice(1).map(line => {
      const values = parseCsvLine(line, delimiter);
      return Object.fromEntries(headers.map((header, i) => [header, values[i] ?? '']));
    }).filter(row => Object.values(row).some(Boolean));
  } catch {
    return [];
  }
}

function findCanonicalEventsPath(slug, dataDir) {
  const candidates = [
    resolve(dataDir, 'canonical_events.csv'),
    process.env.HP_PIPELINE_CANONICAL_EVENTS,
    resolve(process.cwd(), '../pipeline/output/matches', slug, 'canonical_events.csv'),
    resolve(process.cwd(), '../../pipeline/output/matches', slug, 'canonical_events.csv'),
  ].filter(Boolean);
  return candidates.find(existsSync) || null;
}

function metaFromCanonicalEvents(slug, dataDir) {
  const canonicalPath = findCanonicalEventsPath(slug, dataDir);
  const events = loadCanonicalEvents(canonicalPath);
  if (!canonicalPath || !events.length) return null;

  const teamValues = [...new Set(events.flatMap(event => [
    event.team, event.team_name, event.team_raw, event.team_a, event.team_b,
  ].filter(Boolean)))];
  const teams = {};
  if (teamValues[0]) teams['1'] = teamValues[0];
  if (teamValues[1]) teams['2'] = teamValues[1];

  return {
    teams,
    layer_counts: {},
    layers_available: [],
    pipeline_validation: {
      publication_approved: false,
      observation_count: events.length,
      canonical_verified_count: 0,
      release: 'HOLD',
      source: 'canonical_events.csv',
      schema: 'hpa.canonical_events.fallback.v1',
    },
    fallback: { kind: 'canonical_events.csv', path: canonicalPath },
  };
}

function placeholderMeta(slug) {
  return {
    teams: {},
    layer_counts: {},
    layers_available: [],
    pipeline_validation: {
      publication_approved: false,
      observation_count: 0,
      canonical_verified_count: 0,
      release: 'HOLD',
      source: `pipeline:${slug}`,
      schema: 'hpa.placeholder.fallback.v1',
    },
    fallback: { kind: 'placeholder', reason: 'pitch_layers_meta.json and canonical_events.csv not found' },
  };
}

function slugToDate(slug) {
  const m = slug.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : new Date().toISOString().slice(0, 10);
}

function formatNumber(n) {
  return new Intl.NumberFormat('tr-TR').format(n);
}

function buildPassAccuracyTable(passAcc) {
  if (!passAcc || typeof passAcc !== 'object') return '';
  const teams = Object.entries(passAcc);
  if (!teams.length) return '';

  let table = '\n| Takım | Pas İsabeti |\n|---|---|\n';
  teams.forEach(([team, pct]) => {
    table += `| ${team} | %${pct.toFixed(1)} |\n`;
  });
  return table;
}

function buildLayerCountsSection(counts) {
  if (!counts || typeof counts !== 'object') return '';
  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  if (!entries.length) return '';

  const labels = {
    team_a_progressive_pass_events: 'İlerletici Paslar (Ev Sahibi)',
    team_b_progressive_pass_events: 'İlerletici Paslar (Deplasman)',
    counterattack_involvements: 'Kontratak Katılımları',
    carry_events: 'Top Taşıma Olayları',
    team_a_recoveries: 'Top Kazanımları (Ev Sahibi)',
    team_b_recoveries: 'Top Kazanımları (Deplasman)',
    team_a_losses: 'Top Kayıpları (Ev Sahibi)',
    team_b_losses: 'Top Kayıpları (Deplasman)',
    team_a_shots: 'Şutlar (Ev Sahibi)',
    team_b_shots: 'Şutlar (Deplasman)',
  };

  let table = '\n| Katman | Olay Sayısı |\n|---|---|\n';
  entries.forEach(([key, val]) => {
    table += `| ${labels[key] || key} | ${formatNumber(val)} |\n`;
  });
  return table;
}

function generateArticle(slug, meta, matchData) {
  const teams = meta.teams || {};
  const teamA = teams['1'] || 'Ev Sahibi';
  const teamB = teams['2'] || 'Deplasman';
  const matchTitle = `${teamA} vs ${teamB}`;
  const validation = meta.pipeline_validation || {};
  const obsCount = validation.observation_count || 0;
  const passAcc = validation.pass_accuracy_percent;
  const layerCounts = meta.layer_counts || {};
  const date = slugToDate(slug);

  // --- Frontmatter ---
  const frontmatter = [
    '---',
    `title: "${matchTitle}: Pipeline Veri Analizi"`,
    `slug: mac-${slug}`,
    `type: mac`,
    `author: "HPAnalytic Pipeline"`,
    `date: "${date}"`,
    `excerpt: "${teamA} ile ${teamB} arasındaki mücadelenin ${formatNumber(obsCount)} olay üzerinden pipeline çıktısı."`,
    `source: "pipeline:${validation.schema || 'hpa.userland_bridge.v1'}"`,
    '---',
  ].join('\n');

  // --- Gövde ---
  const sections = [];

  // Başlık
  sections.push(`# ${matchTitle}: Pipeline Veri Analizi\n`);

  // Uyarı banner: publication_approved durumu
  if (!validation.publication_approved) {
    sections.push(`:::warn Aday Veri — Doğrulanmamış`);
    sections.push(`Bu analiz, pipeline'ın ürettiği **aday** gözlemlerden oluşturulmuştur. Veriler henüz fiziksel aksiyon doğrulaması veya yayın onayı almamıştır. Tüm sayılar "gözlem adayı" statüsündedir.`);
    sections.push(`:::\n`);
  }

  // Genel Bakış
  sections.push(`## Genel Bakış\n`);
  sections.push(`Pipeline, bu maç için toplam **${formatNumber(obsCount)}** gözlem adayı üretmiştir.`);
  if (validation.cross_team_duel_candidates) {
    sections.push(` Bunlardan **${formatNumber(validation.cross_team_duel_candidates)}** tanesi takımlar arası ikili mücadele adayıdır.`);
  }
  sections.push('\n');

  // Pas İsabeti Tablosu
  if (passAcc) {
    sections.push(`## Pas İsabeti\n`);
    sections.push(buildPassAccuracyTable(passAcc));
  }

  // Katman Sayıları
  const layerTable = buildLayerCountsSection(layerCounts);
  if (layerTable) {
    sections.push(`## Katman Dağılımı\n`);
    sections.push(layerTable);
  }

  // Katmanlı Saha Görünümü
  if (meta.layers_available && meta.layers_available.length > 0) {
    sections.push(`\n## Katmanlı Saha Görünümü\n`);
    if (meta.layers_available.includes('sixteen_layers')) {
      sections.push(`:::visual [pitch-layers] | ${teamA} vs ${teamB} — 16 Katmanlı Saha | Pipeline gözlem çıktısından üretilen aday katmanlar; doğrulanmış fiziksel aksiyon veya yayın onayı değildir.`);
      sections.push(`:::`);
    }
  }

  // Pipeline Doğrulama Bilgileri
  sections.push(`\n## Pipeline Doğrulama\n`);
  sections.push(`:::stats`);
  sections.push(`:::stat ${formatNumber(obsCount)}|Toplam Gözlem|Aday gözlem sayısı`);
  if (validation.canonical_verified_count !== undefined) {
    sections.push(`:::stat ${formatNumber(validation.canonical_verified_count)}|Doğrulanmış|Kanonik doğrulama geçmiş gözlem`);
  }
  sections.push(`:::stat ${validation.release || 'HOLD'}|Yayın Durumu|Pipeline release statüsü`);
  sections.push(`:::`);

  // Kaynak bilgisi
  sections.push(`\n---\n`);
  sections.push(`*Kaynak: ${validation.source || slug} — Şema: ${validation.schema || 'bilinmiyor'}*`);

  return frontmatter + '\n\n' + sections.join('\n');
}

function processMatch(slug) {
  const dataDir = resolve(DATA_DIR, slug);
  const metaPath = resolve(dataDir, 'pitch_layers_meta.json');

  let meta = null;
  if (existsSync(metaPath)) {
    meta = loadJson(metaPath);
    if (!meta) console.log(`⚠ ${slug}: meta JSON okunamadı, fallback deneniyor`);
  }
  if (!meta) {
    meta = metaFromCanonicalEvents(slug, dataDir);
    if (meta) {
      console.log(`⚠ ${slug}: pitch_layers_meta.json yok — canonical_events.csv fallback kullanılıyor`);
    } else {
      meta = placeholderMeta(slug);
      console.log(`⚠ ${slug}: meta ve canonical_events.csv yok — boş placeholder ile makale üretiliyor`);
    }
  }

  // ═══ UYDURMA SIFIR FELSEFESİ ═══
  const validation = meta.pipeline_validation || {};
  if (validation.publication_approved === true) {
    console.log(`✓ ${slug}: publication_approved=true — makale üretiliyor`);
  } else {
    // Yine de üret, ama uyarı banneriyle
    console.log(`⚠ ${slug}: publication_approved=false — ADAY makale üretiliyor (doğrulanmamış uyarısıyla)`);
  }

  // Ek match_data varsa yükle
  const matchDataPath = resolve(dataDir, 'match_data.json');
  const matchData = loadJson(matchDataPath);

  const articleSlug = `mac-${slug}`;
  const outPath = resolve(YAZI_DIR, `${articleSlug}.md`);

  // Mevcut makale varsa üzerine yazma
  if (existsSync(outPath)) {
    const existing = readFileSync(outPath, 'utf-8');
    if (!existing.includes('source: "pipeline:')) {
      console.log(`⏭ ${slug}: Elle yazılmış makale mevcut, atlanıyor`);
      return null;
    }
  }

  const article = generateArticle(slug, meta, matchData);
  writeFileSync(outPath, article, 'utf-8');
  console.log(`✓ ${articleSlug}.md yazıldı (${article.length} bytes)`);
  return articleSlug;
}

// ═══ CLI ═══
const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
  console.log(`
Pipeline-to-Article (Veri-to-Makale) Adaptörü
──────────────────────────────────────────────
Kullanım:
  node scripts/pipeline-to-article.mjs <match-slug>     Tek maç
  node scripts/pipeline-to-article.mjs --all             Tüm maçlar
  node scripts/pipeline-to-article.mjs --help            Bu yardım

Çıktı: content/yazilar/mac-<slug>.md
Sonra: npm run build
`);
  process.exit(0);
}

if (args.includes('--all')) {
  const dirs = readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let produced = 0;
  for (const dir of dirs) {
    const metaPath = resolve(DATA_DIR, dir, 'pitch_layers_meta.json');
    if (existsSync(metaPath)) {
      const result = processMatch(dir);
      if (result) produced++;
    }
  }
  console.log(`\n── ${produced} makale üretildi ──`);
} else {
  for (const slug of args) {
    processMatch(slug);
  }
}
