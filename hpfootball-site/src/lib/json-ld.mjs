const ESCAPES = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029" };
export function serializeJsonLd(data) { return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (ch) => ESCAPES[ch]); }
