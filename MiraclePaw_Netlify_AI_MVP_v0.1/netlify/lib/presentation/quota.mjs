import {QUOTA_POLICY,RESERVE_SQL} from '../quota.mjs';

const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/u;
const PREVIEW=/^deploy-preview-[1-9][0-9]*--magenta-churros-99ffc3\.netlify\.app$/u;
const MIN_REMAINING_SECONDS=65;
export const PRESENTATION_PRICE_ATTESTATION='qwen3.8-flash-hk-v1';
export class PresentationQuotaDenied extends Error {constructor(){super('presentation_quota_denied');this.name='PresentationQuotaDenied';}}
const deny=()=>{throw new PresentationQuotaDenied();};
function active(env) {
  return env?.CONTEXT==='deploy-preview' && env.PRESENTATION_AI_ENABLED==='true' &&
    env.AI_CHAT_DISABLED==='false' && env.AI_QUOTA_ENABLED==='true' &&
    env.PRESENTATION_QWEN_PRICE_REVIEWED===PRESENTATION_PRICE_ATTESTATION &&
    env.PRESENTATION_LOCAL_SAFETY_ACCEPTED==='true' && PREVIEW.test(env.PRESENTATION_PREVIEW_HOST||'');
}
export function createPresentationQuota({env=process.env,fetchImpl=globalThis.fetch,now=()=>Date.now()}={}) {
  return Object.freeze({
    async reserve(requestUrl) {
      try {
        if(!active(env) || typeof fetchImpl!=='function')deny();
        const u=new URL(requestUrl);
        if(u.protocol!=='https:' || u.hostname!==env.PRESENTATION_PREVIEW_HOST || u.port || u.username || u.password ||
           u.pathname!=='/api/presentation-chat' || u.search || u.hash)deny();
        const account=env.AI_QUOTA_D1_ACCOUNT_ID,database=env.AI_QUOTA_D1_DATABASE_ID;
        const token=env.AI_QUOTA_D1_TOKEN,windowId=env.AI_QUOTA_WINDOW_ID;
        if(!/^[a-f0-9]{32}$/u.test(account||'') || !UUID.test(database||'') || !UUID.test(windowId||'') ||
           typeof token!=='string' || token.length<20 || token.length>512 || /\s/u.test(token))deny();
        const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),4000);
        try {
          const response=await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`,{
            method:'POST',redirect:'error',cache:'no-store',signal:controller.signal,
            headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
            // Only quota metadata is sent; no message, history, person or provider key.
            body:JSON.stringify({sql:RESERVE_SQL,params:[windowId,String(MIN_REMAINING_SECONDS)]}),
          });
          if(response?.status!==200 || response.redirected)deny();
          const raw=await response.text();if(new TextEncoder().encode(raw).length>16000)deny();
          const body=JSON.parse(raw),result=body?.result?.[0];
          if(body?.success!==true || !Array.isArray(body.errors) || body.errors.length ||
             !Array.isArray(body.result) || body.result.length!==1 || result?.success!==true ||
             result.meta?.changes!==1 || !Array.isArray(result.results) || result.results.length!==1)deny();
          const row=result.results[0],seconds=Math.floor(now()/1000);
          if(row?.window_id!==windowId || row.policy!==QUOTA_POLICY ||
             !Number.isSafeInteger(row.starts_at) || !Number.isSafeInteger(row.expires_at) ||
             row.starts_at>seconds || row.expires_at-row.starts_at>1800 ||
             row.expires_at<=seconds+MIN_REMAINING_SECONDS || !Number.isSafeInteger(row.admissions) ||
             row.admissions<1 || row.admissions>20 || row.reserved_hkd_cents!==row.admissions*100)deny();
          return Object.freeze({route:'presentation',host:env.PRESENTATION_PREVIEW_HOST,windowId,expiresAt:row.expires_at*1000});
        } finally {clearTimeout(timer);}
      } catch {deny();} // Ambiguous commit or outage: never retry/refund automatically.
    },
    assertActive(lease,timeoutMs) {
      if(!active(env) || lease?.route!=='presentation' || lease.host!==env.PRESENTATION_PREVIEW_HOST ||
         lease.windowId!==env.AI_QUOTA_WINDOW_ID || !Number.isSafeInteger(lease.expiresAt) ||
         !Number.isSafeInteger(timeoutMs) || timeoutMs<0 || timeoutMs>18000 ||
         now()+timeoutMs+1000>=lease.expiresAt)deny();
    },
  });
}
