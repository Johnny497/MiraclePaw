(() => {
  'use strict';
  // Adult-stakeholder prototype only. Everything below stays in page memory.
  // No localStorage, cookies, analytics, API requests, or server persistence.
  const history = document.getElementById('moodHistory');
  const empty = document.getElementById('moodEmpty');
  const feedback = document.getElementById('moodFeedback');
  const clearButton = document.getElementById('moodClear');
  const skipButton = document.getElementById('moodSkip');
  const petSpeech = document.getElementById('petSpeech');
  if (!history || !empty || !feedback || !clearButton || !skipButton || !petSpeech) return;

  const feelings = Object.freeze({
    happy:   { emoji: '😊', label: '開心', speech: '見到你開心，爪爪都替你高興呀 🌼', response: '多謝你分享呢一刻嘅開心。', petMood: 'happy' },
    calm:    { emoji: '😌', label: '平靜', speech: '慢慢嚟就好，舒服自在都好重要 🌿', response: '平靜嘅一刻，都值得記住。', petMood: 'calm' },
    worried: { emoji: '😟', label: '有啲擔心', speech: '有啲擔心都可以慢慢講，我會聽 🤍', response: '有擔心嘅時候，唔使迫自己即刻解決。', petMood: 'calm' },
    low:     { emoji: '😔', label: '有啲低落', speech: '今日低落都冇關係，我繼續喺度陪你 🤍', response: '多謝你願意分享低落嘅感受。唔想做任務都完全可以。', petMood: 'calm' },
    tired:   { emoji: '🥱', label: '攰攰哋', speech: '攰就抖一抖啦，今日唔使勉強自己 🌙', response: '攰嘅時候，休息都係一個選擇。', petMood: 'sleepy' },
  });
  const entries = [];
  const maxEntries = 10;

  function render() {
    history.replaceChildren();
    entries.forEach((entry) => {
      const item = document.createElement('li');
      const when = document.createElement('time');
      const label = document.createElement('strong');
      when.dateTime = entry.isoTime;
      when.textContent = entry.time;
      label.textContent = `${entry.emoji} ${entry.label}`;
      item.append(label, when);
      history.appendChild(item);
    });
    empty.hidden = entries.length > 0;
    clearButton.disabled = entries.length === 0;
  }

  document.querySelectorAll('[data-feeling]').forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const key = button.dataset.feeling;
      if (!Object.hasOwn(feelings, key)) return;
      const feeling = feelings[key];
      const now = new Date();
      const entry = {
        emoji: feeling.emoji,
        label: feeling.label,
        isoTime: now.toISOString(),
        time: new Intl.DateTimeFormat('zh-HK', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now),
      };
      entries.push(entry);
      if (entries.length > maxEntries) entries.shift();
      render();
      document.querySelectorAll('[data-feeling]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      feedback.textContent = `${feeling.response} 已記低「${feeling.label}」，只會留喺本次試玩。`;
      petSpeech.textContent = feeling.speech;
      // Mood label refers to the virtual pet's expression, not a user assessment.
      document.dispatchEvent(new CustomEvent('miraclepaw:mood-checkin', { detail: { petMood: feeling.petMood } }));
    });
  });

  skipButton.addEventListener('click', () => {
    feedback.textContent = '今日唔想記錄都得。爪爪一樣喺度陪你，冇任何懲罰。';
    petSpeech.textContent = '唔記錄都可以，慢慢嚟呀 🐾';
    document.querySelectorAll('[data-feeling]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  });

  clearButton.addEventListener('click', () => {
    if (entries.length === 0) return;
    if (!window.confirm('確定清除本次試玩嘅全部心情記錄？清除後無法還原。')) return;
    entries.length = 0;
    render();
    document.querySelectorAll('[data-feeling]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    feedback.textContent = '本次心情記錄已清除。重新整理頁面亦會清除。';
  });

  // The shared restart control clears all session-only demo state, including mood entries.
  document.getElementById('resetChat')?.addEventListener('click', () => {
    entries.length = 0;
    render();
    document.querySelectorAll('[data-feeling]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    feedback.textContent = '記錄只會留喺呢個網頁嘅記憶中，重新整理即清除。';
  });

  render();
})();
