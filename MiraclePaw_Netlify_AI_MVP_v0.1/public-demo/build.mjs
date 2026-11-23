import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const base = resolve(import.meta.dirname, '..', 'public');
const output = resolve(import.meta.dirname, 'dist');
await mkdir(output, { recursive: true });

// Strict allowlist. Never copy chat backend, app.js, secrets, functions, config, or other pages.
const allowed = [
  'styles.css', 'pet.js', 'mood.js', 'tour.js',
  'miraclepaw-cat-tail.webp', 'miraclepaw-cat-body.webp',
  'miraclepaw-cat-eyesclosed.webp'
];
for (const file of allowed) await copyFile(join(base, file), join(output, file));

let html = await readFile(join(base, 'index.html'), 'utf8');
const mustReplace = (before, after, label) => {
  if (!html.includes(before)) throw new Error('Missing expected section: ' + label);
  html = html.replace(before, after);
};
mustReplace('<script src="/app.js" defer></script>', '<script src="/local-demo.js" defer></script>', 'app script');
const firstLink = html.indexOf('<a class="offline-demo-link');
const petStage = html.indexOf('<div class="pet-stage">');
if (firstLink < 0 || petStage <= firstLink) throw new Error('Cannot safely remove internal showcase links');
html = html.slice(0, firstLink) + html.slice(petStage);
const chatStart = html.indexOf('<section class="chat-panel"');
const chatEnd = html.indexOf('</main>', chatStart);
if (chatStart < 0 || chatEnd < 0) throw new Error('Cannot safely remove AI chat panel');
html = html.slice(0, chatStart) + `<section class="chat-panel" aria-label="免費本地陪伴">
  <div class="chat-header"><div class="chat-person"><div class="chat-avatar" aria-hidden="true">🐱</div><div><strong>爪爪喺度陪你</strong><small>免費本地版 · 無 AI 連線</small></div></div></div>
  <div class="chat-notice"><span>♡</span><span>今日唔想出門都可以，唔使做任何任務。爪爪一樣陪住你。</span></div>
  <div class="chat-messages" id="messages" role="log" aria-live="polite"><div class="message assistant"><div class="bubble">你好呀！我係爪爪 🐾 可以摸摸頭、分享心情，或者只係休息下。</div><small>爪爪</small></div></div>
  <div class="chat-bottom"><div class="suggestions"><button type="button" id="localRest">唔想出門 🌿</button><button type="button" id="localHello">同爪爪打招呼 👋</button></div>
  <div class="composer-footer"><span>純本地固定回應 · 無 AI 聊天</span><span>非醫療或危機服務</span></div></div>
  <div class="crisis-notice local-hotlines"><strong>需要真人支援？</strong><span>香港：<a href="tel:23892222">撒瑪利亞會 2389 2222</a> · <a href="tel:23820000">生命熱線 2382 0000</a>。即時危險可致電 <a href="tel:999">999</a>。</span></div>
</section>
` + html.slice(chatEnd);
const gateStart = html.indexOf('<div class="gate-backdrop"');
if (gateStart < 0) throw new Error('Cannot safely remove AI access gate');
html = html.slice(0, gateStart) + '</body>\n</html>\n';
mustReplace('互動寵物 v1.5（免費本地陪伴導覽）', 'v1.5 Public Local Demo · 無 AI', 'version');
mustReplace('一隻懂廣東話嘅 AI 虛擬寵物', '免費本地虛擬寵物概念', 'description');
mustReplace('你嘅 AI 虛擬寵物', '你嘅免費本地虛擬寵物', 'pet label');
mustReplace('想講嘢，我會聽。', '想摸摸爪爪，我會喺度。', 'intro');
mustReplace('© MiraclePaw — 星爪內部概念測試', '© MiraclePaw — 成年持份者本地試玩版', 'footer');
mustReplace('呢個只係成年人內部 Demo', '呢個只係成年人概念 Demo', 'mood note');
mustReplace('純本頁引導 · 不需 AI 密碼', '純本頁引導 · 不使用 AI', 'tour note');
if (/\/api\/chat|<form|passcode|openai\.com|netlify\/functions/i.test(html)) throw new Error('Unexpected API / form / passcode content in public HTML');
await writeFile(join(output, 'index.html'), html);
await copyFile(join(import.meta.dirname, 'local-demo.js'), join(output, 'local-demo.js'));
console.log('Public local-only demo built; only allowlisted static assets, no backend.');
