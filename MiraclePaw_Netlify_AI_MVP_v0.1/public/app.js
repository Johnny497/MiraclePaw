(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const messages = $('messages');
  const chatForm = $('chatForm');
  const input = $('userInput');
  const sendButton = $('sendButton');
  const gate = $('gate');
  const gateForm = $('gateForm');
  const crisisNotice = $('crisisNotice');
  const status = $('connectionStatus');
  const maxTurns = 20;
  const history = []; // In-memory only: not stored in localStorage or on our server.
  let demoPasscode = '';
  let sending = false;
  let count = 0;
  let selectedStep = '';

  const crisisPattern = /自殺|自殘|想死|唔想活|不想活|結束生命|割(?:手|腕)|跳樓|傷害自己|傷害別人|傷害他人|殺(?:人|咗佢|死佢)|殺死佢|kill myself|end my life|want to die|suicid(?:e|al)|self[ -]?harm|hurt myself|hurt someone|kill someone/i;
  const crisisText = '我聽到你而家可能好辛苦，我仍然喺度陪你。呢一刻先唔做任何任務。香港支援熱線：撒瑪利亞會 2389 2222、生命熱線 2382 0000。如果有人即時有危險，請打 999。你可以自己選擇點樣求助，星爪唔會偷偷聯絡第三方。';

  function addMessage(role, text) {
    const row = document.createElement('div');
    row.className = `message ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text; // textContent avoids DOM/HTML injection from model responses.
    row.appendChild(bubble);
    if (role !== 'system') {
      const footer = document.createElement('small');
      footer.textContent = role === 'assistant' ? '爪爪' : '你';
      row.appendChild(footer);
    }
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  }

  function setBusy(value) {
    sending = value;
    input.disabled = value || !demoPasscode || count >= maxTurns;
    sendButton.disabled = input.disabled;
    if (value) status.textContent = '爪爪諗緊點樣回覆你…';
    else if (count >= maxTurns) status.textContent = '今次試玩到達上限，請按右上角重新開始';
    else status.textContent = '已準備傳送，首次訊息將驗證連線';
  }

  function showCrisis() {
    crisisNotice.hidden = false;
    $('petSpeech').textContent = '我喺度陪你 🤍';
  }

  function addHistory(user, assistant) {
    history.push({ role: 'user', content: user }, { role: 'assistant', content: assistant });
    if (history.length > 12) history.splice(0, history.length - 12);
  }

  async function send(text) {
    const message = text.trim();
    if (!demoPasscode || sending || !message || count >= maxTurns) return;
    count += 1;
    addMessage('user', message);
    input.value = '';
    input.style.height = 'auto';

    // Quick local warning avoids waiting on the network; server independently checks too.
    if (crisisPattern.test(message)) {
      addMessage('assistant', crisisText);
      addHistory(message, crisisText);
      showCrisis();
      $('connectionStatus').textContent = '危機支援資訊已顯示';
      return;
    }

    setBusy(true);
    const pending = document.createElement('div');
    pending.className = 'message assistant';
    const bubble = document.createElement('div');
    bubble.className = 'bubble typing';
    bubble.setAttribute('aria-label', '爪爪正在思考');
    bubble.innerHTML = '<i></i><i></i><i></i>';
    pending.appendChild(bubble);
    messages.appendChild(pending);
    messages.scrollTop = messages.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Demo-Passcode': demoPasscode },
        body: JSON.stringify({ message, history: history.slice(-12) }),
        cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `連線失敗（${response.status}）`);
      const reply = String(result.reply || '').trim();
      if (!reply) throw new Error('AI 回覆為空，請稍後重試。');
      pending.remove();
      addMessage('assistant', reply);
      addHistory(message, reply);
      if (result.crisis) showCrisis();
      else $('petSpeech').textContent = '多謝你同我分享 🌼';
    } catch (error) {
      pending.remove();
      addMessage('system', error instanceof Error ? error.message : '暫時連線失敗，請再試一次。');
      if (/密碼/.test(String(error?.message))) $('connectionStatus').textContent = '密碼錯誤，請按 ↻ 重新輸入';
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  gateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!$('agree').checked) return;
    const code = $('passcode').value;
    if (code.length < 12) {
      $('gateError').textContent = '請輸入管理員設定嘅至少 12 位試玩密碼。';
      $('gateError').hidden = false;
      return;
    }
    demoPasscode = code; // Only in this page memory; not persisted.
    gate.hidden = true;
    gate.setAttribute('aria-hidden', 'true');
    $('passcode').value = '';
    setBusy(false);
    input.focus();
  });

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    send(input.value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      send(input.value);
    }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 116)}px`;
  });
  document.querySelectorAll('[data-prompt]').forEach((button) => {
    button.addEventListener('click', () => send(button.dataset.prompt));
  });

  document.querySelectorAll('[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedStep = button.dataset.step;
      document.querySelectorAll('[data-step]').forEach((b) => b.classList.toggle('selected', b === button));
      $('stepStatus').textContent = `你揀咗「${selectedStep}」，做唔做都冇關係。`;
      $('doneStep').disabled = false;
    });
  });
  $('doneStep').addEventListener('click', () => {
    if (!selectedStep) return;
    addMessage('system', `模擬打卡：今日試咗「${selectedStep}」。呢個只係本頁展示，冇 GPS、冇上傳打卡資料。`);
    $('stepStatus').textContent = '已完成模擬打卡！無論做唔做到，都值得被好好對待。';
    $('petSpeech').textContent = '謝謝你願意試試 🌿';
    document.querySelectorAll('[data-step]').forEach((b) => b.classList.remove('selected'));
    selectedStep = '';
    $('doneStep').disabled = true;
  });
  $('skipStep').addEventListener('click', () => {
    $('stepStatus').textContent = '今日唔出去完全可以。爪爪一樣陪住你。';
    $('petSpeech').textContent = '今日休息都得 🫶';
    if (demoPasscode) send('我今日唔想出門，唔想做任務，你可唔可以照樣陪我傾偈？');
    else addMessage('system', '完成試玩確認之後，就可以同爪爪傾偈。');
  });
  $('petHello').addEventListener('click', () => {
    const msg = $('petHelloMessage');
    msg.textContent = '🐱 豆豆（虛構寵物）：Hi 爪爪！今日見到一朵好靚嘅雲 ☁️。呢段係純模擬嘅寵物互動，唔涉及真人配對、定位或資料分享。你可以完全唔跟進。';
    msg.hidden = false;
    $('petSpeech').textContent = 'Hi 豆豆！☁️';
  });
  $('resetChat').addEventListener('click', () => {
    history.length = 0;
    count = 0;
    messages.replaceChildren();
    addMessage('assistant', '你好呀，我係爪爪！🍀 新一段對話開始啦。');
    crisisNotice.hidden = true;
    demoPasscode = '';
    $('agree').checked = false;
    gate.hidden = false;
    gate.removeAttribute('aria-hidden');
    $('petSpeech').textContent = 'Hi～ 我係爪爪！';
    status.textContent = '請先完成試玩確認';
    input.disabled = true;
    sendButton.disabled = true;
    $('passcode').focus();
  });
})();
