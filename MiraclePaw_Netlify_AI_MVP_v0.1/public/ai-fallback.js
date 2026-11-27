// Browser-side fail-closed presentation only. Server safety checks remain mandatory.
(function (root) {
  'use strict';
  const LOCAL = '爪爪仍然喺度陪你。AI 暫時未能提供已確認嘅回覆；免費本地寵物、心情記錄同自願微步仍然可以使用。';
  function classify(status, result, networkError) {
    if (networkError) return { kind: 'local_fallback', text: LOCAL, reason: 'network', showModelText: false };
    if (status === 429) return { kind: 'local_fallback', text: LOCAL, reason: 'rate_limit', showModelText: false };
    if (status < 200 || status >= 300) return { kind: 'local_fallback', text: LOCAL, reason: 'server_unavailable', showModelText: false };
    if (!result || typeof result.reply !== 'string' || !result.reply.trim() || result.reply.length > 1600)
      return { kind: 'local_fallback', text: LOCAL, reason: 'invalid_response', showModelText: false };
    // The server must enforce its configured safety checks before releasing a reply.
    // It is NOT a client-side safety approval.
    return { kind: 'server_response', text: result.reply.trim(), crisis: result.crisis === true, showModelText: true };
  }
  const api = Object.freeze({ classify, LOCAL });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MiraclePawAIFallback = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
