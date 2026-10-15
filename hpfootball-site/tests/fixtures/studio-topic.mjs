import { createTopic, RED_TEAM_CHECKS } from '../../src/studio/lib/model.mjs';

const now = new Date('2026-10-06T12:00:00Z');

// A topic that satisfies every gate check; tests break one thing at a time.
export function readyCandidate() {
  const t = createTopic({ raw: 'Pas ağı merkeziliği gerçekten oyuncu önemini ölçer mi?', now, id: 'ET-20261006-test' });
  t.state = 'EDITORIAL_REVIEW';
  t.card = {
    ...t.card,
    title: 'Pas ağı merkeziliği oyuncu önemini ölçer mi?',
    one_line: 'Merkezilik akıştaki konumu ölçer; önemi değil.',
    why_now: 'Pas ağları transfer sunumlarında önem kanıtı gibi kullanılıyor.',
    content_type: 'MISUNDERSTOOD_METRIC',
    evidence_level: 'MODERATE',
  };
  t.destination = { primary: 'RESEARCH', derivatives: [], multi_format: false };
  t.research.core_question = 'Pas ağı merkeziliği oyuncu önemini ölçer mi?';
  t.research.sources = [
    { id: 'S1', title: 'Paper', url: 'https://example.org/a', role: 'ACADEMIC', stance: 'SUPPORTS', verified: true, excerpt: '', independence_key: 'uefa-2025-report', derived_from: '' },
    { id: 'S2', title: 'Counter', url: 'https://example.org/b', role: 'COUNTEREVIDENCE', stance: 'COUNTER', verified: true, excerpt: '', independence_key: 'counter-lab-2024', derived_from: '' },
    { id: 'S3', title: 'Media write-up of S1', url: 'https://example.org/c', role: 'MEDIA', stance: 'SUPPORTS', verified: true, excerpt: '', independence_key: '', derived_from: 'S1' },
    { id: 'S4', title: 'Independent dataset', url: 'https://example.org/d', role: 'ACADEMIC', stance: 'SUPPORTS', verified: true, excerpt: '', independence_key: 'tracking-study-2023', derived_from: '' },
  ];
  t.claims = [{ id: 'C1', claim: 'Merkezilik akış konumunu ölçer.', evidence: 'Tanım.', source_ids: ['S1', 'S4'], confidence: 'HIGH', claim_class: 'FACT', status: 'ACTIVE', counterevidence: 'Sonuçla ilişki bulan çalışmalar var.', interpretation: '' }];
  t.outline = { ...t.outline, thesis: 'Tez', counterargument: 'Karşı argüman', hp_angle: 'Position ≠ role.' };
  t.draft = { standfirst: 'Merkezilik önem değil.', body_md: 'Bir oyuncu pas ağının ortasında durabilir ve yine de oyunu değiştirmeyebilir. [S1]', version: 1, updated_at: null, origin: 'HUMAN' };
  t.headlines = [{ variant: 'B', text: 'Pas ağının merkezindeki oyuncu en önemlisi mi?', safety: { answers: true, stronger_than_evidence: false, misleading: false, generic: false } }];
  t.headlines_draft_version = 1;
  t.selected_headline = 'B';
  t.red_team = { findings: RED_TEAM_CHECKS.map((check) => ({ check, verdict: 'PASS', note: '' })), ran_at: now.toISOString(), origin: 'ENGINE', draft_version: 1 };
  t.critical_review = { dispositions: {}, sign_off: { reviewer: 'Hikmet Pınarbaş', note: 'Tez kanıtın sınırında.', at: now.toISOString(), draft_version: 1 } };
  t.score = { ORIGINALITY: 7 };
  t.attestations = { voice_checked: true, sources_checked: true };
  return t;
}
