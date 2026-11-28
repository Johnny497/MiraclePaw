// MiraclePaw v1.0 — NGO pilot PREPARATION ONLY.
// Static authored discussion materials for invited adult professionals.
// No real participants, signed approvals, clinical claims, onboarding or data collection.
// "Reviewed" checkboxes in pilot.js are transient meeting aids, NEVER release authorization.

export const PREPARATION_STATUS = Object.freeze({
  product: '現有成年展示原型；尚未證實安全、有效或適合未成年人',
  collaboration: '尚未有確認之 NGO 伙伴、正式合作協議或試點批准',
  research: '尚未開始真人研究、情緒成效評估或真實服務對象試用',
  decision: 'NO-GO：只可用虛構資料做成年專業持份者檢視',
});

export const REVIEW_DOMAINS = Object.freeze([
  {
    id:'scope', category:'適用範圍', title:'定位、對象及可退出',
    owner:'產品負責人＋NGO 專業代表（均待確認）',
    why:'目前係無醫療用途嘅廣東話虛擬寵物成年內部展示，唔係治療、轉介系統或青少年正式服務。',
    discussion:[
      '列明適合／不適合使用嘅情境；禁止把原型當專業心理輔導。',
      '逐個劇本檢查拒絕任務、沉默、無外出仍可永久獲得同等陪伴。',
      '清楚區分模擬寵物互動同不存在嘅真人配對、即時定位。',
    ],
    evidence:'經合作方確認嘅用途／排除範圍、對象定義、可退出流程（目前未備齊）',
    stop:'任何暗示強制外出、依賴施壓或將非醫療功能包裝成療效，須停止擴展。',
  },
  {
    id:'safety', category:'安全與危機', title:'危機偵測、資源及人手承接',
    owner:'具適當資格嘅危機支援專業人士（待委任）',
    why:'現有危機關鍵字與 AI moderation 只係技術防護層，唔係臨床風險評估。',
    discussion:[
      '由專業人士用完全虛構劇本評估自傷／傷人、漏判、過度觸發、粵語歧義。',
      '危機時停止任務但保持陪伴，固定顯示撒瑪利亞會 2389 2222、生命熱線 2382 0000；即時危險提示 999，由當事人自行決定求助，不偷偷通知第三方。',
      '同 NGO 先討論真實支援流程、服務時段、職責、人工接手同事件記錄要求；現時無呢個服務流程。',
    ],
    evidence:'書面危機情境測試、風險評估、專業簽署同事故處理程序（目前未備齊）',
    stop:'發現會鼓勵自傷／傷人、錯誤轉介、延誤緊急支援或暗中通報，即停止任何真人測試。',
  },
  {
    id:'privacy', category:'私隱與資料治理', title:'資料流、知情同意及刪除',
    owner:'私隱／資訊安全責任人、合作 NGO 資料負責人（待委任）',
    why:'心情記錄只喺本頁記憶體；但真 AI 對話會經 Netlify Function 將輸入及部分上下文送往 DeepSeek（只限已啟用嘅私人展示版）。唔可以講成「所有聊天完全唔出裝置」。',
    discussion:[
      '完成實際資料流程圖，逐一核對平台日誌、API 供應商條款、處理地域、存取與保留政策；現時未經獨立審核。',
      '如果日後確實需要資料，先訂目的、最小必要欄位、知情同意、退出／刪除、事故通報、權限與處理合約；未審批前不得收集。',
      '家長未來只可見經同意嘅進度；社工／機構未來只可見經同意嘅情緒指標與外出紀錄；任何第三方都唔可閱覽對話原文。呢啲後台現時完全未實作。',
    ],
    evidence:'資料盤點、私隱評估／PICS 草稿、供應商審查、權限測試及責任分工（目前未備齊）',
    stop:'未核清資料去向、留存、第三方存取或未獲所需同意時，停止任何真人資料處理。',
  },
  {
    id:'ethics', category:'倫理與保障', title:'成年人評估、兒童保障及審批',
    owner:'NGO 倫理／保障負責人＋研究主持（待委任）',
    why:'網頁「我係成年人」勾選並非身份驗證，更唔係倫理審批。未成年人涉及額外風險及保障義務。',
    discussion:[
      '先做獲邀成年專業持份者對虛構資料嘅專家評審，唔招募真實個案、學生或未成年人。',
      '若計劃接觸服務使用者，先由適當機構判斷所需研究倫理、法律、兒童保障及知情同意安排。',
      '定義可自由退出、不因拒絕而損失原有服務、投訴及安全升級路徑。',
    ],
    evidence:'適用審批／豁免嘅正式書面意見、保障安排、同意資料與退出政策（目前未備齊）',
    stop:'未獲核實嘅適用審批及保障措施前，唔可以將成年人展示擴大成真人／未成年試點。',
  },
  {
    id:'evaluation', category:'評估與成效', title:'研究問題、可用性及不良結果',
    owner:'獨立評估或研究方法顧問（待委任）',
    why:'現有 Pitch 指標只係提議，冇真實樣本、基線、對照組或療效數據。',
    discussion:[
      '優先驗證：能否清楚拒絕任務、識別虛構 AI／真人邊界、理解危機提示及私隱選項。',
      '專業評審可記錄待整改缺陷，但唔應用現場點擊量或心情選擇推斷臨床改善。',
      '若日後獲批研究，另行預註冊問題、選樣、風險監察、負面結果及停止標準。',
    ],
    evidence:'書面研究／評估計畫、倫理判斷、完整指標定義及獨立分析安排（目前未備齊）',
    stop:'任何以演示次數、點擊量或表情選擇宣稱減輕孤獨／醫療療效，都須暫停對外聲稱。',
  },
  {
    id:'operations', category:'合作與運作', title:'角色、培訓、資源及回報',
    owner:'MiraclePaw 團隊與合作 NGO 指定代表（待確認）',
    why:'尚未確定合作機構、協議、服務責任、支援資源、事故窗口同版本管理。',
    discussion:[
      '先提出書面合作意向，講清楚邊個負責平台、內容審閱、危機支援、保安與停用決定。',
      '預估社工工作量、培訓、求助升級路線、事件回顧及結束試點責任，避免增加無支援工作。',
      '先定義試點 Go／No-Go 決策權限：產品負責人唔可以單方面代替 NGO／倫理／專業審核。',
    ],
    evidence:'合作意向／權責文件、培訓及事故演練紀錄、部署／停用決策紀錄（目前未備齊）',
    stop:'冇指定負責人、冇危機承接能力、無撤回方案或無資源，必須 No-Go。',
  },
]);

