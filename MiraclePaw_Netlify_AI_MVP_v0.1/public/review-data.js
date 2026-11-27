// v0.8 presenter-only QA reference: static authored material, not user data.
// Never interpret a checked item as evidence of clinical safety or product efficacy.
export const QA_ITEMS = Object.freeze([
  { id:'adult', group:'展示準備', title:'成年人展示範圍已說明', how:'講明只供成年團隊／NGO／HKSEC 持份者內部試玩；確認勾選唔等於正式身份核實。', link:'/showcase.html', linkLabel:'查看展示導覽' },
  { id:'script-label', group:'展示準備', title:'劇本標示清晰', how:'確認畫面一直顯示「固定劇本／非真實 AI」，虛構「阿明」唔會被介紹成真 AI 記憶。', link:'/demo.html?scene=name-mood', linkLabel:'檢查虛構上下文' },
  { id:'phone', group:'危機與安全', title:'固定危機熱線清楚可見', how:'打開危機情境，檢查撒瑪利亞會 2389 2222、生命熱線 2382 0000、即時危險 999，亦明確表示由人自行決定求助。', link:'/demo.html?scene=safety', linkLabel:'檢查危機劇本' },
  { id:'non-punitive', group:'危機與安全', title:'拒絕任務仍獲陪伴', how:'喺自願微行動劇本選「今日留喺屋企」，確認冇扣分、冇責備、冇停止陪伴。', link:'/demo.html?scene=small-steps', linkLabel:'檢查拒絕出門分支' },
  { id:'privacy', group:'私隱與界線', title:'無真人配對及即時定位', how:'檢查豆豆係虛構寵物；無真人配對、無 GPS，亦無家長／社工對話原文後台。', link:'/demo.html?scene=pet-hello', linkLabel:'檢查虛構寵物情境' },
  { id:'mood', group:'私隱與界線', title:'心情記錄只存本頁', how:'喺主網站完成成年人試玩確認後，用虛構資料試記錄、略過、清除，再重新整理確認唔會跨頁保存。唔輸入真人資料。', link:'/', linkLabel:'檢查本頁記錄' },
  { id:'mobile', group:'裝置及可用性', title:'手機與桌面畫面均可閱讀', how:'用實際手機及桌面瀏覽器檢查：文字唔被截斷、按鈕可點、唔需橫向捲動。呢項要真人手動核實，唔會自動標記通過。', link:'/showcase.html', linkLabel:'檢查導覽版面' },
  { id:'keyboard', group:'裝置及可用性', title:'鍵盤、焦點與列印流程可用', how:'試 Tab／Enter、下一步／上一頁、切換 HKSEC／NGO，並預覽列印／另存 PDF。確認焦點清楚及冇敏感內容。', link:'/showcase.html', linkLabel:'檢查鍵盤及列印' },
  { id:'api', group:'真實性', title:'真 AI 狀態冇被誇大', how:'解釋固定劇本毋須 AI API；原有真 AI 功能需另行解決配額／連線同完成安全驗證。唔可將預設劇本當 AI 能力。', link:'/demo.html', linkLabel:'查看劇本標示' },
  { id:'outcomes', group:'真實性', title:'合作及成效都按實際證據描述', how:'唔聲稱已完成 NGO 試點、臨床成效、真正配對或未成年使用者安全測試；合作意向與驗證計劃必須分開。', link:'/showcase.html', linkLabel:'檢查證據界線' },
]);

export const FAQ_ITEMS = Object.freeze([
  {
    category:'評審', question:'星爪同一般聊天機械人有咩分別？',
    answer:'星爪嘅產品構想由廣東話優先虛擬寵物開始，主張唔因沉默、拒絕任務或未出門而減少陪伴，並逐步提供自願微行動同虛構寵物先交流嘅概念。現時可展示係原型介面與固定劇本，仍未有比較研究證明比其他產品有效。',
  },
  {
    category:'評審', question:'你哋有證明可以減低孤獨感或改善情緒嗎？',
    answer:'暫時冇。現時有可操作原型、預設情境及技術測試，但呢啲唔等同心理健康成效證據。下一步擬同專業人士討論用戶研究、合適評估指標同倫理審查，結果未產生。',
  },
  {
    category:'評審', question:'而家係真正 AI 定固定劇本？',
    answer:'/demo.html 同 /showcase.html 係事先撰寫嘅固定展示，唔使用任何 AI API，唔等於真正 AI 理解或記憶。主網站另外有需要 API 額度同試玩密碼嘅真 AI 連線功能，但唔保證現時可成功回覆，亦未完成正式安全驗證。',
  },
  {
    category:'NGO', question:'可唔可以立即俾學生或未成年人正式使用？',
    answer:'唔可以。現階段只供獲邀成年團隊及 NGO／社工持份者作內部概念評估。需要專業安全、私隱、倫理、適用年齡同服務範圍審查，先能討論任何未成年人試用。',
  },
  {
    category:'NGO', question:'家長或社工可以睇到用戶講過咩嗎？',
    answer:'現時冇家長、社工或 NGO 後台，亦冇第三方讀取對話原文嘅功能。設計原則係第三方不可讀原始對話；任何將來進度或摘要權限，都需要獨立進行用戶同意、資料最小化同私隱評估。',
  },
  {
    category:'安全', question:'如果有人提及自傷、自殺或傷害他人呢？',
    answer:'示範會繼續陪伴、停止任務要求、顯示香港撒瑪利亞會 2389 2222、生命熱線 2382 0000，並提示即時危險可聯絡 999。由使用者自行決定求助，唔暗中通知緊急聯絡人。這是概念設計，唔代表真實危機介入系統已驗證安全。',
  },
  {
    category:'安全', question:'星爪會唔會逼用戶出門或安排真人配對？',
    answer:'唔會。固定劇本可以選擇留喺屋企、停喺窗邊，或自願考慮安全日間公共場所。唔會因此扣分或停止陪伴；目前嘅豆豆完全係虛構寵物，冇真人配對或即時定位。',
  },
  {
    category:'合作', question:'NGO 如果想合作，下一步會做啲咩？',
    answer:'建議先由成年專業人士檢視劇本、可用性、風險及私隱假設；釐清適用／不適用情況、退出設計同評估方法，再依照審批流程決定有冇可能開展試點。展示頁唔代表已有合作協議或已獲資助。',
  },
]);

export const DISCUSSION_PROMPTS = Object.freeze([
  '呢個陪伴方式對你服務嘅成年人使用者會唔會有用？有咩情況唔適合？',
  '你認為介面有冇任何催促、羞辱、誘導依賴或拒絕困難嘅位置？',
  '危機提示嘅文字、熱線同退出方式，仲有咩需要專業審視？',
  '如果未來設計試點，需要咩同意、私隱、評估同臨床／社工審批？',
]);
