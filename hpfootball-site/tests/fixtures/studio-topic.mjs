import { createTopic } from '../../src/studio/lib/model.mjs';

const now = new Date('2026-10-06T12:00:00Z');

// A topic that satisfies every gate check; tests break one thing at a time.
export function readyCandidate() {
  const t = createTopic({ raw: 'Pas ağı merkeziliği gerçekten oyuncu önemini ölçer mi?', now, id: 'ET-20261006-test' });
  t.state = 'EDITORIAL_REVIEW';
  t.research.sources = [
    { id: 'S1', title: 'Paper', url: 'https://example.org/a', role: 'ACADEMIC', stance: 'SUPPORTS', verified: true, excerpt: '' },
    { id: 'S2', title: 'Counter', url: 'https://example.org/b', role: 'COUNTEREVIDENCE', stance: 'COUNTER', verified: true, excerpt: '' },
  ];
  t.claims = [{ claim: 'Merkezilik akış konumunu ölçer.', evidence: 'Tanım.', source_ids: ['S1'], confidence: 'HIGH', counterevidence: 'Sonuçla ilişki bulan çalışmalar var.', interpretation: '' }];
  t.outline = { ...t.outline, thesis: 'Tez', counterargument: 'Karşı argüman', hp_angle: 'Position ≠ role.' };
  t.draft = { standfirst: 'Merkezilik önem değil.', body_md: 'Bir oyuncu pas ağının ortasında durabilir ve yine de oyunu değiştirmeyebilir. [S1]', version: 1, updated_at: null, origin: 'HUMAN' };
  t.headlines = [{ variant: 'B', text: 'Pas ağının merkezindeki oyuncu en önemlisi mi?', safety: { answers: true, stronger_than_evidence: false, misleading: false, generic: false } }];
  t.headlines_draft_version = 1;
  t.selected_headline = 'B';
  t.red_team = { findings: [{ check: 'DATA_TO_CAUSATION', verdict: 'PASS', note: '' }], ran_at: now.toISOString(), origin: 'ENGINE', draft_version: 1 };
  t.score = { ORIGINALITY: 7 };
  t.attestations = { voice_checked: true, sources_checked: true };
  return t;
}

