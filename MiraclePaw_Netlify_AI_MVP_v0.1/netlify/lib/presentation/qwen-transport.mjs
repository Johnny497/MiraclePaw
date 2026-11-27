// Dedicated presentation transport. No request is made by importing this module.
export const APPROVED_BASE_URL='https://ws-m4tcc4k3fqktkmu8.cn-hongkong.maas.aliyuncs.com/compatible-mode/v1';
export const APPROVED_MODEL='qwen3.8-flash';
const MAX_REQUEST_BYTES=30000;
const MAX_RESPONSE_BYTES=32768;
const TIMEOUT_MS=18000;

export class PresentationUpstreamFailure extends Error {
  constructor(kind='UNAVAILABLE'){super(kind);this.name='PresentationUpstreamFailure';this.kind=kind;}
}
const fail=kind=>{throw new PresentationUpstreamFailure(kind);};
export function validateQwenConfig(env) {
  if (env?.QWEN_BASE_URL!==APPROVED_BASE_URL || env?.QWEN_MODEL!==APPROVED_MODEL ||
      typeof env?.QWEN_API_KEY!=='string' || env.QWEN_API_KEY.length<12 || /\s/u.test(env.QWEN_API_KEY)) fail('CONFIG');
}
export async function generateQwenPresentation({env,messages,fetchImpl=globalThis.fetch,assertLease,lease,timeoutMs=TIMEOUT_MS}={}) {
  validateQwenConfig(env);
  if (typeof fetchImpl!=='function' || typeof assertLease!=='function' || !Array.isArray(messages) ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs<1 || timeoutMs>TIMEOUT_MS) fail('CONFIG');
  assertLease(lease,timeoutMs);
  const serialized=JSON.stringify({model:APPROVED_MODEL,messages,stream:false,n:1,max_tokens:420,enable_thinking:false});
  if (new TextEncoder().encode(serialized).length>MAX_REQUEST_BYTES) fail('CONTEXT');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  let reader;
  try {
    const response=await fetchImpl(`${APPROVED_BASE_URL}/chat/completions`,{
      method:'POST',redirect:'error',cache:'no-store',signal:controller.signal,
      headers:{Authorization:`Bearer ${env.QWEN_API_KEY}`,'Content-Type':'application/json'},body:serialized,
    });
    if (response?.redirected) fail('UNAVAILABLE');
    if (response?.status===429) fail('LIMIT');
    if (response?.status!==200 || !/^application\/json(?:;|$)/iu.test(response.headers?.get('content-type')||'')) fail('UNAVAILABLE');
    if (!response.body || typeof response.body.getReader!=='function') fail('UNAVAILABLE');
    reader=response.body.getReader();let bytes=0;const chunks=[];
    while(true){
      const {done,value}=await reader.read();if(done)break;
      if (!(value instanceof Uint8Array)) fail('UNAVAILABLE');
      bytes+=value.byteLength;if(bytes>MAX_RESPONSE_BYTES) fail('UNAVAILABLE');
      chunks.push(value);
    }
    const joined=new Uint8Array(bytes);let offset=0;
    for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.byteLength;}
    let body;try{body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(joined));}catch{fail('UNAVAILABLE');}
    const choices=body?.choices,choice=choices?.[0],message=choice?.message;
    if(body?.object!=='chat.completion' || (body.model!==undefined && body.model!==APPROVED_MODEL) ||
       !Array.isArray(choices) || choices.length!==1 || choice.index!==0 || choice.finish_reason!=='stop' ||
       message?.role!=='assistant' || typeof message.content!=='string' || !message.content.trim() ||
       message.content.length>1600 || [...message.content].length>1600 ||
       new TextEncoder().encode(message.content).length>6400 ||
       message.tool_calls!=null || message.function_call!=null || message.refusal!=null ||
       (typeof message.reasoning_content==='string' && message.reasoning_content.trim())) fail('UNAVAILABLE');
    return message.content.trim();
  } catch(error) {
    if(error instanceof PresentationUpstreamFailure)throw error;
    if(controller.signal.aborted || error?.name==='AbortError')fail('TIMEOUT');
    fail('UNAVAILABLE');
  } finally {
    clearTimeout(timer);
    if(reader && controller.signal.aborted)await reader.cancel().catch(()=>{});
  }
}
