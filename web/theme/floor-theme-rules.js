// Interior guess for a floor whose name is an arbitrary label (a sidebar section).
// First matching row wins. Keep this table in sync with docs/THEMES.md.
//
// Match is case-insensitive. A keyword of 3 or more letters matches as a substring.
// A shorter keyword matches only as a whole token, so a one-character mark does not
// fire inside an unrelated Latin word.
//
// "Unassigned", and an overflow floor "Unassigned · 2", skip this table.
// A name that matches nothing follows the exterior (see interiors.js).

/** @type {{ keywords: string[], theme: string, note: string }[]} */
export const FLOOR_THEME_RULES = [
  { keywords: ['kyoto', 'japan', 'washi', 'zen', '和', '暮色'], theme: 'kyoto-dusk', note: 'Washi' },
];

const UNASSIGNED_NAME = /^unassigned(?:\s*·\s*\d+)?$/i;

function keywordHit(name, keyword) {
  const k = keyword.toLowerCase();
  if (k.length < 3) {
    return new RegExp(`(?:^|[^a-z0-9])${k}(?:[^a-z0-9]|$)`, 'i').test(name);
  }
  return name.toLowerCase().includes(k);
}

/**
 * @param {string} name floor label
 * @returns {string|null} an interior id, "office" for the plain interior, or null when nothing matched
 */
export function guessFloorTheme(name) {
  const raw = String(name ?? '').trim();
  if (!raw || UNASSIGNED_NAME.test(raw)) return null;
  for (const rule of FLOOR_THEME_RULES) {
    if (rule.keywords.some((k) => keywordHit(raw, k))) return rule.theme;
  }
  return null;
}
