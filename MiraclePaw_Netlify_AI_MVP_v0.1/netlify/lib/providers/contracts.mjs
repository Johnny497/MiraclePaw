// Offline candidate contracts. No provider is connected to a live handler.
export class ProviderFailure extends Error {
  constructor(code = 'PROVIDER_UNAVAILABLE') { super(code); this.name = 'ProviderFailure'; this.code = code; }
}
export function assertTransport(transport) {
  if (!transport || typeof transport.post !== 'function') throw new ProviderFailure('TRANSPORT_REQUIRED');
}
export function assertGenerationProvider(provider) {
  if (!provider || typeof provider.generate !== 'function') throw new ProviderFailure('GENERATION_PROVIDER_REQUIRED');
}
export function assertModerationProvider(provider) {
  if (!provider || typeof provider.analyze !== 'function') throw new ProviderFailure('MODERATION_PROVIDER_REQUIRED');
}
export function assertReady(enabled, transport) {
  if (enabled !== true) throw new ProviderFailure('CANDIDATE_DISABLED');
  assertTransport(transport);
}
export function codePoints(value) { return [...value].length; }