export const RISK_ITEMS = Object.freeze([
  {
    id:'R01', category:'安全', severity:'關鍵（待獨立覆核）',
    name:'危機訊息漏判、錯判或生成不安全內容',
    trigger:'虛構危機測試出現不適當回覆或未顯示香港支援資源。',
    proposedMitigation:'由危機專業人士定義測試矩陣與人工覆核；禁止當作臨床風險分級工具。',
    immediateAction:'暫停任何真人／服務使用者測試；修正後重跑專業驗證。',
    owner:'臨床／危機安全負責人（待委任）',
  },
  {
    id:'R02', category:'保障', severity:'關鍵（待獨立覆核）',
    name:'未成年人士誤用成年展示原型',
    trigger:'成年人勾選被誤認為年齡核實，或被分享至學生試用。',
    proposedMitigation:'明確標示限制、由團隊控制展示；未成年人涉及獨立保障方案及必要審批。',
    immediateAction:'撤回招募與使用渠道，停止未授權試用。',
    owner:'兒童保障及合作機構負責人（待委任）',
  },
  {
    id:'R03', category:'私隱', severity:'關鍵（待獨立覆核）',
    name:'聊天原文或敏感情緒資訊未授權披露',
    trigger:'平台／供應商日誌處理未核清、第三方要求取用原文或錯誤權限。',
    proposedMitigation:'完成資料流審查、最小化及供應商評估；任何第三方均禁止查看對話原文。',
    immediateAction:'停止相關資料流程，按經審批程序處理事件及所需通報。',
    owner:'資訊安全／私隱責任人（待委任）',
  },
  {
    id:'R04', category:'自主權', severity:'高（待獨立覆核）',
    name:'寵物互動令用戶覺得必須出門或完成任務',
    trigger:'文案暗示唔做就會令寵物失望、失去獎勵或陪伴。',
    proposedMitigation:'每個分支設「唔做／休息」，冇飢餓懲罰、扣分、沉默或陪伴撤回。',
    immediateAction:'撤下有壓力嘅文案，同持份者重新審閱。',
    owner:'內容／用戶體驗負責人（待委任）',
  },
  {
    id:'R05', category:'技術', severity:'高（待獨立覆核）',
    name:'AI API、審查服務或網絡中斷',
    trigger:'連線失敗、配額不足或 moderation 出錯。',
    proposedMitigation:'Fail closed；提供固定虛構劇本示範，不用現場真實個案測試。',
    immediateAction:'停止真 AI 示範，說明限制並用安全靜態展示。',
    owner:'技術負責人（待委任）',
  },
  {
    id:'R06', category:'真實性', severity:'高（待獨立覆核）',
    name:'被錯誤宣傳為已獲 NGO 合作、臨床有效或通過審批',
    trigger:'Pitch 或對外簡報出現無來源嘅成果、合作伙伴名稱及療效數字。',
    proposedMitigation:'每項聲稱註明證據類別及負責核實人；未驗證一律標示建議／待審查。',
    immediateAction:'立即更正展示與文件；停止使用未核實宣傳。',
    owner:'產品負責人及對外溝通負責人（待委任）',
  },
  {
    id:'R07', category:'合作', severity:'高（待獨立覆核）',
    name:'社工工作量、事件承接及角色界線不清',
    trigger:'冇事故窗口、應答時段、訓練或退出／停用責任。',
    proposedMitigation:'在書面合作前討論 RACI、支援時段、負面事件上報與停用權。',
    immediateAction:'不啟動試點，直至 NGO 及團隊分工明確。',
    owner:'NGO 試點負責人（待委任）',
  },
  {
    id:'R08', category:'社交', severity:'高（待獨立覆核）',
    name:'自願寵物社交被誤讀為強制真人配對或即時追蹤',
    trigger:'虛構「豆豆」被展示為真人、使用或要求 GPS 即時位置。',
    proposedMitigation:'畫面明示全部寵物交流為模擬；禁止真人即時位置及強制配對。',
    immediateAction:'停止相關功能或誤導展示，回到純虛構劇本。',
    owner:'產品設計與私隱負責人（待委任）',
  },
]);

