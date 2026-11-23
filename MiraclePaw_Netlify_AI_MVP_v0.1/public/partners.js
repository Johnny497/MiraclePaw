// MiraclePaw v1.1 — static NGO partnership toolkit.
// No outreach is sent or tracked. No personal data, messages, form responses,
// checklist states, NGO names or browser data are stored or transmitted.
// Clipboard action is optional, explicit and only copies authored template text.
import {
  PARTNERSHIP_STATUS, OUTREACH_TEMPLATES, ONE_PAGER,
  PRE_OUTREACH_CHECKS, PARTNER_FIT, MEETING_AGENDA,
  RESPONSIBILITIES, DISCUSSION_TERMS, NEXT_STEPS
} from './partners-data.js';

const $ = (id) => document.getElementById(id);
const requiredIds = [
  'partnersMain','partnersGate','partnersAdult','enterPartners','partnerStatus',
  'draftLanguage','draftType','draftSubject','draftBody','copyDraft',
  'selectDraft','draftStatus','outreachChecks','outreachCount','resetOutreach',
  'briefEyebrow','briefCardTitle','briefSummary','briefContent','briefFooter',
  'printBrief','fitQuestions','partnerAgenda','responsibilityList','termList','nextSteps'
];
for (const id of requiredIds) {
  if (!$(id)) throw new Error('Missing v1.1 element: ' + id);
}
const checked = new Set();

function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function detail(label, text, className = 'partner-detail') {
  const p = node('p', className);
  p.append(node('strong', '', label + '：'), document.createTextNode(text));
  return p;
}

function currentLanguage() {
  const raw = $('draftLanguage').value;
  return Object.hasOwn(OUTREACH_TEMPLATES, raw) ? raw : 'zh';
}

function renderDraft() {
  const lang = currentLanguage();
  const templates = OUTREACH_TEMPLATES[lang];
  const type = Object.hasOwn(templates, $('draftType').value) ? $('draftType').value : 'initial';
  const draft = templates[type];
  $('draftSubject').value = draft.subject;
  $('draftBody').value = draft.body;
  $('draftStatus').textContent = '只顯示「' + draft.label + '」草稿。網站未寄出任何電郵或收集聯絡人資料。';
}

function renderBrief() {
  const brief = ONE_PAGER[currentLanguage()];
  $('briefEyebrow').textContent = brief.eyebrow;
  $('briefCardTitle').textContent = brief.title;
  $('briefSummary').textContent = brief.summary;
  $('briefFooter').textContent = brief.footer;
  const labels = currentLanguage() === 'en' ? [
    ['What exists today', 'built'],
    ['Core principles', 'values'],
    ['Safety boundary', 'safety'],
    ['Privacy and real data flows', 'privacy'],
    ['Our invitation', 'ask'],
    ['What has not been approved', 'exclusions'],
  ] : [
    ['現有原型', 'built'],
    ['不變嘅設計原則', 'values'],
    ['安全界線', 'safety'],
    ['私隱及實際資料流', 'privacy'],
    ['今次合作邀請', 'ask'],
    ['未完成／不可宣稱事項', 'exclusions'],
  ];
  const content = $('briefContent');
  content.replaceChildren();
  for (const [label, key] of labels) {
    const section = node('section', 'brief-cell');
    section.append(node('h4', '', label), node('p', '', brief[key]));
    content.appendChild(section);
  }
}

function renderChecklist() {
  const list = $('outreachChecks');
  list.replaceChildren();
  for (const item of PRE_OUTREACH_CHECKS) {
    const label = node('label', 'outreach-check');
    const checkbox = node('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked.has(item.id);
    checkbox.setAttribute('aria-label', '僅表示已檢視，不等於批准或寄出：' + item.title);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) checked.add(item.id);
      else checked.delete(item.id);
      renderCount();
    });
    const copy = node('span', 'check-copy');
    copy.append(node('strong', '', item.title), node('small', '', item.detail));
    label.append(checkbox, copy);
    list.appendChild(label);
  }
  renderCount();
}

function renderCount() {
  $('outreachCount').textContent = '已檢視 ' + checked.size + '／' + PRE_OUTREACH_CHECKS.length + ' · 未寄出 · 非審批';
}

function renderFit() {
  $('fitQuestions').replaceChildren(...PARTNER_FIT.map((item, index) => {
    const card = node('article', 'fit-card');
    card.append(
      node('span', 'fit-number', String(index + 1).padStart(2, '0')),
      node('h3', '', item.question),
      node('p', '', item.note)
    );
    return card;
  }));
}

function renderAgenda() {
  $('partnerAgenda').replaceChildren(...MEETING_AGENDA.map(item => {
    const entry = node('article', 'agenda-item');
    const copy = node('div');
    copy.append(node('h3', '', item.title), node('p', '', item.detail));
    entry.append(node('span', 'agenda-time', item.slot + ' 分鐘'), copy);
    return entry;
  }));
}

function renderResponsibilities() {
  $('responsibilityList').replaceChildren(...RESPONSIBILITIES.map(item => {
    const entry = node('article', 'role-card');
    entry.append(
      node('h3', '', item.area),
      detail('星爪團隊', item.team),
      detail('NGO（未確認）', item.ngo),
      detail('專業審查', item.specialist),
      detail('狀態／停止界線', item.gate, 'boundary')
    );
    return entry;
  }));
  $('termList').replaceChildren(...DISCUSSION_TERMS.map(item => {
    const card = node('article', 'term-card');
    card.append(
      node('h4', '', item.title),
      node('p', '', item.proposal),
      detail('不可當成已有承諾', item.boundary, 'boundary')
    );
    return card;
  }));
}

function renderNextSteps() {
  $('nextSteps').replaceChildren(...NEXT_STEPS.map(item => node('li', '', item)));
}

function showManualCopyHelp() {
  $('draftBody').focus();
  $('draftBody').select();
  $('draftStatus').textContent = '已選取正文；可用 Cmd/Ctrl+C 手動複製。主旨請從上面欄位另行複製。未寄出任何電郵。';
}

async function copyCurrentDraft() {
  const content = '主旨 / Subject: ' + $('draftSubject').value + '\n\n' + $('draftBody').value;
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    showManualCopyHelp();
    return;
  }
  try {
    await navigator.clipboard.writeText(content);
    $('draftStatus').textContent = '已複製草稿至剪貼簿，並非已發送。請到自己嘅電郵中核實收件人、修改括號內容及事實後再決定是否寄出。';
  } catch {
    showManualCopyHelp();
  }
}

$('draftLanguage').addEventListener('change', () => {
  renderDraft();
  renderBrief();
});
$('draftType').addEventListener('change', renderDraft);
$('copyDraft').addEventListener('click', copyCurrentDraft);
$('selectDraft').addEventListener('click', showManualCopyHelp);
$('resetOutreach').addEventListener('click', () => {
  checked.clear();
  renderChecklist();
});
$('printBrief').addEventListener('click', () => window.print());

$('partnersAdult').addEventListener('change', () => {
  $('enterPartners').disabled = !$('partnersAdult').checked;
});
$('enterPartners').addEventListener('click', () => {
  if (!$('partnersAdult').checked) return;
  $('partnersGate').hidden = true;
  $('partnersMain').hidden = false;
  renderDraft();
  renderBrief();
  renderChecklist();
  renderFit();
  renderAgenda();
  renderResponsibilities();
  renderNextSteps();
  $('partnerStatus').focus();
});
