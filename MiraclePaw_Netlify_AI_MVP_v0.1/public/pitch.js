// MiraclePaw v0.9 — static adult-stakeholder pitch rehearsal.
// Does not send, collect, persist or transmit user data; no AI API calls.
import { PITCH_ROUTES, PILOT_STAGES, PROPOSED_MEASURES, FALLBACK_STEPS, TOTAL_SECONDS } from './pitch-data.js';

const $ = (id) => document.getElementById(id);
const requiredIds = [
  'pitchGate','pitchAdult','enterPitch','pitchMain','pitchHKSEC','pitchNGO',
  'timerDisplay','startTimer','pauseTimer','resetTimer','pitchEyebrow',
  'pitchStepTitle','pitchCount','durationCue','pitchProgress','pitchProgressFill',
  'pitchStepButtons','pitchHeadline','pitchScript','pitchEvidence','pitchDemoLink',
  'previousPitch','restartPitch','nextPitch','pitchStatus','pilotStages',
  'proposedMeasures','fallbackSteps','printPitch'
];
for (const id of requiredIds) {
  if (!$(id)) throw new Error('Missing pitch element: ' + id);
}

const state = {
  audience: 'hksec',
  index: 0,
  elapsedMs: 0,
  startedAt: 0,
  intervalId: null,
  running: false,
  lastCue: '',
};
const MAX_MS = TOTAL_SECONDS * 1000;
const pad = (n) => String(n).padStart(2, '0');
const currentRoute = () => PITCH_ROUTES[state.audience];
const currentStep = () => currentRoute().steps[state.index];

function elapsedNow() {
  const milliseconds = state.elapsedMs + (state.running ? Date.now() - state.startedAt : 0);
  return Math.min(MAX_MS, Math.max(0, milliseconds));
}

function formatSeconds(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return pad(Math.floor(seconds / 60)) + ':' + pad(seconds % 60);
}

function updateClock() {
  const elapsed = elapsedNow();
  $('timerDisplay').textContent = formatSeconds(elapsed) + ' / ' + formatSeconds(MAX_MS);
  $('startTimer').disabled = state.running || elapsed >= MAX_MS;
  $('pauseTimer').disabled = !state.running;

  if (elapsed >= MAX_MS && state.running) {
    state.elapsedMs = MAX_MS;
    state.running = false;
    clearInterval(state.intervalId);
    state.intervalId = null;
    $('pitchStatus').textContent = '3 分鐘已到。你可以自由講完本段，或者重設再排練；唔會自動跳段。';
    return;
  }

  if (state.running) {
    const suggestedEnd = currentRoute().steps.slice(0, state.index + 1)
      .reduce((seconds, step) => seconds + step.duration, 0) * 1000;
    const cue = state.audience + '-' + state.index;
    if (elapsed >= suggestedEnd && state.lastCue !== cue) {
      state.lastCue = cue;
      $('pitchStatus').textContent = '呢段已超過建議時間；如果準備好，可以自行按「下一段」。';
    }
  }
}

function pauseTimer(message) {
  if (!state.running) return;
  state.elapsedMs = elapsedNow();
  state.running = false;
  clearInterval(state.intervalId);
  state.intervalId = null;
  updateClock();
  $('pitchStatus').textContent = message || '計時已暫停；你可以繼續講解，或者按「開始計時」。';
}

function resetTimer(message) {
  if (state.intervalId !== null) clearInterval(state.intervalId);
  state.intervalId = null;
  state.running = false;
  state.elapsedMs = 0;
  state.startedAt = 0;
  state.lastCue = '';
  updateClock();
  if (message) $('pitchStatus').textContent = message;
}

function startTimer() {
  if (state.running || elapsedNow() >= MAX_MS) return;
  state.startedAt = Date.now();
  state.running = true;
  $('pitchStatus').textContent = '排練計時中。投影片由你自行切換，所有講解都係示範內容。';
  updateClock();
  state.intervalId = setInterval(updateClock, 250);
}

function make(tag, className, value) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (value !== undefined) item.textContent = value;
  return item;
}