// All observations below came from code inspection of the v0.9 repository,
// not from independent platform/vendor log, security or retention audits.
export const DATA_FLOW = Object.freeze([
  {
    id:'static', feature:'固定劇本／Pitch／FAQ',
    currently:'純靜態預設資料；頁面本身毋須任何 AI API。',
    destination:'瀏覽器呈現；網站初次載入由 Netlify 提供靜態檔案。',
    knownBoundary:'無真實服務使用者紀錄；平台存取日誌與其他基建資料待審核。',
    futureRequirement:'唔可將虛構劇本解讀為真實個案／AI 成效。',
  },
  {
    id:'mood', feature:'自願心情選擇',
    currently:'最多 10 筆顯示於現有分頁記憶體；清除／刷新可移除。',
    destination:'頁面 JavaScript 記憶體，無應用資料庫／心情 API 上傳。',
    knownBoundary:'未獨立審計完整瀏覽器及平台環境；不能當作正式私隱認證。',
    futureRequirement:'任何日後統計或儲存先取得合適同意，設刪除、用途、權限。',
  },
  {
    id:'chat', feature:'選用真 AI 文字聊天',
    currently:'已設定密碼閘口；用戶訊息及最多 12 條最近對話上下文交到 /api/presentation-chat，再按程式送往 DeepSeek；呢個獨立展示版只作本地危機分流，未接獨立雲端審核。',
    destination:'瀏覽器 → Netlify Function → DeepSeek API；沒有程式內建對話資料庫。',
    knownBoundary:'平台日誌、供應商保留／處理安排及跨境資料流未經獨立核實；唔可以聲稱「聊天永遠不出裝置」。',
    futureRequirement:'完成供應商／平台資料處理審查、PICS 及適用法規／同意流程；NGO、家長、社工均不可閱覽對話原文。',
  },
  {
    id:'walk', feature:'自願室內／外出微行動',
    currently:'現有只係本頁模擬選擇／打卡，冇 GPS 或上傳實際外出資料。',
    destination:'瀏覽器本頁顯示（模擬）；不存在真人配對。',
    knownBoundary:'「外出紀錄」未實作，不能聲稱 NGO 已可查閱或核實真實路線。',
    futureRequirement:'如日後獲批研究需要紀錄，只可在自願同意下採最小必要指標；禁止即時定位。',
  },
  {
    id:'partner', feature:'家長／社工／NGO 權限',
    currently:'未有正式角色登入、後台、報表、用戶身份驗證或合作系統。',
    destination:'無。',
    knownBoundary:'v1.0 只顯示擬議權限，唔係已開發嘅資料存取控制。',
    futureRequirement:'經適用同意／保障審批：家長只可見進度；社工／機構只可見情緒分數及出門紀錄；任何人不得查看對話原文。',
  },
]);

export const PERMISSION_PROPOSAL = Object.freeze([
  { actor:'使用者本人', status:'未實作正式賬戶', allowed:'自願使用及管理自己資料；可退出／刪除須在正式版本落實', forbidden:'不得被逼交出對話原文或作真人即時定位' },
  { actor:'家長（未來設計）', status:'未實作', allowed:'只在適用同意及保障下可見整體進度', forbidden:'不可查看對話原文、即時定位或操控強制社交' },
  { actor:'社工／NGO（未來設計）', status:'未實作', allowed:'只在適用同意下可見經界定嘅情緒分數及外出紀錄', forbidden:'不可查看對話原文、即時位置或未經授權個案資料' },
  { actor:'產品團隊／系統管理', status:'需另行設計權限控制', allowed:'安全運維嘅必要最小資訊（仍待界定）', forbidden:'不得用後台任意查閱服務使用者對話原文' },
]);

