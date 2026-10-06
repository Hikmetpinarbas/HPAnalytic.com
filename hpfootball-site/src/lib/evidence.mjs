// Epistemic visual language (Design Contract §6):
// evidence classes must never look identical. Each class gets its own stroke
// pattern so the distinction survives without colour.
export const EVIDENCE_CLASSES = {
  DIRECT: {
    label: 'DIRECT',
    stroke: 'solid',
    summary: 'Doğrudan gözlem — kaynakta kayıtlı olay.',
  },
  DERIVED: {
    label: 'DERIVED',
    stroke: 'double',
    summary: 'Türetilmiş gözlem — doğrudan verinin hesaplanmış hali.',
  },
  PROXY: {
    label: 'PROXY',
    stroke: 'dashed',
    summary: 'Vekil ölçüm — construct ile ölçülen şey aynı değil.',
  },
  EDITORIAL: {
    label: 'EDITORIAL',
    stroke: 'dotted',
    summary: 'Editoryal çerçeve — kavramsal yorum, ölçüm değil.',
  },
};

export function evidenceMeta(evidenceClass) {
  return EVIDENCE_CLASSES[evidenceClass] ?? EVIDENCE_CLASSES.EDITORIAL;
}

// CLAIM_CEILING_TOKEN → "Claim ceiling token"
export function humanizeCeiling(ceiling) {
  const text = String(ceiling ?? '').replace(/_/g, ' ').toLocaleLowerCase('en-US').trim();
  return text ? text[0].toLocaleUpperCase('en-US') + text.slice(1) : '';
}
