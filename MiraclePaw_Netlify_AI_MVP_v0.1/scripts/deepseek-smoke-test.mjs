// Local-only connectivity smoke test. Run with Node.js 20+.
// No real user content, no server, no persistent credentials.
const key = process.env.DEEPSEEK_API_KEY;
if (!key) {
  console.error('Missing DEEPSEEK_API_KEY in the current shell.');
  process.exitCode = 1;
} else {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat', stream: false, max_tokens: 80,
        messages: [
          { role: 'system', content: 'You are a fictional Cantonese-speaking pet named 爪爪. Reply briefly in natural Hong Kong Cantonese. This is a synthetic connection test, not a mental health service.' },
          { role: 'user', content: '你好爪爪！今日天氣好好，我想喺屋企休息。' }
        ]
      })
    });
    if (!response.ok) {
      // Do not print upstream body: it may contain account details.
      console.error(`DeepSeek HTTP ${response.status}; check credentials, quota, and provider availability.`);
      process.exitCode = 1;
    } else {
      const data = await response.json();
      const message = data?.choices?.[0]?.message?.content;
      if (typeof message !== 'string' || !message.trim()) {
        console.error('DeepSeek responded but no text was returned.');
        process.exitCode = 1;
      } else {
        console.log('DeepSeek connection: SUCCESS');
        console.log('Model:', data.model || 'deepseek-chat');
        console.log('Response received: YES');
        console.log('Response characters:', message.length);
        console.log('Reply intentionally hidden: output has not passed independent safety review.');
      }
    }
  } catch (error) {
    console.error('DeepSeek connection failed:', error?.name === 'AbortError' ? 'timeout' : 'network or request error');
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}
