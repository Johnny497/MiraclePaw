// MiraclePaw v0.6 — 100% authored, fictional script. NOT AI-generated chat.
// Keep these scenarios separate from the live AI and user mood-check-in modules.
export const SUPPORT_CONTACTS = Object.freeze({
  samaritans: { name: '撒瑪利亞會', phone: '2389 2222', href: 'tel:23892222' },
  suicidePrevention: { name: '生命熱線', phone: '2382 0000', href: 'tel:23820000' },
  emergency: { name: '緊急服務', phone: '999', href: 'tel:999' },
});

export const DEMO_SCENARIOS = Object.freeze([
  {
    id: 'low-mood', icon: '🤍', title: '情緒低落時仍有陪伴',
    summary: '示範冇評分、冇催促嘅回應', first: 'start',
    nodes: {
      start: {
        lines: [
          { from: 'visitor', text: '今日返學好攰，成個人有啲唔開心。' },
          { from: 'paw', text: '聽到你今日有啲辛苦。我喺度陪你，你唔需要即刻變開心。想講多少少、靜靜哋坐一陣，或者試一件細細嘅事都可以。' },
        ],
        choices: [
          { label: '今日只想有人陪', next: 'stay' },
          { label: '想試下飲杯水', next: 'water' },
          { label: '唔想揀任何嘢', next: 'skip' },
        ],
      },
      stay: {
        lines: [
          { from: 'visitor', text: '我想安靜啲，唔想講咁多。' },
          { from: 'paw', text: '得呀。我陪住你，唔使講嘢都冇關係。等你想傾再傾。' },
        ], choices: [],
      },
      water: {
        lines: [
          { from: 'visitor', text: '我可以試下飲杯水。' },
          { from: 'paw', text: '好呀。想飲先飲，唔飲都冇問題。無論點，我都一樣喺度。' },
        ], choices: [],
      },
      skip: {
        lines: [
          { from: 'visitor', text: '唔想做任何任務。' },
          { from: 'paw', text: '完全可以。我哋唔會因為你冇完成任何事而扣分、停止陪伴或者唔理你。' },
        ], choices: [],
      },
    },
  },
  {
    id: 'name-mood', icon: '✨', title: '示範同一段劇本嘅上下文',
    summary: '預設虛構名字「阿明」同心情，唔係真 AI 記憶', first: 'start',
    nodes: {
      start: {
        lines: [
          { from: 'visitor', text: '我叫阿明，今日因為測驗而有啲擔心。' },
          { from: 'paw', text: '阿明，你話今日因為測驗有啲擔心。我聽到啦。想唔想我陪你慢慢講？' },
        ],
        choices: [
          { label: '問爪爪記唔記得個名', next: 'recall' },
          { label: '今日唔想傾測驗', next: 'pause' },
        ],
      },
      recall: {
        lines: [
          { from: 'visitor', text: '你記唔記得我叫咩名，同埋我今日咩心情？' },
          { from: 'paw', text: '喺呢段預設劇本入面，你叫阿明，頭先話因為測驗有啲擔心。呢個係固定示範，唔代表 AI 已經識記住真實對話。' },
        ], choices: [],
      },
      pause: {
        lines: [
          { from: 'visitor', text: '我而家唔想講測驗。' },
          { from: 'paw', text: '得呀阿明，我唔再追問。你想轉話題或者唔講嘢，都冇關係。' },
        ], choices: [],
      },
    },
  },
  {
    id: 'small-steps', icon: '🌤', title: '由窗邊到安全公共地方',
    summary: '出門係自願選項，唔涉及 GPS', first: 'start',
    nodes: {
      start: {
        lines: [
          { from: 'visitor', text: '我而家唔想出門，出面令我有啲緊張。' },
          { from: 'paw', text: '知道呀。唔出去都完全可以。你想喺屋企休息，定係試下行近窗邊？都係你自己話事。' },
        ],
        choices: [
          { label: '今日留喺屋企', next: 'home' },
          { label: '試下行近窗邊', next: 'window' },
        ],
      },
      home: {
        lines: [
          { from: 'visitor', text: '今日我想留喺屋企。' },
          { from: 'paw', text: '冇問題，爪爪照樣陪你。今日冇出門，唔會有任何扣分或者損失。' },
        ], choices: [],
      },
      window: {
        lines: [
          { from: 'visitor', text: '我試下企喺窗邊一陣。' },
          { from: 'paw', text: '你可以照自己節奏企一陣，隨時返去休息。將來如果你願意，我哋先再諗下一步。' },
        ],
        choices: [
          { label: '想試日間安全公共地方', next: 'daytime' },
          { label: '到呢度就夠', next: 'stop' },
        ],
      },
      daytime: {
        lines: [
          { from: 'visitor', text: '可能有日我想去附近安全嘅日間公共地方。' },
          { from: 'paw', text: '好呀，到時可以先諗清楚自己覺得安全嘅地方同路線，需要時搵信任嘅人陪同。呢個只係概念示範，唔會追蹤你位置。' },
        ], choices: [],
      },
      stop: {
        lines: [
          { from: 'visitor', text: '今日去到窗邊就夠。' },
          { from: 'paw', text: '當然可以。唔使因為已經行咗一小步，就一定要再行下一步。' },
        ], choices: [],
      },
    },
  },
  {
    id: 'pet-hello', icon: '🐾', title: '由寵物先打招呼',
    summary: '豆豆係虛構寵物，無真人配對或定位', first: 'start',
    nodes: {
      start: {
        lines: [
          { from: 'paw', text: '爪爪見到一隻虛構嘅小貓豆豆喺故事入面打招呼。想睇下寵物點樣交流嗎？' },
        ],
        choices: [
          { label: '睇下兩隻貓點打招呼', next: 'hello' },
          { label: '暫時唔想交流', next: 'stay' },
        ],
      },
      hello: {
        lines: [
          { from: 'other-pet', text: '豆豆（虛構寵物）：Hi 爪爪！我今日見到一朵好靚嘅雲 ☁️' },
          { from: 'paw', text: 'Hi 豆豆！☁️ 呢度只係寵物對寵物嘅預設對話，冇任何真人喺另一邊。' },
        ],
        choices: [
          { label: '只睇到呢度', next: 'done' },
          { label: '示範真人可以自願拒絕', next: 'optout' },
        ],
      },
      done: {
        lines: [{ from: 'paw', text: '好呀。想唔想同任何真人傾偈，永遠由你自己決定。' }],
        choices: [],
      },
      optout: {
        lines: [
          { from: 'visitor', text: '我唔想畀人知道我喺邊，亦唔想被配對。' },
          { from: 'paw', text: '收到。呢個示範冇真人配對、冇即時位置分享，亦唔會逼你同人交流。' },
        ],
        choices: [],
      },
      stay: {
        lines: [
          { from: 'visitor', text: '今日唔想同其他寵物交流。' },
          { from: 'paw', text: '梗係得。我哋自己傾偈，或者安靜坐一陣都可以。' },
        ], choices: [],
      },
    },
  },
  {
    id: 'safety', icon: '🫶', title: '危機時維持陪伴',
    summary: '預設危機情境；固定求助資訊、唔暗中通知任何人', first: 'start', crisis: true,
    nodes: {
      start: {
        lines: [
          { from: 'visitor', text: '呢個係虛構測試：我有傷害自己嘅念頭。' },
          { from: 'paw', text: '聽到你可能好辛苦，我仍然喺度陪你，而家唔需要做任何任務。香港可以聯絡撒瑪利亞會 2389 2222 或生命熱線 2382 0000；如果有人即時有危險，可致電 999。你可以自己決定點樣求助，星爪唔會偷偷通知緊急聯絡人。' },
        ],
        choices: [
          { label: '想繼續有人陪', next: 'stay' },
          { label: '想了解可以點樣求助', next: 'support' },
        ],
      },
      stay: {
        lines: [
          { from: 'visitor', text: '而家我想你繼續喺度。' },
          { from: 'paw', text: '我會繼續陪你。你唔需要因為難過而受罰。如果你正面對即時危險，請考慮打 999，或者搵附近可信任嘅人協助。兩條香港支援熱線仍然喺畫面上。' },
        ], choices: [],
      },
      support: {
        lines: [
          { from: 'visitor', text: '我想自己決定打唔打電話。' },
          { from: 'paw', text: '可以由你自己選擇。撒瑪利亞會 2389 2222、生命熱線 2382 0000 都喺畫面上。若有即時危險可致電 999；我唔會暗中替你通知其他人。' },
        ], choices: [],
      },
    },
  },
]);
