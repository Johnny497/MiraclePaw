// Adult fictional demo only. Preset choices, no AI, storage or network.
(() => {
  'use strict';
  const panel = document.getElementById('localCompanion');
  if (!panel) return;
  const reply = document.getElementById('localCompanionReply');
  const clear = document.getElementById('localCompanionClear');
  const resetChat = document.getElementById('resetChat');
  const gate = document.getElementById('gate');
  const agree = document.getElementById('agree');
  const admitted = () => Boolean(gate && agree && gate.hidden && agree.checked);
  const names = Object.freeze({ ming: '阿明', yan: '阿欣' });
  const moods = Object.freeze({
    tired: { label: '有啲攰', text: '攰攰哋嘅時候，唔需要勉強自己做任何嘢。' },
    worried: { label: '有啲擔心', text: '有啲擔心都可以慢慢嚟，唔使即刻搵答案。' },
    calm: { label: '幾平靜', text: '可以享受呢一刻嘅平靜，唔需要做多啲嘢。' },
  });
  const nameButtons = [...panel.querySelectorAll('[data-fictional-name]')];
  const moodButtons = [...panel.querySelectorAll('[data-fictional-mood]')];
  const follow = document.getElementById('localCompanionFollow');
  const stay = document.getElementById('localCompanionStay');
  let name = '', mood = '', interacted = false;
  const owns = (object, key) => Object.hasOwn(object, key);
  function setPressed(buttons, field, selected) {
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset[field] === selected));
  }
  function sync() {
    setPressed(nameButtons, 'fictionalName', name);
    setPressed(moodButtons, 'fictionalMood', mood);
    clear.disabled = !interacted;
  }
  function address() { return name ? names[name] + '，' : ''; }
  function reset() {
    name = ''; mood = ''; interacted = false; sync();
    reply.textContent = 'Hi～ 我係爪爪。可以揀虛構名字或者心情，唔揀都得。';
  }
  nameButtons.forEach(button => button.addEventListener('click', () => {
    if (!admitted()) return;
    const key = button.dataset.fictionalName;
    if (!owns(names, key)) return;
    name = key; interacted = true; sync();
    reply.textContent = `你好呀，${names[name]}！我會喺呢次示範記住呢個虛構名字。`;
  }));
  moodButtons.forEach(button => button.addEventListener('click', () => {
    if (!admitted()) return;
    const key = button.dataset.fictionalMood;
    if (!owns(moods, key)) return;
    mood = key; interacted = true; sync();
    reply.textContent = `${address()}${moods[mood].text} 我喺度陪你。`;
  }));
  follow.addEventListener('click', () => {
    if (!admitted()) return;
    interacted = true; sync();
    reply.textContent = mood
      ? `${address()}頭先你揀咗「${moods[mood].label}」。而家想休息、轉個話題，或者唔講嘢都得。`
      : `${address()}你未揀心情都冇問題，唔想講嘢都可以。我喺度陪你。`;
  });
  stay.addEventListener('click', () => {
    if (!admitted()) return;
    interacted = true; sync();
    reply.textContent = `${address()}今日唔出門完全可以，冇任務、冇扣分。爪爪一樣陪住你。`;
  });
  clear.addEventListener('click', () => {
    if (!admitted()) return;
    reset();
    follow.focus();
  });
  function syncGate() {
    panel.hidden = !admitted();
    if (panel.hidden) reset();
  }
  resetChat?.addEventListener('click', () => {
    reset();
    panel.hidden = true;
  });
  reset();
  syncGate();
  if (gate && agree) {
    new MutationObserver(syncGate).observe(gate, { attributes: true, attributeFilter: ['hidden'] });
    agree.addEventListener('change', syncGate);
  }
})();
