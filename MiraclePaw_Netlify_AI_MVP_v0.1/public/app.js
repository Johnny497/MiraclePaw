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
  const triageAdapter = window.MiraclePawTriage;
  const status = $('connectionStatus');
  const maxTurns = 20;
  const history = []; // In-memory only: not stored in localStorage or on our server.
  let demoPasscode = '';
  let sending = false;
  let count = 0;
  let activeRequest = null;
  const requestTimeoutMs = 30000;

  const triageUnavailable = '爪爪暫時未能安全處理呢句；免費本地陪伴仍然可以使用。';

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

    // Browser copy is generated from the existing server triage source and parity-tested.
    // The server still independently checks every request; browser routing grants no authorization.
    let local;
    try { local = triageAdapter?.triageInput(message, history.slice(-12)); } catch { local = null; }
    if (!local || typeof local.blockGeneration !== 'boolean') {
      addMessage('assistant', triageUnavailable);
      $('connectionStatus').textContent = 'AI 暫時唔可用 · 免費本地陪伴仍然可以使用';
      return;
    }
    if (local.blockGeneration) {
      addMessage('assistant', local.reply);
      addHistory(message, local.reply);
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
    // Optional fictional encounter; the module enforces admission and crisis pause.
    window.MiraclePawPetSocial?.open();
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
