// Phase 5B: fictional adult demo, session-only choice; no location, score, history or AI.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const panel = $('littleSteps'), status = $('stepStatus'), done = $('doneStep');
  const skip = $('skipStep'), clear = $('journeyClear'), gate = $('gate'), agree = $('agree');
  const crisis = $('crisisNotice'), pet = $('petSpeech');
  if (![panel, status, done, skip, clear, gate, agree, crisis, pet].every(Boolean)) return;
  const scenes = Object.freeze({
    view: ['望一望窗外', '留喺原位望一望都得，唔需要行近窗邊。'],
    window: ['窗邊休息', '如果舒服，可以想像喺安全嘅窗邊坐一陣，唔使開窗。'],
    door: ['門口附近', '可以只留喺屋內，唔需要打開門。'],
    downstairs: ['樓下熟悉地方', '只係虛構日間情境，現實中要安全同自己願意，隨時可以返回。'],
    public: ['安全日間公共場所', '想像熟悉嘅日間公共地方，唔需要同任何人交流。'],
    water: ['留喺室內飲水', '留喺室內都完全可以，按自己需要休息。'],
  });
  const buttons = [...panel.querySelectorAll('[data-journey]')];
  const restButtons = [...document.querySelectorAll('[data-local-companion]')];
  let selected = '', interacted = false;
  const initial = '今日想留喺邊個情境都得，唔揀都可以。';
  const crisisText = '而家唔需要做任何微行動。可以休息，爪爪仍然喺度陪你。';
  const admitted = () => gate.hidden && agree.checked;
  const canChoose = () => admitted() && crisis.hidden;
  function sync() {
    buttons.forEach(button => {
      button.disabled = !canChoose();
      button.setAttribute('aria-pressed', String(button.dataset.journey === selected));
    });
    done.disabled = !canChoose() || !selected;
    clear.disabled = !admitted() || !interacted;
  }
  function reset(text = initial) {
    selected = ''; interacted = false; status.textContent = text; sync();
  }
  function syncGate() {
    panel.hidden = !admitted();
    if (panel.hidden) reset();
    else if (!crisis.hidden) reset(crisisText);
    else sync();
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    if (!canChoose()) return;
    const key = button.dataset.journey;
    if (!Object.hasOwn(scenes, key)) return;
    selected = key; interacted = true;
    status.textContent = `虛構情境：${scenes[key][0]}。${scenes[key][1]} 做唔做都冇關係。`;
    sync();
  }));
  done.addEventListener('click', () => {
    if (!canChoose() || !selected) return;
    const label = scenes[selected][0];
    selected = ''; interacted = true;
    status.textContent = `已試玩「${label}」情境，唔代表真實出門或完成紀錄。你可以休息、重揀或者返回室內。`;
    pet.textContent = '照自己節奏就好 🤍';
    sync();
    skip.focus();
  });
  function rest() {
    if (!admitted()) return;
    // app.js provides the same fixed local reassurance; no chat API request.
    selected = ''; interacted = true;
    status.textContent = crisis.hidden ? '今日唔出去完全可以。爪爪一樣陪住你。' : crisisText;
    sync();
  }
  skip.addEventListener('click', rest);
  restButtons.forEach(button => button.addEventListener('click', rest));
  clear.addEventListener('click', () => {
    if (!admitted()) return;
    reset(crisis.hidden ? initial : crisisText);
    skip.focus();
  });
  $('resetChat')?.addEventListener('click', () => { reset(); panel.hidden = true; });
  const observer = new MutationObserver(syncGate);
  observer.observe(gate, {attributes:true, attributeFilter:['hidden']});
  observer.observe(crisis, {attributes:true, attributeFilter:['hidden']});
  agree.addEventListener('change', syncGate);
  reset(); syncGate();
})();
