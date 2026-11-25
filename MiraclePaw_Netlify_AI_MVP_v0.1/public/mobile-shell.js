// Phase 5D: progressively enhance the existing adult demo without duplicating state.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const shell = document.querySelector('.app-shell');
  const header = document.querySelector('.site-header');
  const story = document.querySelector('.story-panel');
  const chat = document.querySelector('.chat-panel');
  const gate = $('gate'), agree = $('agree'), input = $('userInput'), reset = $('resetChat');
  const crisis = $('crisisNotice'), fallback = $('aiFallback');
  const tour = document.querySelector('.tour-panel'), next = $('tourNext'), stop = $('tourStop'), start = $('tourStart');
  const homeNodes = ['.eyebrow', 'h1', '.story-intro', '.pet-stage', '.pet-action-status', '.cat-moods', '.pet-care-note'].map(s => story?.querySelector(s));
  const links = story ? [...story.querySelectorAll('.offline-demo-link')] : [];
  const footnote = story?.querySelector('.footnote');
  const companion = $('localCompanion'), mood = $('moodCheckin'), journey = $('littleSteps'), social = $('petSocial');
  if (![shell, header, story, chat, gate, agree, input, reset, crisis, fallback, tour, next, stop, start, ...homeNodes, footnote, companion, mood, journey, social].every(Boolean) || !links.length) return;
  const make = (tag, className, text = '') => {
    const el = document.createElement(tag);
    el.className = className;
    if (text) el.textContent = text;
    return el;
  };
  const button = (text, className) => {
    const el = make('button', className, text); el.type = 'button'; return el;
  };
  const views = Object.create(null), navButtons = Object.create(null);
  const names = Object.freeze({home:'爪爪',chat:'陪伴',mood:'心情',journey:'小步',social:'見面',info:'關於星爪'});
  const admitted = () => gate.hidden && agree.checked;
  let current = 'home', wasAdmitted = false, wasCrisis = false;
  function view(key, ...nodes) {
    const el = make('section', 'shell-view');
    el.dataset.shellView = key; el.tabIndex = -1;
    el.setAttribute('aria-label', names[key]);
    el.append(...nodes); views[key] = el; story.append(el);
    return el;
  }
  const safety = make('div', 'shell-safety');
  crisis.tabIndex = -1; crisis.setAttribute('role', 'status');
  safety.append(crisis, fallback); header.after(safety);
  const legacy = make('details', 'shell-legacy-chat');
  const summary = make('summary', '', '本次對話／團隊 AI 試玩（另行授權）');
  legacy.append(summary, chat);
  view('home', ...homeNodes);
  view('chat', companion, legacy);
  view('mood', mood);
  view('journey', journey);
  view('social', social);
  view('info', make('h2', 'shell-heading', '關於星爪 · 內部展示資料'), ...links, footnote);
  const controls = make('div', 'shell-header-actions');
  const info = button('關於星爪', 'shell-header-button');
  const restart = button('清除重開', 'shell-header-button');
  reset.setAttribute('aria-label', '清除本次試玩並重新開始');
  reset.title = '清除本次試玩並重新開始';
  const help = make('a', 'shell-header-button', '支援資訊'); help.href = '/demo.html?scene=safety';
  controls.append(info, help, restart); header.append(controls);
  const nav = make('nav', 'shell-nav'); nav.setAttribute('aria-label', '星爪主要功能');
  for (const [key, symbol] of [['home','🐾'],['chat','💬'],['mood','♡'],['journey','🌿'],['social','🐱']]) {
    const b = button('', 'shell-nav-button'); b.dataset.shellNav = key;
    const icon = make('span', 'shell-nav-icon', symbol); icon.setAttribute('aria-hidden','true');
    b.append(icon, make('span', 'shell-nav-label', names[key]));
    b.addEventListener('click', () => show(key, true));
    navButtons[key] = b; nav.append(b);
  }
  shell.append(nav);
  function render() {
    for (const [key, panel] of Object.entries(views)) panel.hidden = key !== current;
    for (const [key, b] of Object.entries(navButtons)) {
      if (key === current) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    }
    if (current === 'info') info.setAttribute('aria-current','page'); else info.removeAttribute('aria-current');
    // Tour controls remain reachable during the optional tour, but never cover crisis support.
    tour.hidden = !crisis.hidden || (next.hidden && current !== 'info');
    tour.classList.toggle('shell-tour-active', !next.hidden && crisis.hidden);
    safety.hidden = crisis.hidden && fallback.hidden;
  }
  function show(key, focus = false) {
    if (!admitted() || !Object.hasOwn(views, key)) return;
    current = key; render();
    if (focus) {
      views[key].focus({preventScroll:true});
      window.scrollTo({top:0,behavior:'auto'});
    }
  }
  const targets = Object.freeze({petTouch:'home', moodCheckin:'mood', littleSteps:'journey', petHello:'social', tourStart:'info'});
  window.MiraclePawShell = Object.freeze({showForTarget(id) { if (crisis.hidden && Object.hasOwn(targets,id)) show(targets[id]); }});
  info.addEventListener('click', () => show('info', true));
  restart.addEventListener('click', () => { if (admitted() && window.confirm('清除本次對話、心情同虛構選擇，再重新開始？')) reset.click(); });
  function sync() {
    const allowed = admitted(), activeCrisis = !crisis.hidden;
    shell.inert = !allowed;
    if (!allowed) {
      if (!next.hidden) stop.click();
      current = 'home'; legacy.open = false;
    } else if (!wasAdmitted) {
      // Existing gate decides local/AI mode; layout never enables input or sends anything.
      current = input.disabled ? 'home' : 'chat'; legacy.open = !input.disabled;
    }
    start.disabled = activeCrisis;
    if (activeCrisis && !next.hidden) stop.click();
    render();
    if (allowed && !wasAdmitted) {
      if (current === 'chat' && !input.disabled) input.focus(); else views[current].focus();
    }
    if (allowed && activeCrisis && !wasCrisis) crisis.focus();
    wasAdmitted = allowed; wasCrisis = activeCrisis;
  }
  const observer = new MutationObserver(sync);
  for (const el of [gate, crisis, fallback, next]) observer.observe(el, {attributes:true,attributeFilter:['hidden']});
  agree.addEventListener('change', sync);
  shell.dataset.shellReady = 'true';
  sync();
})();
