// v0.8: internal adult presenter QA, not a score for product users.
// There is no network, persistence, analytics or personal feedback collection.
import { QA_ITEMS, FAQ_ITEMS, DISCUSSION_PROMPTS } from './review-data.js';

const $ = (id) => document.getElementById(id);
const required = ['reviewGate','reviewAdult','enterReview','reviewMain','reviewItems',
  'checkProgress','resetReview','printReview','faqItems','discussionPrompts'];
for (const id of required) {
  if (!$(id)) throw new Error('Missing review element: ' + id);
}

const checked = new Set();

function renderProgress() {
  $('checkProgress').textContent = '已核對 ' + checked.size + '／' + QA_ITEMS.length + ' 項';
}

function buildChecklist() {
  const container = $('reviewItems');
  container.replaceChildren();
  const groups = [...new Set(QA_ITEMS.map((item) => item.group))];
  for (const groupName of groups) {
    const section = document.createElement('section');
    section.className = 'check-group';
    const heading = document.createElement('h3');
    heading.textContent = groupName;
    section.appendChild(heading);
    for (const item of QA_ITEMS.filter((entry) => entry.group === groupName)) {
      const article = document.createElement('div');
      article.className = 'check-item';

      const choice = document.createElement('label');
      choice.className = 'check-choice';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = checked.has(item.id);
      checkbox.dataset.qaId = item.id;
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) checked.add(item.id);
        else checked.delete(item.id);
        renderProgress();
      });
      const title = document.createElement('strong');
      title.textContent = item.title;
      choice.append(checkbox, title);

      const instructions = document.createElement('p');
      instructions.textContent = item.how;
      const link = document.createElement('a');
      link.href = item.link;
      link.textContent = item.linkLabel + ' ↗';
      article.append(choice, instructions, link);
      section.appendChild(article);
    }
    container.appendChild(section);
  }
  renderProgress();
}

function buildFAQ() {
  const container = $('faqItems');
  container.replaceChildren();
  for (const entry of FAQ_ITEMS) {
    const detail = document.createElement('details');
    detail.className = 'faq-item';
    const summary = document.createElement('summary');
    const tag = document.createElement('span');
    tag.className = 'faq-tag';
    tag.textContent = entry.category;
    const question = document.createElement('strong');
    question.textContent = entry.question;
    summary.append(tag, question);
    const answer = document.createElement('p');
    answer.textContent = entry.answer;
    detail.append(summary, answer);
    container.appendChild(detail);
  }
}

function buildDiscussion() {
  const list = $('discussionPrompts');
  list.replaceChildren();
  for (const prompt of DISCUSSION_PROMPTS) {
    const item = document.createElement('li');
    item.textContent = prompt;
    list.appendChild(item);
  }
}

$('resetReview').addEventListener('click', () => {
  checked.clear();
  buildChecklist();
  $('checkProgress').focus?.();
});

let faqOpenBeforePrint = null;
function expandFAQForPrint() {
  const details = [...$('faqItems').querySelectorAll('details')];
  faqOpenBeforePrint = details.map((element) => element.open);
  details.forEach((element) => { element.open = true; });
}
function restoreFAQAfterPrint() {
  if (!faqOpenBeforePrint) return;
  const details = [...$('faqItems').querySelectorAll('details')];
  details.forEach((element, index) => { element.open = Boolean(faqOpenBeforePrint[index]); });
  faqOpenBeforePrint = null;
}

$('printReview').addEventListener('click', () => {
  // Expand all authored answers before opening the browser's own print dialog.
  expandFAQForPrint();
  window.print();
});
window.addEventListener('afterprint', restoreFAQAfterPrint);

$('reviewAdult').addEventListener('change', () => {
  $('enterReview').disabled = !$('reviewAdult').checked;
});

$('enterReview').addEventListener('click', () => {
  if (!$('reviewAdult').checked) return;
  $('reviewGate').hidden = true;
  $('reviewMain').hidden = false;
  buildChecklist();
  buildFAQ();
  buildDiscussion();
  $('checkProgress').setAttribute('tabindex', '-1');
  $('checkProgress').focus();
});
