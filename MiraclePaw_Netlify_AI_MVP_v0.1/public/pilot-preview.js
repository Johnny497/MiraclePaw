// Netlify Injected Drawer can obscure the presentation.
// The official ntl-drawer-state=hidden parameter is only set for Deploy Previews.
// Use an external script so Netlify's script-src 'self' CSP permits execution.
(() => {
  'use strict';
  if (!/^deploy-preview-\d+--[a-z0-9-]+\.netlify\.app$/i.test(location.hostname)) return;
  const params = new URLSearchParams(location.search);
  if (params.has('ntl-drawer-state')) return;
  params.set('ntl-drawer-state', 'hidden');
  location.replace(location.pathname + '?' + params.toString() + location.hash);
})();
