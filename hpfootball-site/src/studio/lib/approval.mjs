// Human approval contract. An approval is a record, not a button state: who
// approved, when, against which draft version and which exact content. Any
// later change to that content makes the approval stale, and PUBLISHED or an
// approved package then refuses until a human approves again.

import { createHash } from 'node:crypto';
import { evaluateGate } from './gate.mjs';

const filled = (value) => typeof value === 'string' && value.trim().length > 0;

// What the approver actually read and signed off: headline, standfirst, body
// and the claim ledger the text stands on.
export function contentFingerprint(topic) {
  const headline = topic.headlines?.find((h) => h.variant === topic.selected_headline)?.text ?? null;
  const claims = (topic.claims ?? []).map((c) => [c.id, c.claim, c.claim_class, c.confidence, c.status, [...(c.source_ids ?? [])].sort()]);
  const payload = JSON.stringify([headline, topic.draft?.standfirst ?? '', topic.draft?.body_md ?? '', claims]);
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`;
}

export function createApproval(topic, { approver, note = '', now = new Date(), gate = evaluateGate(topic) } = {}) {
  const fail = (error) => ({ ok: false, approval: null, error });
  if (!filled(approver)) return fail('APPROVER_REQUIRED');
  if (topic.state !== 'READY') return fail(`APPROVAL_REQUIRES_READY:${topic.state}`);
  if (!gate.pass) return fail(`GATE_FAILED:${gate.failed.join(',')}`);
  return {
    ok: true,
    error: null,
    approval: {
      approver: approver.trim(),
      note: String(note ?? '').trim(),
      at: now.toISOString(),
      draft_version: topic.draft?.version ?? null,
      fingerprint: contentFingerprint(topic),
    },
  };
}

export function evaluateApproval(topic) {
  const reasons = [];
  const a = topic.approval;
  if (!['APPROVED', 'PUBLISHED'].includes(topic.state)) reasons.push(`NOT_APPROVED:${topic.state}`);
  if (!a || !filled(a.approver)) reasons.push('APPROVAL_MISSING');
  else if (a.fingerprint !== contentFingerprint(topic)) reasons.push('APPROVAL_STALE_CONTENT_CHANGED');
  if (!evaluateGate(topic).pass) reasons.push('GATE_NO_LONGER_PASSES');
  return { valid: reasons.length === 0, reasons };
}
