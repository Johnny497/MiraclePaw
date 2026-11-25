(() => {
  'use strict';
  // Adult-stakeholder fictional demo. No chat, data capture, APIs, storage or scoring.
  const $ = (id) => document.getElementById(id);
  const start = $('tourStart');
  const next = $('tourNext');
  const stop = $('tourStop');
  const status = $('tourStatus');
  if (!start || !next || !stop || !status) return;

  const scenes = Object.freeze([
    {
      target: 'petTouch',
      text: '第一段 · 同爪爪打招呼：可以摸摸頭、抱一抱，或者乜都唔做。寵物互動唔會扣分，唔使連線 AI。',
    },
    {
      target: 'moodCheckin',
      text: '第二段 · 自願分享心情：揀一個感受，或者按「今日唔想記錄」。呢啲資料只留喺本頁，唔會上傳。',
    },
    {
      target: 'littleSteps',
      text: '第三段 · 自願微步：由望窗外到安全日間公共場所，都只係可自由選擇嘅虛構情境。可以留喺室內、返回或者休息，唔需要逐級完成。',
    },
    {
      target: 'petHello',
      text: '第四段 · 虛構寵物打招呼：純模擬豆豆同爪爪互動，冇真人配對、冇定位，亦唔需要跟進。',
    },
  ]);

  let index = -1;

  function focusTarget(id) {
    const target = $(id);
    if (!target) return;
    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
    if (typeof target.focus === 'function') target.focus({ preventScroll: true });
  }

  function show() {
    const scene = scenes[index];
    status.textContent = scene.text;
    next.textContent = index === scenes.length - 1 ? '完成導覽（可略過）' : '下一段（可略過）';
    next.hidden = false;
    stop.hidden = false;
    start.hidden = true;
    focusTarget(scene.target);
  }

  function finish() {
    index = -1;
    status.textContent = '自由導覽已結束。冇分數、冇打卡要求；你想繼續摸摸爪爪或者直接休息，都一樣可以。';
    start.textContent = '重新開始自由導覽';
    start.hidden = false;
    next.hidden = true;
    stop.hidden = true;
    start.focus();
  }

  start.addEventListener('click', () => {
    index = 0;
    show();
  });
  next.addEventListener('click', () => {
    if (index < 0) return;
    if (index === scenes.length - 1) finish();
    else {
      index += 1;
      show();
    }
  });
  stop.addEventListener('click', () => {
    if (index >= 0) finish();
  });
})();