function renderPlanning() {
  const pilots = $('pilotStages');
  pilots.replaceChildren();
  for (const stage of PILOT_STAGES) {
    const card = make('article', 'pilot-card');
    card.append(
      make('span', 'phase', stage.label),
      make('h3', '', stage.title),
      make('span', 'state', stage.state),
      make('p', '', stage.detail),
      make('p', 'gate-line', stage.gate)
    );
    pilots.appendChild(card);
  }

  const measures = $('proposedMeasures');
  measures.replaceChildren();
  for (const measure of PROPOSED_MEASURES) {
    const card = make('article', 'measure-card');
    card.append(
      make('span', 'phase', measure.category + ' · 尚未收集數據'),
      make('h3', '', measure.title),
      make('p', '', measure.method),
      make('p', 'caveat', '界線：' + measure.caveat)
    );
    measures.appendChild(card);
  }

  const fallbacks = $('fallbackSteps');
  fallbacks.replaceChildren();
  for (const fallback of FALLBACK_STEPS) {
    const card = make('article', 'fallback-item');
    const text = make('div');
    text.append(make('p', '', fallback.instruction), make('small', '', fallback.warning));
    card.append(make('h3', '', fallback.title), text);
    fallbacks.appendChild(card);
  }
}

function renderPitch() {
  const route = currentRoute();
  const step = currentStep();
  $('pitchEyebrow').textContent = step.eyebrow;
  $('pitchStepTitle').textContent = step.title;
  $('pitchCount').textContent = pad(state.index + 1) + ' / ' + pad(route.steps.length);
  $('durationCue').textContent = '建議 ' + step.duration + ' 秒';
  $('pitchProgress').setAttribute('aria-valuenow', String(state.index + 1));
  $('pitchProgressFill').style.width = (100 * (state.index + 1) / route.steps.length) + '%';
  $('pitchHeadline').textContent = step.headline;
  $('pitchScript').textContent = step.script;
  $('pitchEvidence').textContent = step.evidence;
  // Only authored, trusted static scene IDs are used for the deep link.
  $('pitchDemoLink').href = '/demo.html?scene=' + encodeURIComponent(step.scene);
  $('pitchDemoLink').textContent = step.demoLabel + ' ↗';
  for (const button of document.querySelectorAll('[data-pitch-audience]')) {
    button.setAttribute('aria-pressed', String(button.dataset.pitchAudience === state.audience));
  }

  const chips = $('pitchStepButtons');
  chips.replaceChildren();
  route.steps.forEach((item, index) => {
    const chip = make('button', 'pitch-step', String(index + 1) + ' · ' + item.title);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(index === state.index));
    if (index === state.index) chip.setAttribute('aria-current', 'step');
    chip.addEventListener('click', () => showStep(index));
    chips.appendChild(chip);
  });
  $('previousPitch').disabled = state.index === 0;
  $('nextPitch').disabled = state.index === route.steps.length - 1;
  $('nextPitch').textContent = state.index === route.steps.length - 1 ? '最後一段 ✓' : '下一段 →';
}

function showStep(index) {
  if (!Number.isInteger(index) || index < 0 || index >= currentRoute().steps.length) return;
  state.index = index;
  renderPitch();
  $('pitchStepTitle').focus();
}

function chooseAudience(audience) {
  if (!Object.hasOwn(PITCH_ROUTES, audience)) return;
  if (audience !== state.audience) {
    state.audience = audience;
    state.index = 0;
    resetTimer('已切換簡報對象，計時重設為 00:00。');
  }
  renderPitch();
  $('pitchStepTitle').focus();
}

for (const button of document.querySelectorAll('[data-pitch-audience]')) {
  button.addEventListener('click', () => chooseAudience(button.dataset.pitchAudience));
}
$('previousPitch').addEventListener('click', () => showStep(state.index - 1));
$('nextPitch').addEventListener('click', () => showStep(state.index + 1));
$('restartPitch').addEventListener('click', () => {
  state.index = 0;
  resetTimer('已由第一段重新開始；你可以選擇是否計時。');
  renderPitch();
  $('pitchStepTitle').focus();
});
$('startTimer').addEventListener('click', startTimer);
$('pauseTimer').addEventListener('click', () => pauseTimer());
$('resetTimer').addEventListener('click', () => resetTimer('計時已重設；冇記錄任何排練數據。'));
$('printPitch').addEventListener('click', () => window.print());

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseTimer('分頁轉到背景，已自動暫停計時；返回後可自行繼續。');
});
window.addEventListener('pagehide', () => pauseTimer('頁面離開，計時已暫停。'));

$('pitchAdult').addEventListener('change', () => {
  $('enterPitch').disabled = !$('pitchAdult').checked;
});
$('enterPitch').addEventListener('click', () => {
  if (!$('pitchAdult').checked) return;
  $('pitchGate').hidden = true;
  $('pitchMain').hidden = false;
  renderPlanning();
  renderPitch();
  updateClock();
  $('pitchStepTitle').focus();
});
