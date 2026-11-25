(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const pet = $('petTouch');
  const speech = $('petSpeech');
  const status = $('petActionStatus');
  const particles = $('petHearts');
  const moodLabel = $('catMoodLabel');
  if (!pet || !speech || !status || !particles || !moodLabel) return;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const actions = {
    pet: { speech: '呼～摸摸頭好舒服呀 🐾', status: '爪爪輕輕點頭，開心接受你嘅摸摸。', mood: 'happy', hearts: true, ms: 1200 },
    hug: { speech: '抱一抱～ 今日都辛苦你啦 🤍', status: '爪爪靠近少少，陪伴唔需要任何條件。', mood: 'happy', hearts: true, ms: 1400 },
    feed: { speech: '小魚仔！多謝你呀 🐟', status: '餵食只係趣味互動，冇飢餓值，唔餵都完全冇關係。', mood: 'happy', hearts: false, ms: 1200 },
    wave: { speech: '喵～見到你真好 👋', status: '爪爪搖搖尾，同你打招呼。', mood: 'happy', hearts: true, ms: 1400 },
    rest: { speech: '我哋可以休息一陣 🌙', status: '爪爪合埋眼休息，隨時可以叫醒佢。', mood: 'sleepy', hearts: false, ms: 3200 },
    blink: { speech: '眨眨眼～ 我聽緊你講 😺', status: '爪爪輕輕眨眼，你可以繼續自己嘅節奏。', mood: 'calm', hearts: false, ms: 950 },
  };
  let animationTimer = null;
  let moodResetTimer = null;
  let blinkTimer = null;
  let blinkClassTimer = null;
  let particleTimer = null;
  let bodyAnimation = null;
  let preferredMood = 'calm';
  const art = pet.querySelector('.cat-art');
  const crisis = $('crisisNotice');
  const gate = $('gate');
  const agree = $('agree');
  const inCrisis = () => Boolean(crisis && !crisis.hidden);
  const admitted = () => Boolean(gate && agree && gate.hidden && agree.checked);
  const poses = Object.freeze({
    pet: 'translateY(7px) rotate(-3deg) scale(.96,1.03)',
    hug: 'scale(1.09,.96) rotate(-4deg)',
    feed: 'translateY(10px) rotate(-4deg)',
    wave: 'rotate(-7deg)',
    rest: 'translateY(10px) scale(.98,.95)',
    blink: 'translateY(1px)',
  });
  function clearParticles() {
    window.clearTimeout(particleTimer);
    particles.replaceChildren();
  }
  function stopBody(keepOverride = false) {
    bodyAnimation?.cancel(); bodyAnimation = null;
    if (!keepOverride) pet.removeAttribute('data-smooth-action');
  }
  function smoothAction(name, duration, from) {
    if (!art || typeof art.animate !== 'function' || motionQuery.matches || document.hidden) return;
    pet.dataset.smoothAction = 'true';
    bodyAnimation = art.animate([
      { transform: from || 'none', offset: 0 },
      { transform: poses[name], offset: .38 },
      { transform: 'translateY(1px)', offset: 1 },
    ], { duration, easing: 'ease-in-out', fill: 'both' });
  }
  function stopTransient(keepOverride = false) {
    window.clearTimeout(animationTimer);
    window.clearTimeout(moodResetTimer);
    window.clearTimeout(blinkClassTimer);
    pet.removeAttribute('data-animation');
    pet.classList.remove('blink-now');
    stopBody(keepOverride); clearParticles();
  }
  function resetPet() {
    stopTransient(); preferredMood = 'calm'; setMood('calm');
    status.textContent = '想摸摸爪爪或者休息都得，冇照顧要求。';
  }
  function setMood(mood, temporary = false) {
    const kinds = { calm: '🐾 舒舒服服', happy: '💗 好開心', sleepy: '🌙 慢慢休息' };
    if (!Object.hasOwn(kinds, mood)) return;
    pet.dataset.mood = mood;
    moodLabel.textContent = kinds[mood];
    document.querySelectorAll('[data-pet-mood]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.petMood === mood));
    });
    if (!temporary) window.clearTimeout(moodResetTimer);
  }
  function blink() {
    if (motionQuery.matches || document.hidden || !admitted() || inCrisis() || pet.dataset.mood === 'sleepy') return;
    pet.classList.remove('blink-now');
    void pet.offsetWidth;
    pet.classList.add('blink-now');
    window.clearTimeout(blinkClassTimer);
    blinkClassTimer = window.setTimeout(() => pet.classList.remove('blink-now'), 440);
  }
  function scheduleBlink() {
    window.clearTimeout(blinkTimer);
    if (motionQuery.matches || document.hidden || !admitted() || inCrisis()) return;
    blinkTimer = window.setTimeout(() => {
      blink();
      scheduleBlink();
    }, 3500 + Math.round(Math.random() * 4500));
  }
  function hearts() {
    clearParticles();
    if (motionQuery.matches || document.hidden) return;
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('span');
      particle.className = 'heart-particle';
      particle.textContent = i % 2 ? '🩷' : '✨';
      particle.style.setProperty('--x', `${27 + i * 11}%`);
      particle.style.setProperty('--dx', `${(i - 2) * 18}px`);
      particle.style.setProperty('--size', `${18 + (i % 3) * 4}px`);
      particles.appendChild(particle);
    }
    particleTimer = window.setTimeout(clearParticles, 1300);
  }
  function play(name) {
    if (!admitted() || !Object.hasOwn(actions, name)) return;
    if (inCrisis()) {
      stopTransient(); setMood('calm');
      speech.textContent = '我喺度陪你 🤍';
      status.textContent = '而家唔需要做任何嘢，可以休息。';
      return;
    }
    const a = actions[name];
    const from = art ? window.getComputedStyle(art).transform : 'none';
    const smooth = Boolean(art && typeof art.animate === 'function' && !motionQuery.matches && !document.hidden);
    if (smooth) pet.dataset.smoothAction = 'true';
    stopTransient(smooth);
    pet.removeAttribute('data-animation');
    void pet.offsetWidth;
    pet.dataset.animation = name;
    smoothAction(name, a.ms, from);
    speech.textContent = a.speech;
    status.textContent = a.status;
    setMood(a.mood, true);
    if (a.hearts) hearts();
    if (name === 'blink') blink();
    animationTimer = window.setTimeout(() => { pet.removeAttribute('data-animation'); stopBody(); }, a.ms);
    moodResetTimer = window.setTimeout(() => setMood(preferredMood), a.ms + 1700);
  }
  pet.dataset.mood = 'calm';
  pet.addEventListener('click', () => play('pet'));
  document.querySelectorAll('[data-pet-action]').forEach((button) =>
    button.addEventListener('click', () => play(button.dataset.petAction))
  );
  document.querySelectorAll('[data-pet-mood]').forEach((button) =>
    button.addEventListener('click', () => {
      const mood = button.dataset.petMood;
      if (!admitted() || inCrisis() || !['calm','happy','sleepy'].includes(mood)) return;
      stopTransient(); preferredMood = mood;
      setMood(mood);
      const lines = { calm:'爪爪而家好平靜，慢慢嚟都得。', happy:'爪爪笑住同你打招呼 🩷', sleepy:'爪爪想抖一陣，你都可以休息。' };
      speech.textContent = lines[mood];
      status.textContent = '呢個只係寵物表情切換，唔係你嘅情緒評估。';
    })
  );
  // A mood check-in only changes the pet's temporary expression.
  // The person's selected feeling stays in mood.js page memory; it is never sent to the AI.
  document.addEventListener('miraclepaw:mood-checkin', (event) => {
    const petMood = event.detail?.petMood;
    if (!admitted() || inCrisis() || !['calm', 'happy', 'sleepy'].includes(petMood)) return;
    stopTransient();
    setMood(petMood, true);
    moodResetTimer = window.setTimeout(() => setMood(preferredMood), 3500);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { window.clearTimeout(blinkTimer); stopTransient(); setMood(inCrisis() ? 'calm' : preferredMood); }
    else scheduleBlink();
  });
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', () => { stopTransient(); setMood(inCrisis() ? 'calm' : preferredMood); scheduleBlink(); });
  }
  $('resetChat')?.addEventListener('click', resetPet);
  function syncContext() {
    if (!admitted()) resetPet();
    else if (inCrisis()) { stopTransient(); setMood('calm'); status.textContent = '而家唔需要做任何嘢，可以休息。'; }
    scheduleBlink();
  }
  const observer = new MutationObserver(syncContext);
  if (gate) observer.observe(gate, {attributes:true, attributeFilter:['hidden']});
  if (crisis) observer.observe(crisis, {attributes:true, attributeFilter:['hidden']});
  agree?.addEventListener('change', syncContext);
  syncContext();
})();