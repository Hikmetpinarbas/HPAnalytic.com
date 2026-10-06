// Request guard for Studio pages. Defence in depth on top of the route only
// existing when HP_STUDIO=1 and the dev server binding to 127.0.0.1.

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);

export function studioRequestProblem({ url, method, headers }, env = process.env) {
  if (env.HP_STUDIO !== '1') return 'STUDIO_DISABLED';
  if (!LOOPBACK.has(url.hostname) && env.HP_STUDIO_ALLOW_REMOTE !== '1') return 'NOT_LOOPBACK';
  if (method === 'POST') {
    // Blocks cross-site form posts (CSRF) from any page open in the same browser.
    const origin = headers.get('origin');
    if (!origin || origin !== url.origin) return 'CROSS_ORIGIN_POST';
  }
  return null;
}

export const FLASH = {
  INTAKE_IDEA_OK: 'Fikir masaya alındı.',
  INTAKE_URL_OK: 'URL okundu ve masaya alındı.',
  INTAKE_FILE_OK: 'Dosya okundu ve masaya alındı.',
  INTAKE_EMPTY: 'Boş bırakıldı: bir fikir, URL ya da dosya gerekli.',
  FOUNDRY_IMPORTED: 'Foundry kalemi masaya alındı (Foundry kuyruğuna yazılmadı).',
  FOUNDRY_ALREADY_IMPORTED: 'Bu Foundry kalemi zaten masada.',
  FOUNDRY_ITEM_NOT_FOUND: 'Foundry kalemi bulunamadı.',
  DISCOVER_OK: 'KONU BUL tamamlandı.',
  SUGGESTION_ACCEPTED: 'Öneri konu olarak alındı.',
  SUGGESTION_DISMISSED: 'Öneri reddedildi ve failure memory’ye yazıldı.',
  DESTINATION_SET: 'Yayın katmanı kaydedildi.',
  QUESTION_SET: 'Soru ve tez kaydedildi.',
  SOURCE_ADDED: 'Kaynak eklendi (insan tarafından eklendiği için doğrulanmış).',
  VERIFY_SOURCE: 'Kaynak doğrulandı.',
  UNVERIFY_SOURCE: 'Kaynak doğrulaması geri alındı.',
  SOURCE_REMOVED: 'Kaynak çıkarıldı; iddialardaki atıfları da silindi.',
  ATTESTED: 'Kontrol kaydı güncellendi.',
  HEADLINE_SELECTED: 'Başlık seçildi.',
  DRAFT_SAVED: 'Taslak kaydedildi. Ses kontrolü yeniden gerekiyor.',
  PUBLIC_META_SET: 'Public metadata kaydedildi.',
  PUBLIC_URL_SET: 'Public URL kaydedildi.',
  EXPORTED: 'Paket outbox’a yazıldı (draft: true). Yayın yapılmadı.',
  TOPIC_NOT_FOUND: 'Konu bulunamadı.',
};

export function flashMessage(code) {
  if (!code) return null;
  if (FLASH[code]) return { tone: 'ok', text: FLASH[code] };
  if (code.startsWith('STEP_OK:')) return { tone: 'ok', text: `Adım tamamlandı: ${code.slice(8).toUpperCase()}.` };
  if (code.startsWith('STATE:')) return { tone: 'ok', text: `Durum: ${code.slice(6)}.` };
  return { tone: 'problem', text: code };
}
