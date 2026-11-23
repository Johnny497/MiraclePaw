// MiraclePaw v0.7 guided presentation. Authored content only; no tracking or API.
import { AUDIENCE_ROUTES } from './showcase-data.js';

const $ = (id) => document.getElementById(id);
const ids = [
  'showcaseGate','showcaseAdult','enterShowcase','showcaseGuide',
  'routeHKSEC','routeNGO','audienceTitle','stepCount','guideProgress',
  'progressFill','stepChips','stepEyebrow','stepHeading','stepFocus',
  'openScenario','presenterTalk','presenterEvidence',
  'previousStep','nextStep','restartGuide','printBrief'
];
for (const id of ids) {
  if (!$(id)) throw new Error('Missing showcase element: ' + id);
}

const audienceButtons = [...document.querySelectorAll('[data-audience]')];
const state = { audience: 'hksec', index: 0 };

function currentRoute() {
  return AUDIENCE_ROUTES[state.audience];
}

function render() {
  const route = currentRoute();
  if (!route) return;
  const steps = route.steps;
  const step = steps[state.index];
  if (!step) return;

  $('audienceTitle').textContent = route.label;
  $('stepCount').textContent = `第 ${state.index + 1}／${steps.length} 步`;
  $('guideProgress').setAttribute('aria-valuenow', String(state.index + 1));
  $('progressFill').style.width = `${((state.index + 1) / steps.length) * 100}%`;
  $('stepEyebrow').textContent = step.eyebrow;
  $('stepHeading').textContent = step.heading;
  $('stepFocus').textContent = step.focus;
  $('presenterTalk').textContent = step.presenter;
  $('presenterEvidence').textContent = step.evidence;

  // Only hard-coded, trusted scenario ids are used in the query string.
  $('openScenario').href = '/demo.html?scene=' + encodeURIComponent(step.scenario);
  $('openScenario').textContent = step.cta + ' ↗';

  audienceButtons.forEach((button) =>
    button.setAttribute('aria-pressed', String(button.dataset.audience === state.audience))
  );

  const chips = $('stepChips');
  chips.replaceChildren();
  steps.forEach((item, index) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'step-chip';
    chip.textContent = item.marker + ' · ' + item.heading;
    chip.setAttribute('aria-pressed', String(index === state.index));
    if (index === state.index) chip.setAttribute('aria-current', 'step');
    chip.addEventListener('click', () => {
      state.index = index;
      render();
      $('stepHeading').focus();
    });
    chips.appendChild(chip);
  });
  $('previousStep').disabled = state.index === 0;
  $('nextStep').disabled = state.index === steps.length - 1;
  $('nextStep').textContent = state.index === steps.length - 1 ? '已到最後一步 ✓' : '下一步 →';
}

function selectAudience(id) {
  if (!Object.hasOwn(AUDIENCE_ROUTES, id)) return;
  state.audience = id;
  state.index = 0;
  render();
  $('stepHeading').focus();
}

audienceButtons.forEach((button) => {
  button.addEventListener('click', () => selectAudience(button.dataset.audience));
});

$('previousStep').addEventListener('click', () => {
  if (state.index === 0) return;
  state.index--;
  render();
  $('stepHeading').focus();
});
$('nextStep').addEventListener('click', () => {
  if (state.index >= currentRoute().steps.length - 1) return;
  state.index++;
  render();
  $('stepHeading').focus();
});
$('restartGuide').addEventListener('click', () => {
  state.index = 0;
  render();
  $('stepHeading').focus();
});

$('printBrief').addEventListener('click', () => {
  // Print styles expose all static safety/evidence sections; no external PDF service.
  window.print();
});

$('showcaseAdult').addEventListener('change', () => {
  $('enterShowcase').disabled = !$('showcaseAdult').checked;
});
$('enterShowcase').addEventListener('click', () => {
  if (!$('showcaseAdult').checked) return;
  $('showcaseGate').hidden = true;
  $('showcaseGuide').hidden = false;
  render();
  $('stepHeading').focus();
});
