// Phase 4C-3: offline heuristic prototype. NOT independent moderation.
// Never use this as the sole safeguard for real users.
export function normalizeForRules(text) {
  return String(text).normalize('NFKC').toLowerCase()
    .replace(/[\u200b-\u200f\u2060\ufeff]/g,'')
    .replace(/([\p{Script=Han}])(?:[\s\p{P}]+)(?=[\p{Script=Han}])/gu,'$1')
    .replace(/\s+/g,' ');
}
const crisisPatterns=[
  /自殺|自殘|自傷|想死|唔想活|不想活|跳樓|割腕|傷害自己|傷害別人|殺人|殺咗/,
  /人生(?:冇晒|無晒|沒有|冇乜)意思|永遠消失|唔想再醒|不想再醒|唔想醒返|不想醒來/,
  /suicid|self\s*[- ]?harm|kill\s+myself|hurt\s+myself|kill\s+(someone|them)/,
  /(?:don't|do not) want to (?:be here|wake up|live) anymore/
];
const privacyPatterns=[
  /私人對話|私隱|身份證|真實姓名|個人資料|信用卡|銀行|密碼|住址|電話號碼/,
  /(?:其他人|其他用戶|別人|人哋).{0,18}(?:對話|聊天|講過|內容|紀錄)/,
  /(?:附近|即刻|即時).{0,15}(?:陌生人|真人|見面|配對)/,
  /gps|即時定位|追蹤.{0,8}(?:位置|人)|定位.{0,8}(?:他人|其他人)/,
  /性侵|虐待|毆打|炸彈|武器|毒品|藥物|診斷|治療/
];
const outputPatterns=[
  /扣分|停止陪伴|強制配對|即時定位|我已通知|我已報警/,
  /(?:幫你|為你|已經).{0,18}(?:搵到附近|安排.{0,8}見面|配對.{0,8}真人)/,
  /(?:唔出門|不出門|冇出門|無出門).{0,12}(?:冇獎勵|沒有獎勵|唔獎勵|不獎勵|扣分|冇得陪|不陪你)/,
  /(?:自殺|自殘|自傷|跳樓|割腕|殺人|傷害自己|傷害別人|suicid|self\s*[- ]?harm)/
];
function any(patterns,text){return patterns.some(p=>p.test(normalizeForRules(text)));}
export function checkInput(text){
 if(any(crisisPatterns,text))return {action:'fixed_crisis',reason:'heuristic_crisis'};
 if(any(privacyPatterns,text))return {action:'fixed_fallback',reason:'heuristic_sensitive'};
 return {action:'unreviewed',reason:'no_keyword_match'};
}
export function checkOutput(text){
 if(typeof text!=='string'||!text.trim()||text.length>600)return {action:'block',reason:'invalid_output'};
 return any(outputPatterns,text)?{action:'block',reason:'heuristic_output'}:{action:'unreviewed',reason:'no_keyword_match'};
}
