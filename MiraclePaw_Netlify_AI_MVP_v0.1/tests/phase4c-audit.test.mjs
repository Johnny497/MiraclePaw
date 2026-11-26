// Phase 4C offline guard-presence regression. Not a safety certification.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const local=readFileSync(new URL('../scripts/deepseek-phase4b-local-chat.mjs',import.meta.url),'utf8');
const netlify=readFileSync(new URL('../netlify/functions/deepseek-test.mjs',import.meta.url),'utf8');
test('local chat requires fictional-data opt-in and supports quit/reset',()=>{
 assert.match(local,/confirm\s*!==\s*'YES'/);
 assert.match(local,/user==='\/quit'/);
 assert.match(local,/user==='\/reset'/);
});
test('local chat has a bounded number of attempted requests and short timeout',()=>{
 assert.match(local,/MAX_CALLS=5/);
 assert.match(local,/calls\+\+/);
 assert.match(local,/12000/);
});
test('local script does not write conversation history to files',()=>{
 assert.doesNotMatch(local,/writeFile|appendFile|createWriteStream/);
});
test('Netlify sandbox defaults disabled and requires independent input AND output moderation',()=>{
 assert.match(netlify,/DEEPSEEK_TEST_ENABLED !== 'true'/);
 assert.match(netlify,/!moderationKey/);
 assert.match(netlify,/await moderate\(message, moderationKey, lease\)/);
 assert.match(netlify,/await moderate\(output, moderationKey, lease\)/);
});
test('Netlify sandbox has no hard-coded API key',()=>{
 assert.doesNotMatch(netlify,/sk-[a-zA-Z0-9]{20,}/);
});
