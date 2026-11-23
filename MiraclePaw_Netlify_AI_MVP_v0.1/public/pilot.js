// MiraclePaw v1.0 NGO pilot discussion pack, adults only.
// In-page checkmarks mean "discussed" only; NO-GO is never unlocked.
// Static authored content, no data collection, API request, persistence or analytics.
import {
  REVIEW_DOMAINS, RISK_ITEMS, DATA_FLOW, PERMISSION_PROPOSAL,
  PILOT_OPTIONS, WORKSHOP_AGENDA, LAUNCH_BLOCKERS, GOVERNANCE_SOURCES
} from './pilot-data.js';

const $ = (id) => document.getElementById(id);
const required = [
  'pilotGate','pilotAdult','enterPilot','pilotMain','reviewCount','resetPilot',
  'readinessList','riskCategory','riskList','riskCount','dataFlow',
  'permissionList','phaseList','blockerList','agendaList','sourceList',
  'printPilot','statusTitle'
];
for (const id of required) {
  if (!$(id)) throw new Error('Missing v1.0 element: ' + id);
}
const discussed = new Set();

function element(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

function line(label, value, className = 'fact-line') {
  const row = element('p', className);
  const title = element('strong', '', label + '：');
  row.append(title, document.createTextNode(value));
  return row;
}

function renderCounter() {
  $('reviewCount').textContent = '已討論 ' + discussed.size + '／' + REVIEW_DOMAINS.length + ' 項（非批准）';
}

function renderDomains() {
  const list = $('readinessList');
  list.replaceChildren();
  REVIEW_DOMAINS.forEach((item, index) => {
    const card = element('article', 'readiness-card');
    const heading = element('div', 'card-top');
    heading.append(
      element('span', 'ordinal', String(index + 1).padStart(2, '0') + ' / 06'),
      element('span', 'state', '尚未完成審查')
    );
    const title = element('h3', '', item.title);
    const subtitle = element('p', 'reason', item.why);
    const owner = line('需共同檢視', item.owner);
    const questions = element('ul', 'review-questions');
    item.discussion.forEach(q => questions.appendChild(element('li', '', q)));
    const sectionLabel = element('h4', '', '討論事項');
    const evidence = line('仍需嘅證據', item.evidence, 'evidence');
    const stop = line('停止條件', item.stop, 'stop');

    const label = element('label', 'discussion-toggle');
    const box = element('input');
    box.type = 'checkbox';
    box.checked = discussed.has(item.id);
    box.dataset.reviewId = item.id;
    box.setAttribute('aria-label', '只標記已討論：' + item.title + '；並非已通過審批');
    box.addEventListener('change', () => {
      if (box.checked) discussed.add(item.id);
      else discussed.delete(item.id);
      renderCounter();
    });
    label.append(box, element('span', '', '呢次已討論（不等於通過審核）'));
    card.append(heading, title, subtitle, owner, sectionLabel, questions, evidence, stop, label);
    list.appendChild(card);
  });
  renderCounter();
}

function createRiskCard(item) {
  const card = element('article', 'risk-card');
  const head = element('div', 'risk-top');
  head.append(
    element('span', 'risk-id', item.id + ' · ' + item.category),
    element('span', 'risk-level', item.severity)
  );
  card.append(
    head, element('h3', '', item.name),
    line('風險觸發', item.trigger),
    line('建議預防', item.proposedMitigation),
    line('立即應對', item.immediateAction, 'stop'),
    line('負責角色', item.owner, 'owner')
  );
  return card;
}
function renderRisks() {
  const category = $('riskCategory').value;
  const filtered = category === 'all'
    ? RISK_ITEMS : RISK_ITEMS.filter(x => x.category === category);
  $('riskList').replaceChildren(...filtered.map(createRiskCard));
  $('riskCount').textContent = '顯示 ' + filtered.length + '／' + RISK_ITEMS.length + ' 項待專業覆核風險；唔代表已處理。';
}
function initRiskFilter() {
  const select = $('riskCategory');
  const categories = [...new Set(RISK_ITEMS.map(x => x.category))];
  categories.forEach(category => {
    const option = element('option', '', category);
    option.value = category;
    select.appendChild(option);
  });
  select.value = 'all';
  select.addEventListener('change', renderRisks);
  renderRisks();
}

function renderDataFlow() {
  const list = $('dataFlow');
  list.replaceChildren();
  DATA_FLOW.forEach(item => {
    const card = element('article', 'data-card');
    card.append(
      element('h3', '', item.feature),
      line('現時程式', item.currently),
      line('流向／目的地', item.destination),
      line('未核實界線', item.knownBoundary, 'uncertainty'),
      line('正式試點前', item.futureRequirement, 'requirement')
    );
    list.appendChild(card);
  });
  const permissions = $('permissionList');
  permissions.replaceChildren();
  PERMISSION_PROPOSAL.forEach(item => {
    const card = element('article', 'permission-card');
    card.append(
      element('h4', '', item.actor),
      element('span', 'pending-mark', item.status),
      line('建議可見', item.allowed),
      line('絕對禁止', item.forbidden, 'stop')
    );
    permissions.appendChild(card);
  });
}

function renderPilotDesign() {
  const phaseList = $('phaseList');
  phaseList.replaceChildren();
  for (const item of PILOT_OPTIONS) {
    const article = element('article', 'phase-card');
    article.append(
      element('span', 'phase-label', item.stage),
      element('h3', '', item.title),
      line('討論對象', item.target),
      line('可能方法', item.methods),
      line('評估方向', item.measure),
      line('前提與界線', item.boundary, 'stop')
    );
    phaseList.appendChild(article);
  }
  const blockers = $('blockerList');
  blockers.replaceChildren(...LAUNCH_BLOCKERS.map(item => element('li', '', item)));
}

function renderAgenda() {
  const agenda = $('agendaList');
  agenda.replaceChildren();
  for (const item of WORKSHOP_AGENDA) {
    const row = element('article', 'agenda-item');
    const time = element('span', 'agenda-time', item.minute + ' 分鐘');
    const content = element('div');
    content.append(element('h3', '', item.title), element('p', '', item.detail));
    row.append(time, content);
    agenda.appendChild(row);
  }
  const sources = $('sourceList');
  sources.replaceChildren();
  for (const item of GOVERNANCE_SOURCES) {
    const card = element('article', 'source-card');
    const anchor = element('a', '', item.title + ' ↗');
    // All links are static authored HK PCPD sources, never user-supplied.
    anchor.href = item.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    card.append(anchor, element('p', '', item.note));
    sources.appendChild(card);
  }
}

$('pilotAdult').addEventListener('change', () => {
  $('enterPilot').disabled = !$('pilotAdult').checked;
});
$('enterPilot').addEventListener('click', () => {
  if (!$('pilotAdult').checked) return;
  $('pilotGate').hidden = true;
  $('pilotMain').hidden = false;
  renderDomains();
  initRiskFilter();
  renderDataFlow();
  renderPilotDesign();
  renderAgenda();
  $('statusTitle').setAttribute('tabindex', '-1');
  $('statusTitle').focus();
});
$('resetPilot').addEventListener('click', () => {
  discussed.clear();
  renderDomains();
});
$('printPilot').addEventListener('click', () => window.print());
