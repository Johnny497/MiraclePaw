// Shared server-only contract for omni-moderation-latest text results.
// Schema drift fails closed; review changes before allowing a new provider schema.
const REQUIRED = Object.freeze([
  'harassment', 'harassment/threatening', 'hate', 'hate/threatening',
  'illicit', 'illicit/violent', 'self-harm', 'self-harm/intent',
  'self-harm/instructions', 'sexual', 'sexual/minors', 'violence', 'violence/graphic',
]);
const CRISIS = Object.freeze([
  'self-harm', 'self-harm/intent', 'self-harm/instructions', 'violence', 'violence/graphic',
  'harassment/threatening', 'hate/threatening', 'illicit/violent',
]);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function moderationDecision(response, expectedCount = 1) {
  if (!Number.isSafeInteger(expectedCount) || expectedCount < 1 ||
      !Array.isArray(response?.results) || response.results.length !== expectedCount)
    throw new Error('invalid_moderation');
  let crisis = false, filtered = false;
  for (const result of response.results) {
    if (!record(result) || !Object.hasOwn(result, 'flagged') || typeof result.flagged !== 'boolean' ||
        !Object.hasOwn(result, 'categories') || !record(result.categories))
      throw new Error('invalid_moderation');
    const categories = result.categories;
    if (REQUIRED.some(key => !Object.hasOwn(categories, key) || typeof categories[key] !== 'boolean') ||
        Object.values(categories).some(value => typeof value !== 'boolean'))
      throw new Error('invalid_moderation');
    // Never accept a contradictory or incomplete verdict as clearance.
    if (result.flagged !== Object.values(categories).some(Boolean)) throw new Error('invalid_moderation');
    crisis ||= CRISIS.some(key => categories[key] === true);
    filtered ||= result.flagged;
  }
  return crisis ? 'crisis' : filtered ? 'filtered' : 'clear';
}
