(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const messages = $('messages');
  const add = text => {
    const wrap = document.createElement('div');
    wrap.className = 'message assistant';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    messages?.appendChild(wrap);
  };
  $('localRest')?.addEventListener('click', () => {
    $('stepStatus').textContent = '今日唔出去完全可以。爪爪一樣陪住你。';
    $('petSpeech').textContent = '唔使急住出門，我喺度呀 🐾';
    add('今日留喺度都完全可以，唔需要交功課。爪爪一樣陪住你 🤍');
  });
  $('localHello')?.addEventListener('click', () => add('喵～見到你真好！慢慢嚟就得 🐾'));
  let step = '';
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    step = button.dataset.step;
    $('stepStatus').textContent = '你可以選擇模擬「' + step + '」，亦可以隨時唔做。';
    $('doneStep').disabled = false;
  }));
  $('doneStep')?.addEventListener('click', () => {
    if (!step) return;
    $('stepStatus').textContent = '模擬完成「' + step + '」。唔完成都完全冇關係。';
    $('doneStep').disabled = true;
    step = '';
  });
  $('skipStep')?.addEventListener('click', () => {
    $('stepStatus').textContent = '今日唔出去完全可以。爪爪一樣陪住你。';
    $('petSpeech').textContent = '我會繼續陪你，唔使做任何任務 🐾';
    add('唔出門都得呀，我哋可以靜靜地休息 🤍');
    step = '';
    $('doneStep').disabled = true;
  });
  $('petHello')?.addEventListener('click', () => {
    const msg = $('petHelloMessage');
    msg.hidden = false;
    msg.textContent = '🐾 虛構小狗豆豆：你好呀爪爪！ 🐱 爪爪：你好～（純模擬，冇真人配對）';
  });
})();