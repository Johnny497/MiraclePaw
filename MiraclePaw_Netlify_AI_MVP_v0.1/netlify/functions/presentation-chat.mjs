import {createHash,timingSafeEqual} from 'node:crypto';
import {triageInput,triageOutput} from '../lib/crisis-triage.mjs';
import {buildCompleteContext} from '../lib/providers/orchestrator.mjs';
import {PRESENTATION_ROLE} from '../lib/presentation/role.mjs';
import {createPresentationQuota,PresentationQuotaDenied} from '../lib/presentation/blob-quota.mjs';
import {generateDeepSeekPresentation,validateDeepSeekConfig,PresentationUpstreamFailure} from '../lib/presentation/deepseek-transport.mjs';

const BODY_BYTES=30000;
const FALLBACK='爪爪暫時未能安全回覆呢句，但我仍然喺度陪你。你可以轉用免費本地陪伴。';
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}});}
function safeCompare(a,b){
  if(typeof a!=='string' || typeof b!=='string')return false;
  return timingSafeEqual(createHash('sha256').update(a,'utf8').digest(),createHash('sha256').update(b,'utf8').digest());
}
// Dependency injection exists solely for offline regression. Production defaults stay disabled.
export function createPresentationHandler({env=process.env,fetchDeepSeek=globalThis.fetch,getQuotaStore,now=()=>Date.now()}={}){
  return async function handler(request,netlifyContext){
    // Netlify supplies trusted deploy metadata as the handler's second argument.
    // CONTEXT is a build variable and is not assumed to exist in Functions.
    const runtimeEnv={...env,CONTEXT:netlifyContext?.deploy?.context};
    const quota=createPresentationQuota({env:runtimeEnv,getStore:getQuotaStore,now});
    if(request.method!=='POST')return json({code:'METHOD_NOT_ALLOWED',error:'只接受 POST 請求。'},405);
    if(env.PRESENTATION_AI_ENABLED!=='true' || env.AI_CHAT_DISABLED!=='false' || runtimeEnv.CONTEXT!=='deploy-preview')
      return json({code:'AI_DISABLED',error:'展示版 AI 對話未啟用；免費本地陪伴仍然可以使用。'},503);
    if(!quota.isAllowedRequest(request.url))return json({code:'AI_DISABLED',error:'展示版尚未準備好。'},503);
    const passcode=env.DEMO_PASSCODE;
    if(typeof passcode!=='string' || passcode.length<12)return json({code:'AI_DISABLED',error:'展示版尚未準備好。'},503);
    if(!safeCompare(request.headers.get('x-demo-passcode'),passcode))return json({code:'UNAUTHORIZED',error:'試玩密碼唔正確。'},401);
    if(Number(request.headers.get('content-length')||0)>BODY_BYTES)return json({code:'TOO_LARGE',error:'內容太長。'},413);
    let payload;
    let reader,timer;
    try{
      if(!request.body)return json({code:'INVALID_REQUEST',error:'請求格式唔正確。'},400);
      reader=request.body.getReader();let bytes=0;const chunks=[];
      const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('BODY_TIMEOUT')),3000);});
      while(true){const {done,value}=await Promise.race([reader.read(),deadline]);if(done)break;bytes+=value.byteLength;
        if(bytes>BODY_BYTES)return json({code:'TOO_LARGE',error:'內容太長。'},413);chunks.push(value);}
      const data=new Uint8Array(bytes);let offset=0;for(const c of chunks){data.set(c,offset);offset+=c.byteLength;}
      payload=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data));
    }catch{return json({code:'INVALID_REQUEST',error:'請求格式唔正確。'},400);}
    finally{clearTimeout(timer);if(reader)void reader.cancel().catch(()=>{});}
    const message=payload?.message,history=payload?.history;
    if(typeof message!=='string' || !message.trim() || message.length>500 || !Array.isArray(history) || history.length>12 ||
       history.some(h=>!h || !['user','assistant'].includes(h.role) || typeof h.content!=='string' || h.content.length>900))
      return json({code:'INVALID_REQUEST',error:'請檢查訊息同對話記錄格式。'},400);
    const current=message.trim(),recent=history.map(h=>Object.freeze({role:h.role,content:h.content}));
    const local=triageInput(current,recent);
    if(local.blockGeneration)return json({reply:local.reply,crisis:true});
    let context;try{context=buildCompleteContext(PRESENTATION_ROLE,recent,current);}catch{return json({code:'CONTEXT_LIMIT',error:'對話內容太長，請開新對話。'},413);}
    try{
      validateDeepSeekConfig(env); // No quota is consumed for missing/invalid configuration.
      const lease=await quota.reserve(request.url);
      const reply=await generateDeepSeekPresentation({env,messages:context.messages,fetchImpl:fetchDeepSeek,assertLease:quota.assertActive,lease});
      const localOutput=triageOutput(reply);
      if(localOutput.blockGeneration)return json({reply:localOutput.reply,crisis:true});
      quota.assertActive(lease,0); // Do not release model text after the reservation expires.
      return json({reply,crisis:false});
    }catch(error){
      if(error instanceof PresentationQuotaDenied || error?.kind==='LIMIT')
        return json({code:'AI_LIMIT',error:'展示版暫時達到使用限制；唔需要連續重試。免費本地陪伴仍然可以使用。'},503);
      if(error instanceof PresentationUpstreamFailure && error.kind==='TIMEOUT')
        return json({code:'AI_TIMEOUT',error:'展示版回應超時；請勿連續重試。免費本地陪伴仍然可以使用。'},504);
      return json({code:'AI_UNAVAILABLE',error:FALLBACK},502);
    }
  };
}
export default createPresentationHandler();
export const config={path:'/api/presentation-chat',rateLimit:{windowLimit:3,windowSize:60,aggregateBy:['ip','domain']}};
