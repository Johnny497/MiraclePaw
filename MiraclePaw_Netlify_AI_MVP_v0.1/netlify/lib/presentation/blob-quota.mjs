import {getStore as netlifyGetStore} from '@netlify/blobs';

// Site-wide, strongly consistent ledger: shared across cold starts, redeploys and previews.
// Conditional writes admit at most one caller for a given ETag. Never retry or refund.
export const QUOTA_STORE='miraclepaw-deepseek-demo-quota-v1';
export const PRESENTATION_PRICE_ATTESTATION='deepseek-flash-20261128';
const POLICY='deepseek-presentation-v1';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/u;
const PREVIEW=/^deploy-preview-[1-9][0-9]*--magenta-churros-99ffc3\.netlify\.app$/u;
export class PresentationQuotaDenied extends Error {constructor(){super('presentation_quota_denied');this.name='PresentationQuotaDenied';}}
const deny=()=>{throw new PresentationQuotaDenied();};
const integer=value=>typeof value==='string' && /^[0-9]+$/u.test(value) && Number.isSafeInteger(Number(value))?Number(value):NaN;
function enabled(env){return env?.CONTEXT==='deploy-preview' && env.PRESENTATION_AI_ENABLED==='true' && env.AI_CHAT_DISABLED==='false';}
export function createPresentationQuota({env=process.env,getStore=netlifyGetStore,now=()=>Date.now()}={}){
  function isAllowedRequest(requestUrl){
    try{const u=new URL(requestUrl);return enabled(env) && PREVIEW.test(env.PRESENTATION_PREVIEW_HOST||'') &&
      u.protocol==='https:' && u.hostname===env.PRESENTATION_PREVIEW_HOST && !u.port && !u.username && !u.password &&
      u.pathname==='/api/presentation-chat' && !u.search && !u.hash;}catch{return false;}
  }
  function settings(){
    if(!enabled(env) || env.AI_QUOTA_ENABLED!=='true' || env.PRESENTATION_DEEPSEEK_PRICE_REVIEWED!==PRESENTATION_PRICE_ATTESTATION ||
      env.PRESENTATION_LOCAL_SAFETY_ACCEPTED!=='true' || !UUID.test(env.PRESENTATION_QUOTA_WINDOW_ID||''))deny();
    const start=integer(env.PRESENTATION_QUOTA_START),end=integer(env.PRESENTATION_QUOTA_END),max=integer(env.PRESENTATION_QUOTA_MAX_REQUESTS);
    if(!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || !Number.isSafeInteger(max) || max<1 || max>20 ||
      end<=start || end-start>1800000 || start>now() || now()+20000>=end)deny();
    return {policy:POLICY,windowId:env.PRESENTATION_QUOTA_WINDOW_ID,start,end,max};
  }
  function assertActive(lease,timeoutMs){
    const cfg=settings();
    if(lease?.route!=='presentation' || lease.host!==env.PRESENTATION_PREVIEW_HOST || lease.windowId!==cfg.windowId ||
      lease.expiresAt!==cfg.end || !Number.isSafeInteger(timeoutMs) || timeoutMs<0 || timeoutMs>18000 ||
      now()+timeoutMs+1000>=lease.expiresAt)deny();
  }
  return Object.freeze({isAllowedRequest,assertActive,
    async reserve(requestUrl){
      let timer;
      try{
        if(!isAllowedRequest(requestUrl) || typeof getStore!=='function')deny();
        const cfg=settings(),store=getStore({name:QUOTA_STORE,consistency:'strong'});
        const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new PresentationQuotaDenied()),4000);});
        const bounded=promise=>Promise.race([promise,deadline]);
        const saved=await bounded(store.getWithMetadata(cfg.windowId,{type:'json',consistency:'strong'}));
        let count=0,condition={onlyIfNew:true};
        if(saved!==null){
          const data=saved?.data;
          if(typeof saved?.etag!=='string' || !saved.etag || !data ||
            Object.keys(cfg).some(k=>data[k]!==cfg[k]) || !Number.isSafeInteger(data.admissions) ||
            data.admissions<1 || data.admissions>=cfg.max || data.reservedHkdCents!==data.admissions*100)deny();
          count=data.admissions;condition={onlyIfMatch:saved.etag};
        }
        // Only quota metadata is stored: no chats, names, passcodes, provider keys or IPs.
        const result=await bounded(store.setJSON(cfg.windowId,{...cfg,admissions:count+1,reservedHkdCents:(count+1)*100},condition));
        if(result?.modified!==true)deny();
        const lease=Object.freeze({route:'presentation',host:env.PRESENTATION_PREVIEW_HOST,windowId:cfg.windowId,expiresAt:cfg.end});
        assertActive(lease,18000);return lease;
      }catch{deny();}finally{clearTimeout(timer);}
    },
  });
}
