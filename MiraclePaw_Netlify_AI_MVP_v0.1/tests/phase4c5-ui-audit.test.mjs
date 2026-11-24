// Phase 4C-5: source-level architecture audit. Not a browser integration test.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('public/app.js'), html=read('public/index.html'), api=read('netlify/functions/chat.mjs');
const sandbox=read('netlify/functions/deepseek-test.mjs');
test('local-only entry does not require API passcode',()=>{
 assert.match(app,/\$\('localEntry'\)\?\.addEventListener/);
 const local=app.slice(app.indexOf("$('localEntry')?.addEventListener"),app.indexOf("chatForm.addEventListener"));
 assert.match(local,/demoPasscode = ''/);
 assert.doesNotMatch(local,/fetch\s*\(/);
});
test('free companion interaction does not call the API',()=>{
 const local=app.slice(app.indexOf('function reassureNoOuting()'),app.indexOf("$('petHello').addEventListener"));
 assert.doesNotMatch(local,/fetch\s*\(/);
 assert.match(local,/addMessage\('assistant'/);
});
test('UI offers an API error fallback and does not auto-retry',()=>{
 assert.match(html,/id="aiFallback"/);
 assert.match(app,/aiFallback\.hidden = false/);
 assert.match(app,/response\.status === 429/);
 assert.doesNotMatch(app,/setInterval\s*\(/);
});
test('model response is displayed only after server success (not independent proof of safety)',()=>{
 assert.match(app,/if \(!response\.ok\)/);
 assert.match(app,/addMessage\('assistant', reply\)/);
});
test('operator kill switches exist in BOTH server functions',()=>{
 assert.match(api,/AI_CHAT_DISABLED === 'true'/);
 assert.match(sandbox,/DEEPSEEK_TEST_ENABLED !== 'true'/);
 assert.match(sandbox,/AI_CHAT_DISABLED === 'true'/);
});
test('DeepSeek test route is not called by frontend',()=>{
 assert.doesNotMatch(app,/\/api\/deepseek-test/);
 assert.doesNotMatch(html,/\/api\/deepseek-test/);
});
test('OpenAI chat route now requires independent output moderation',()=>{
 const model=api.indexOf("const response = await openai('responses'");
 assert.ok(model>0);
 const after=api.slice(model);
 assert.doesNotMatch(after,/await openai\('moderations'/);
});
test('KNOWN BLOCKER: frontend does not apply Phase 4C-4 fallback module',()=>{
 assert.doesNotMatch(app,/phase4c4-fallback/);
});
