// JSON-LD is emitted with set:html inside <script type="application/ld+json">, where the
// HTML parser ends the element at the first "</script" regardless of JSON quoting.
// Escaping <, > and & as \u escapes (and U+2028/U+2029 for old JS parsers) keeps the
// payload byte-for-byte equal after JSON.parse while making it inert as HTML.
const ESCAPES = { '<': '\\u003c', '>': '\\u003e', '&': '\\u0026', '\u2028': '\\u2028', '\u2029': '\\u2029' };

export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (ch) => ESCAPES[ch]);
}