export const PILOT_OPTIONS = Object.freeze([
  {
    id:'review', stage:'Phase A · 當前可討論', title:'成年專業評審工作坊',
    target:'獲邀成年人、NGO／社工／私隱及危機安全專業人士；只看虛構劇本。',
    methods:'使用固定劇本及 v1.0 檢查表，收集專業問題與設計建議；如要記名或留紀錄，需先有另行批准嘅處理方法。',
    measure:'能否指出拒絕任務選項、識別 AI 界線、理解危機資源、發現需修正嘅風險。',
    boundary:'唔接觸真實服務使用者；不可推斷健康成效。',
  },
  {
    id:'codesign', stage:'Phase B · 待合作方決定', title:'共同設計安全及倫理文件',
    target:'獲授權 NGO／研究／私隱／保障人員。',
    methods:'草擬用途與排除準則、資料流程、知情同意、退出與投訴、事故升級、角色權限及停止準則。',
    measure:'文件是否已經相關專業單位簽署核准，而唔係單憑網頁勾選。',
    boundary:'未完成正式審查、合約及安全驗證前不得真人試點。',
  },
  {
    id:'study', stage:'Phase C · 僅可能方向', title:'有條件、另行獲批嘅研究',
    target:'由適用倫理／保障程序決定是否合適及可以接觸邊類人。',
    methods:'研究設計、基線、退出、負面事件監測、資料最小化及必要嘅人工承接，全部另行提交審批。',
    measure:'預先定義可用性／安全及研究結果分析；唔以一次試玩聲稱治療作用。',
    boundary:'本網站冇招募、登記、問卷、個人評估或臨床服務功能。',
  },
]);

export const WORKSHOP_AGENDA = Object.freeze([
  { minute:'00–05', title:'目的與限制', detail:'確認只供成年人用虛構資料做專業審閱，唔代表同意啟動試點。' },
  { minute:'05–15', title:'固定劇本及自主權', detail:'試拒絕任務、不外出、虛構寵物、停止陪伴與否。' },
  { minute:'15–25', title:'危機、弱點與停用條件', detail:'睇危機提示、可能漏判同支援責任；任何問題都記入待整改項目。' },
  { minute:'25–35', title:'資料流、權限與同意', detail:'核對真 AI 會向外部 API 發送文字，並列出保留及供應商待查問題。' },
  { minute:'35–45', title:'決策與下一步', detail:'逐項指定文件責任、後續審查機構及 Go／No-Go；唔喺現場招募。' },
]);

export const LAUNCH_BLOCKERS = Object.freeze([
  '未有合作 NGO 正式書面同意及指定可承接風險嘅負責人。',
  '未有具適當資格人士完成危機安全測試、誤判處理同事故轉介程序。',
  '未完成資料流、供應商／平台留存、私隱告知及適用同意要求審查。',
  '未釐清適用倫理／研究批准、成年人身份及任何未成年人保障要求。',
  '未制定包含撤回、停用、負面事件及事故處理嘅運作方案。',
  '未有可驗證的適用性／安全研究；不得宣稱臨床效益或正式完成試點。',
]);

export const GOVERNANCE_SOURCES = Object.freeze([
  {
    title:'香港個人資料私隱專員公署 — AI 模範個人資料保障框架（2024）',
    url:'https://www.pcpd.org.hk/english/resources_centre/publications/files/ai_protection_framework.pdf',
    note:'供 NGO／私隱負責人審視 AI 資料治理、風險、資料最小化；並非星爪合規認證。',
  },
  {
    title:'香港個人資料私隱專員公署 — 兒童私隱實用指引',
    url:'https://www.pcpd.org.hk/english/resources_centre/publications/files/guidance_children_e.pdf',
    note:'幫助辨識未成年人網上服務風險；唔代表簽署就完成兒童保障審批。',
  },
  {
    title:'香港個人資料私隱專員公署 — 2026 年兒童網上服務私隱審視',
    url:'https://www.pcpd.org.hk/english/news_events/media_statements/press_20260325.html',
    note:'背景參考：兒童最佳利益及 privacy by design；仍須專業審查實際產品。',
  },
]);

export const ADULT_ONLY_NOTICE = '只供獲邀成年持份者以虛構內容審閱；未有 NGO 試點、臨床成效、倫理批准或未成年使用資格。';
