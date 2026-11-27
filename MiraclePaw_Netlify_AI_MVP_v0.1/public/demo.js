// v0.6: standalone fictional story viewer; does not use any AI API, live chat or personal data.
import { DEMO_SCENARIOS } from './demo-data.js';

const $ = (id) => document.getElementById(id);
const requiredIds = [
  'demoGate', 'demoAdultAgree', 'demoStart', 'demoExperience',
  'demoTranscript', 'demoChoices', 'demoSceneTitle', 'demoSceneSummary',
  'sceneIndicator', 'demoStepNote', 'demoPetPrompt', 'crisisResources',
  'restartScene', 'nextScene',
];
for (const id of requiredIds) {
  if (!$(id)) throw new Error('Missing demo element: ' + id);
}

const scenarioById = new Map(DEMO_SCENARIOS.map((scenario) => [scenario.id, scenario]));
const requestedScenarioId = new URLSearchParams(window.location.search).get('scene');
// The query parameter is only a fixed scenario identifier, never personal information.
const initialScenarioId = scenarioById.has(requestedScenarioId)
  ? requestedScenarioId : DEMO_SCENARIOS[0].id;
const navButtons = [...document.querySelectorAll('[data-scenario]')];
const transcript = $('demoTranscript');
const choices = $('demoChoices');
const current = { scenario: null, nodeId: null, segment: 0 };
const personLabels = Object.freeze({
  visitor: '虛構試玩者 · 預設台詞',
  paw: '爪爪 · 預設台詞（非 AI）',
  'other-pet': '豆豆 · 虛構寵物',
});

function appendLine(line) {
  const row = document.createElement('div');
  row.className = 'demo-message';
  row.dataset.from = line.from;

  const label = document.createElement('small');
  label.textContent = personLabels[line.from] || '預設劇本';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = line.text;

  if (line.from === 'visitor') row.append(bubble, label);
  else row.append(label, bubble);
  transcript.appendChild(row);
  transcript.scrollTop = transcript.scrollHeight;
}

function renderSegment(nextNodeId) {
  if (!current.scenario) return;
  const node = current.scenario.nodes[nextNodeId];
  if (!node) return;

  current.nodeId = nextNodeId;
  current.segment += 1;
  for (const line of node.lines) appendLine(line);

  const lastPawLine = [...node.lines].reverse().find((line) => line.from === 'paw');
  $('demoPetPrompt').textContent = current.scenario.crisis
    ? '我仍然喺度陪你 🤍'
    : lastPawLine
      ? (lastPawLine.text.length > 35 ? lastPawLine.text.slice(0, 33) + '…' : lastPawLine.text)
      : '我喺度陪你 🐾';

  choices.replaceChildren();
  for (const option of node.choices) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option.label + ' →';
    button.addEventListener('click', () => {
      renderSegment(option.next);
      // Keyboard users immediately get a stable heading near the updated conversation.
      const nextButton = choices.querySelector('button');
      if (nextButton) nextButton.focus();
      else $('restartScene').focus();
    });
    choices.appendChild(button);
  }
  $('sceneIndicator').textContent = '劇本片段 ' + current.segment + ' · 全部係固定台詞';
  $('demoStepNote').textContent = node.choices.length
    ? '請揀一個預設選項；唔揀都完全可以。冇任務分數。'
    : '呢段劇本到此為止。可以重播，或者試其他情境。';
  transcript.scrollTop = transcript.scrollHeight;
}

function openScenario(id, focusHeading = false) {
  const scenario = scenarioById.get(id);
  if (!scenario) return;
  current.scenario = scenario;
  current.nodeId = null;
  current.segment = 0;
  transcript.replaceChildren();
  choices.replaceChildren();
  $('demoSceneTitle').textContent = scenario.title;
  $('demoSceneSummary').textContent = scenario.summary;
  $('crisisResources').hidden = !Boolean(scenario.crisis);

  navButtons.forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.scenario === id));
  });
  renderSegment(scenario.first);
  if (focusHeading) $('demoSceneTitle').focus();
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => openScenario(button.dataset.scenario, true));
});

$('restartScene').addEventListener('click', () => {
  if (current.scenario) openScenario(current.scenario.id, true);
});

$('nextScene').addEventListener('click', () => {
  const index = current.scenario
    ? DEMO_SCENARIOS.findIndex((s) => s.id === current.scenario.id)
    : -1;
  const next = DEMO_SCENARIOS[(index + 1) % DEMO_SCENARIOS.length];
  openScenario(next.id, true);
});

$('demoAdultAgree').addEventListener('change', () => {
  $('demoStart').disabled = !$('demoAdultAgree').checked;
});

$('demoStart').addEventListener('click', () => {
  if (!$('demoAdultAgree').checked) return;
  $('demoGate').hidden = true;
  $('demoExperience').hidden = false;
  openScenario(initialScenarioId, true);
});
