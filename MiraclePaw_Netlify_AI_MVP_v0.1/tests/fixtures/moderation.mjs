// Synthetic full text-moderation verdicts; no API access.
const categories = {
  harassment: false, 'harassment/threatening': false, hate: false, 'hate/threatening': false,
  illicit: false, 'illicit/violent': false, 'self-harm': false, 'self-harm/intent': false,
  'self-harm/instructions': false, sexual: false, 'sexual/minors': false,
  violence: false, 'violence/graphic': false,
};
export function verdict(overrides = {}) {
  const all = { ...categories, ...overrides };
  return { flagged: Object.values(all).some(Boolean), categories: all };
}
export function moderation(count = 1) {
  return { results: Array.from({ length: count }, () => verdict()) };
}
