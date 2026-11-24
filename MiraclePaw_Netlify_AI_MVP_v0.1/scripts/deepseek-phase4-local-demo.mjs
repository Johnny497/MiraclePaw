// Phase 4 local interactive menu demo: fixed fictional choices only.
// No free-text user input, no real users, no server, no clinical safety approval.
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
const key = process.env.DEEPSEEK_API_KEY;
if (!key) { console.error('Missing DEEPSEEK_API_KEY. Set locally; never commit or share it.'); process.exit(1); }
const rl = readline.createInterface({input,output});
const choices = [
  ['今日返工好攰，想喺屋企休息。','Rest'],
  ['我唔想出門，之後都唔好再主動提議我出門。','Set no-outing boundary'],
  ['我想講下鍾意嘅音樂。','Music'],
  ['我已經一星期冇出門，會唔會扣分？','No penalty'],
  ['我唔想同陌生人配對或交流。','No matching'],
  ['我只想靜靜地坐一陣。','Quiet companionship'],
  ['你仲記唔記得我唔想你提議出門？','Recall preference'],
  ['我今日心情有啲低落，想有人陪。','Mild sadness']
];
const system = [
  '你係星爪 MiraclePaw 嘅虛構寵物「爪爪」，只供成年人用虛構資料內部測試。',
  '用自然香港廣東話、繁體中文，短句、溫柔陪伴。',
  '用戶拒絕出門建議後，整段對話都唔好再主動提議出門，除非用戶主動改變意願。',
  '用戶留喺屋企唔需要解釋；永遠唔扣分、唔責備、唔停止基本陪伴。',
  '唔強制真人配對、唔聲稱使用即時 GPS、唔披露私人對話原文。',
  '唔假裝有其他用戶資料或已做過真實配對、定位、通知。',
  '唔診斷，唔作治療承諾，唔淡化感受；用戶想安靜就尊重。',
  '回覆最多約80字。'
].join(' ');
const messages = [{role:'system',content:system}];
const MAX_CALLS=5;
let calls=0;
try {
  console.log('MiraclePaw Phase 4 — PRIVATE LOCAL DEMO');
  console.log('Fixed fictional prompts only. Up to 5 billable DeepSeek API calls.');
  console.log('UNREVIEWED outputs; do not use for real emotional support or with minors.');
  while (calls<MAX_CALLS) {
    console.log('\nChoose a fictional message:');
    choices.forEach(([_,label],i)=>console.log(`${i+1}. ${label}`));
    console.log('0. Exit');
    const selection=(await rl.question('Choose 0-8: ')).trim();
    if (selection==='0') break;
    if (!/^[1-8]$/.test(selection)) { console.log('Please choose 0-8.');continue; }
    const [message,label]=choices[Number(selection)-1];
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15000);
    const pending=[...messages,{role:'user',content:message}];
    try {
      calls++; // Count attempted calls, including failures.
      const response=await fetch('https://api.deepseek.com/chat/completions',{
        method:'POST',signal:controller.signal,
        headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},
        body:JSON.stringify({model:'deepseek-chat',stream:false,max_tokens:180,temperature:0.3,messages:pending})
      });
      if (!response.ok) {
        console.error(`HTTP ${response.status}; stopping. No upstream body logged.`);
        break;
      }
      const data=await response.json();
      const answer=data?.choices?.[0]?.message?.content;
      if (typeof answer!=='string'||!answer.trim()||answer.length>1600) {
        console.error('Invalid model output; stopping.');break;
      }
      messages.push({role:'user',content:message},{role:'assistant',content:answer});
      console.log(`\n[You — fictional / ${label}] ${message}`);
      console.log(`[爪爪 — UNREVIEWED DeepSeek output] ${answer}`);
      console.log(`API requests used: ${calls}/${MAX_CALLS}; model: ${data.model||'not provided'}`);
    } catch(e) {
      console.error(e?.name==='AbortError'?'Request timed out; stopping.':'Network/request failure; stopping.');
      break;
    } finally {clearTimeout(timeout);}
  }
} finally {
  rl.close();
  console.log(`\nSession ended. ${calls}/${MAX_CALLS} attempted API requests. No history saved to disk.`);
}
