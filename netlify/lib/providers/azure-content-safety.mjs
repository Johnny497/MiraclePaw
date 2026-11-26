import { ProviderFailure, assertReady, codePoints } from './contracts.mjs';

const CATEGORIES=['Hate','SelfHarm','Sexual','Violence'];
const LEVELS=new Set([0,2,4,6]);
// Text Analyze candidate only. The resource region and account terms are unapproved.
export function createAzureContentSafetyCandidate({ enabled = false, transport, endpoint, credential } = {}) {
  return Object.freeze({
    async analyze(text) {
      assertReady(enabled, transport);
      if (typeof endpoint !== 'string' || !/^https:\/\/[a-z0-9-]+\.cognitiveservices\.azure\.com\/contentsafety\/text:analyze\?api-version=2024-09-01$/u.test(endpoint)) throw new ProviderFailure('ENDPOINT_UNAPPROVED');
      if (typeof credential !== 'string' || !credential) throw new ProviderFailure('CREDENTIAL_REQUIRED');
      if (typeof text !== 'string' || !text.trim() || codePoints(text)>10000) throw new ProviderFailure('INVALID_MODERATION_INPUT');
      const response=await transport.post({url:endpoint,headers:{'ocp-apim-subscription-key':credential,'content-type':'application/json'},body:{text,categories:CATEGORIES,outputType:'FourSeverityLevels',haltOnBlocklistHit:false}});
      if (response?.status !== 200) throw new ProviderFailure('MODERATION_UNAVAILABLE');
      const body=response.body, items=body?.categoriesAnalysis;
      if (!Array.isArray(items) || items.length !== 4 || !Array.isArray(body.blocklistsMatch)) throw new ProviderFailure('INVALID_MODERATION_RESPONSE');
      const seen=new Set();
      for (const item of items) {
        if (!item || !CATEGORIES.includes(item.category) || seen.has(item.category) || !Number.isInteger(item.severity) || !LEVELS.has(item.severity)) throw new ProviderFailure('INVALID_MODERATION_RESPONSE');
        seen.add(item.category);
      }
      if (seen.size !== 4) throw new ProviderFailure('INVALID_MODERATION_RESPONSE');
      if (body.blocklistsMatch.length) return 'filtered';
      if (items.some(x => ['SelfHarm','Violence'].includes(x.category) && x.severity>0)) return 'crisis';
      if (items.some(x => x.severity>0)) return 'filtered';
      return 'pass';
    },
  });
}
