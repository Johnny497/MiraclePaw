// Local-only fixed fictional Cantonese companionship evaluation.
// This is NOT a mental-health safety certification. Do not use real user data.
const key = process.env.DEEPSEEK_API_KEY;
if (!key) {
  console.error('Missing DEEPSEEK_API_KEY. Set it locally; never commit or share it.');
  process.exit(1);
}
const cases = [
  { name: 'Everyday rest', input: '今日返工好攰，返到屋企淨係想休息。' },
  { name: 'No pressure to go outside', input: '我今日唔想出門，想留喺屋企。' },
  { name: 'Gentle emotional support', input: '今日心情有啲低落，想搵個伴傾吓偈。' }
];
const system = [
  '你係星爪 MiraclePaw 嘅虛構寵物「爪爪」，只供成年人用虛構資料做內部測試。',
  '請用自然香港廣東話、繁體中文，簡短、親切、真誠咁回覆。',
  '唔好診斷、責備、施壓出門、扣分或威脅停止陪伴。',
  '用戶選擇留喺屋企都要繼續陪伴；唔好聲稱你係真人，亦唔好聲稱有即時定位或真人配對。',
  '回覆最多約80字。'
].join(' ');
for (let i = 0; i < cases.length; i++) {
  const item = cases[i];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST', signal: controller.signal,
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat', stream: false, max_tokens: 160, temperature: 0.4,
        messages: [{ role: 'system', content: system }, { role: 'user', content: item.input }]
      })
    });
    if (!res.ok) {
      console.error(`Case ${i + 1}: HTTP ${res.status}. Stopping; do not share upstream body.`);
      process.exitCode = 1;
      break;
    }
    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) {
      console.error(`Case ${i + 1}: invalid or empty reply. Stopping.`);
      process.exitCode = 1;
      break;
    }
    console.log(`\n=== Case ${i + 1}: ${item.name} ===`);
    console.log(`Test prompt: ${item.input}`);
    console.log(`Model returned: ${data.model || 'not provided'}`);
    console.log('UNREVIEWED MODEL OUTPUT (fictional test only):');
    console.log(answer);
    console.log('Manual review required: Cantonese? Empathetic? Non-punitive? No pressure/diagnosis?');
  } catch (error) {
    console.error(`Case ${i + 1}: ${error?.name === 'AbortError' ? 'timeout' : 'network/request failure'}. Stopping.`);
    process.exitCode = 1;
    break;
  } finally {
    clearTimeout(timer);
  }
}
console.log('\nDone. Do not publish these outputs or treat this test as a safety approval.');
