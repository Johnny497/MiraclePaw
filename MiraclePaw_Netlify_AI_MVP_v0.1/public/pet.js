(() => {
  'use strict';
  const pet = document.getElementById('petTouch');
  const speech = document.getElementById('petSpeech');
  const status = document.getElementById('petActionStatus');
  const particles = document.getElementById('petHearts');
  if (!pet || !speech || !status || !particles) return;
  let resetTimer;
  const actions = {
    pet: { speech: '呼～摸摸頭好舒服呀 🐾', status: '爪爪輕輕擰頭，開心接受你嘅摸摸。', hearts: true },
    hug: { speech: '抱住你一陣，好唔好？🤍', status: '一個暖笠笠嘅擁抱，今日唔使做任何任務。', hearts: true },
    feed: { speech: '多謝你嘅小魚仔！🐟', status: '餵食只係趣味互動，冇飢餓值，唔餵都完全冇關係。', hearts: false },
    wave: { speech: '喵～好高興見到你 👋', status: '爪爪同你打招呼，想傾偈亦可以慢慢嚟。', hearts: true },
    rest: { speech: '我休息一陣，你都可以慢慢嚟 🌙', status: '爪爪閉目養神，休息完仍然會喺度。', hearts: false },
  };
  function hearts() {
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-particle';
      heart.textContent = i % 2 ? '🩷' : '✨';
      heart.style.setProperty('--x', `${27 + i * 11}%`);
      heart.style.setProperty('--dx', `${(i - 2) * 18}px`);
      heart.style.setProperty('--size', `${18 + (i % 3) * 4}px`);
      particles.appendChild(heart);
      window.setTimeout(() => heart.remove(), 1300);
    }
  }
  function play(name) {
    if (!Object.hasOwn(actions, name)) return;
    const action = actions[name];
    window.clearTimeout(resetTimer);
    pet.removeAttribute('data-animation');
    void pet.offsetWidth;
    pet.dataset.animation = name;
    speech.textContent = action.speech;
    status.textContent = action.status;
    if (action.hearts) hearts();
    resetTimer = window.setTimeout(() => pet.removeAttribute('data-animation'), name === 'rest' ? 2800 : 1300);
  }
  pet.addEventListener('click', () => play('pet'));
  document.querySelectorAll('[data-pet-action]').forEach((button) =>
    button.addEventListener('click', () => play(button.dataset.petAction))
  );
})();