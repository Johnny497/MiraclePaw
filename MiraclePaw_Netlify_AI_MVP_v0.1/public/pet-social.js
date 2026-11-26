// Fictional pet-to-pet encounter. No actual people, invitations, storage or network.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const panel = $('petSocial'), openButton = $('petHello'), message = $('petHelloMessage');
  const choices = $('petSocialChoices'), info = $('petSocialInfo'), leave = $('petSocialLeave');
  const boundary = $('petSocialBoundary'), gate = $('gate'), agree = $('agree'), crisis = $('crisisNotice');
  if (![panel, openButton, message, choices, info, leave, boundary, gate, agree, crisis].every(Boolean)) return;
  const buttons = [...choices.querySelectorAll('[data-social-reply]')];
  const replies = Object.freeze({
    wave: '爪爪：Hi 豆豆！👋　豆豆：見到你真好，唔使再做任何嘢。',
    quiet: '爪爪同豆豆靜靜望住雲。唔講嘢、唔繼續都可以。',
  });
  let active = false, replied = false;
  const admitted = () => gate.hidden && agree.checked;
  const available = () => admitted() && crisis.hidden;
  function close(text = '') {
    active = false; replied = false;
    choices.hidden = true; info.hidden = true; boundary.hidden = true;
    message.textContent = text; message.hidden = !text;
    openButton.hidden = false;
    openButton.disabled = !available();
  }
  function sync() {
    panel.hidden = !admitted();
    if (panel.hidden) close();
    else if (!crisis.hidden) close('而家唔需要任何社交互動，可以休息。爪爪仍然喺度。');
    else {
      openButton.disabled = false;
      if (!active) close();
    }
  }
  function open() {
    if (!available() || active) return;
    active = true; replied = false;
    message.textContent = '🐱 豆豆（虛構寵物）：Hi 爪爪！今日見到一朵好靚嘅雲 ☁️。';
    message.hidden = false; choices.hidden = false; openButton.hidden = true;
    info.hidden = true; boundary.hidden = true;
    buttons[0]?.focus();
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    if (!available() || !active || !Object.hasOwn(replies, button.dataset.socialReply)) return;
    replied = true; message.textContent = replies[button.dataset.socialReply];
    info.hidden = false; boundary.hidden = true;
  }));
  info.addEventListener('click', () => {
    if (!available() || !active || !replied) return;
    boundary.hidden = false;
  });
  leave.addEventListener('click', () => {
    if (!available() || !active) return;
    close('唔跟進完全可以，爪爪一樣陪住你。');
    openButton.focus();
  });
  $('resetChat')?.addEventListener('click', () => { close(); panel.hidden = true; });
  const observer = new MutationObserver(sync);
  observer.observe(gate, {attributes:true, attributeFilter:['hidden']});
  observer.observe(crisis, {attributes:true, attributeFilter:['hidden']});
  agree.addEventListener('change', sync);
  // Existing app.js click handler delegates here, keeping a single entry point.
  window.MiraclePawPetSocial = Object.freeze({open});
  sync();
})();
