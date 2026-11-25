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
  const aiFallback = $('aiFallback');
  const fallbackAdapter = window.MiraclePawAIFallback;
  const status = $('connectionStatus');
  const maxTurns = 20;
  const history = []; // In-memory only: not stored in localStorage or on our server.
  let demoPasscode = '';
  let sending = false;
  let count = 0;
  let selectedStep = '';
  let activeRequest = null;
  const requestTimeoutMs = 30000;

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

  function setBusy(value, finalStatus = '') {
    sending = value;
    input.disabled = value || !demoPasscode || count >= maxTurns;
    sendButton.disabled = input.disabled;
    if (value) status.textContent = '爪爪諗緊點樣回覆你…';
    else if (finalStatus) status.textContent = finalStatus + (count >= maxTurns ? ' · 今次試玩到達上限' : '');
    else if (count >= maxTurns) status.textContent = '今次試玩到達上限，請按右上角重新開始';
    else if (!demoPasscode) status.textContent = '免費本地陪伴模式 · AI 對話未啟用';
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
    if (aiFallback) aiFallback.hidden = true;
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

    const controller = new AbortController();
    activeRequest = controller;
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    let finalStatus = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Demo-Passcode': demoPasscode },
        body: JSON.stringify({ message, history: history.slice(-12) }),
        cache: 'no-store',
        signal: controller.signal,
      });
      // No retry. A bare 429 or malformed response must never expose model text.
      const result = response.ok ? await response.json().catch(() => null) : null;
      if (activeRequest !== controller) return;
      if (controller.signal.aborted) throw new Error('Request timed out');
      const decision = fallbackAdapter?.classify(response.status, result);
      if (!decision || !decision.showModelText) {
        throw new Error(response.status === 429
          ? 'AI 試玩請求太密集；唔需要連續重試。'
          : 'AI 暫時未能提供已確認嘅回覆。');
      }
      pending.remove();
      addMessage('assistant', decision.text);
      addHistory(message, decision.text);
      if (decision.crisis) {
        showCrisis();
        finalStatus = '危機支援資訊已顯示';
      } else {
        $('petSpeech').textContent = '多謝你同我分享 🌼';
        finalStatus = '已收到伺服器回覆';
      }
    } catch (error) {
      if (activeRequest !== controller) return;
      finalStatus = 'AI 暫時唔可用 · 免費本地陪伴仍然可以使用';
      pending.remove();
      if (aiFallback) aiFallback.hidden = false;
      // Error messages are fixed locally; never display upstream bodies.
      const decision = fallbackAdapter?.classify(0, null, true);
      addMessage('assistant', decision?.text || '爪爪仍然喺度陪你。你可以繼續使用免費本地陪伴。');
    } finally {
      clearTimeout(timeout);
      if (activeRequest === controller) {
        activeRequest = null;
        setBusy(false, finalStatus);
        input.focus();
      }
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

  // Local-only entry still requires the adult internal-demo acknowledgment, but never a passcode or API call.
  $('localEntry')?.addEventListener('click', () => {
    if (!$('agree').checked) {
      $('gateError').textContent = '請先確認你係成年人，並只使用虛構、非敏感嘅內部測試資料。';
      $('gateError').hidden = false;
      return;
    }
    demoPasscode = '';
    $('passcode').value = '';
    $('gateError').hidden = true;
    gate.hidden = true;
    gate.setAttribute('aria-hidden', 'true');
    setBusy(false);
    ($('tourStart') || $('petTouch'))?.focus();
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
  function reassureNoOuting() {
    $('stepStatus').textContent = '今日唔出去完全可以。爪爪一樣陪住你。';
    $('petSpeech').textContent = '今日休息都得 🫶';
    // A refusal must not trigger an unwanted network message or use AI credits.
    // Local reassurance is always available, even before demo passcode entry.
    addMessage('assistant', '今日留喺度都完全可以，唔需要交功課。爪爪一樣陪住你 🤍');
  }
  $('skipStep').addEventListener('click', reassureNoOuting);
  document.querySelectorAll('[data-local-companion]').forEach((button) =>
    button.addEventListener('click', reassureNoOuting)
  );
  $('petHello').addEventListener('click', () => {
    const msg = $('petHelloMessage');
    msg.textContent = '🐱 豆豆（虛構寵物）：Hi 爪爪！今日見到一朵好靚嘅雲 ☁️。呢段係純模擬嘅寵物互動，唔涉及真人配對、定位或資料分享。你可以完全唔跟進。';
    msg.hidden = false;
    $('petSpeech').textContent = 'Hi 豆豆！☁️';
  });
  $('resetChat').addEventListener('click', () => {
    const previousRequest = activeRequest;
    activeRequest = null;
    previousRequest?.abort();
    sending = false;
    input.value = '';
    $('passcode').value = '';
    history.length = 0;
    count = 0;
    messages.replaceChildren();
    addMessage('assistant', '你好呀，我係爪爪！🍀 新一段對話開始啦。');
    crisisNotice.hidden = true;
    if (aiFallback) aiFallback.hidden = true;
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
