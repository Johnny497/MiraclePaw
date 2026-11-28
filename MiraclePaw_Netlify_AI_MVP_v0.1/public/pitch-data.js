// MiraclePaw v0.9 — wholly authored, fictional adult-stakeholder presentation data.
// These are proposed speaking notes / pilot measures, not measured outcomes.
// Never add participant names, diagnoses, contacts, individual mood logs or live location.
export const PITCH_ROUTES = Object.freeze({
  hksec: {
    label: 'HKSEC／創業評審',
    audience: '由社會問題、原型、差異化到負責任驗證。',
    steps: [
      {
        id:'need', duration:30, title:'要解決嘅問題', eyebrow:'01 · NEED / HYPOTHESIS',
        headline:'有時最難嘅，唔係社交；係踏出第一步。',
        script:'我哋觀察到一個值得驗證嘅需要：有人情緒低落或者孤單時，未必想即刻向真人求助或被要求出門。星爪希望提供一個廣東話優先、冇批判嘅虛擬寵物起點。呢個係問題假設，唔係已證實嘅研究結論。',
        evidence:'需要及受眾適配仍需訪談與研究；唔可以聲稱已降低孤獨感。',
        scene:'low-mood', demoLabel:'固定劇本：低落仍有陪伴'
      },
      {
        id:'solution', duration:35, title:'我哋嘅產品方向', eyebrow:'02 · SOLUTION',
        headline:'陪伴唔係獎勵，而係一直都喺度。',
        script:'爪爪係一隻廣東話虛擬小貓。人可以摸頭、休息、揀心情，亦可以完全唔講嘢。唔出門唔扣分，冇餓死或者失去陪伴嘅懲罰。現時已做寵物互動、心情選擇同固定劇本，但未證明真 AI 已符合心理安全要求。',
        evidence:'現有介面可親自試；五個劇本係預設文字，唔係即時生成嘅 AI。',
        scene:'small-steps', demoLabel:'固定劇本：拒絕出門都得'
      },
      {
        id:'demo', duration:45, title:'45 秒核心示範', eyebrow:'03 · DEMO',
        headline:'由「唔想出門」到「由我自己揀」。',
        script:'現場我哋會開固定劇本：用戶揀今日留喺屋企，爪爪仍然陪伴；如果想試，可以由窗邊開始，再考慮安全日間公共地方。另一個劇本係虛構寵物豆豆先打招呼，冇真人配對或者 GPS。固定劇本刻意唔依賴 AI API，避免現場連線影響展示。',
        evidence:'此為編排好嘅互動劇本；冇真實其他使用者、真人位置或成效數據。',
        scene:'small-steps', demoLabel:'開始安全劇本（須成年人確認）'
      },
      {
        id:'trust', duration:40, title:'安全與差異化', eyebrow:'04 · SAFETY / TRUST',
        headline:'自願、私隱同危機界線，係設計底線。',
        script:'星爪唔強制真人社交、唔記錄即時位置，第三方唔可以讀聊天原文。危機示範會繼續陪伴，列出香港撒瑪利亞會 2389 2222、生命熱線 2382 0000，亦唔會暗中通知緊急聯絡人。但呢啲係原型設計，未完成專業危機安全驗證。',
        evidence:'已實作部分提示與劇本；家長／社工後台及完整安全審核尚未存在。',
        scene:'safety', demoLabel:'固定劇本：危機支援提示'
      },
      {
        id:'ask', duration:30, title:'今日希望得到嘅支持', eyebrow:'05 · ASK / VALIDATION',
        headline:'先驗證可行同安全，再談成效。',
        script:'我哋希望爭取 NGO／社工提供成年專業意見，檢查劇本、可用性、私隱同退出設計；再根據專業倫理同審批，決定未來有冇合適嘅小規模研究或試點。暫時冇聲稱已有 NGO 合作、臨床成效或未成年用戶測試。',
        evidence:'合作邀請及評估構想，唔係已獲承諾、資助或審批。',
        scene:'name-mood', demoLabel:'查看虛構上下文'
      }
    ]
  },
  ngo: {
    label: 'NGO／社工合作伙伴',
    audience: '由服務範圍、安全權限到共同設計試點。',
    steps: [
      {
        id:'fit', duration:30, title:'我哋唔打算取代社工', eyebrow:'01 · SERVICE FIT',
        headline:'以非醫療陪伴，回應日常微小需要。',
        script:'星爪定位係廣東話優先嘅虛擬寵物陪伴原型，唔係心理治療、危機服務或社工替代品。我哋想聽前線社工意見：對服務對象而言，邊啲情況可能有幫助，邊啲情況應該完全避免？現階段只供獲邀成年人概念評估。',
        evidence:'用途同目標群體仍待專業評估；唔可直接提供畀未成年人正式使用。',
        scene:'low-mood', demoLabel:'固定劇本：低落而不受催促'
      },
      {
        id:'autonomy', duration:35, title:'使用者保有選擇權', eyebrow:'02 · AUTONOMY',
        headline:'拒絕都係一個被尊重嘅選擇。',
        script:'使用者可以唔分享心情、唔完成任務、唔踏出門口。冇分數、冇威脅、唔會被寵物冷落。由窗邊到日間公共地方都係選項，唔係必須完成嘅路線。我哋想邀請社工檢視文案會唔會仍然造成隱性壓力。',
        evidence:'拒絕選項已有展示劇本；真實使用感受尚未研究。',
        scene:'small-steps', demoLabel:'固定劇本：自主微行動'
      },
      {
        id:'privacy', duration:45, title:'現場示範同資料界線', eyebrow:'03 · DEMO / PRIVACY',
        headline:'今日冇學生資料，亦冇第三方聊天後台。',
        script:'我哋只用虛構劇本操作。現有心情選擇只係本頁暫存，重新整理就會清除，冇家長同 NGO 後台，更冇真人 GPS 或配對。未來如要研究匿名指標，必須先定義收集目的、同意、保存期限同誰有權查看，絕不能開放對話原文。',
        evidence:'原型未建立正式資料治理或獲批研究流程；示範唔需要上傳任何真實資料。',
        scene:'pet-hello', demoLabel:'固定劇本：虛構寵物互動'
      },
      {
        id:'risk', duration:40, title:'安全問題要先問清楚', eyebrow:'04 · SAFEGUARD',
        headline:'危機時繼續陪伴，但唔扮成專業支援。',
        script:'如出現自傷或傷人危機，原型示範會保持陪伴，列出撒瑪利亞會 2389 2222、生命熱線 2382 0000，遇即時危險提示 999。唔會暗中通知第三方。真正使用前，仍然需要危機風險、誤判、轉介、私隱及兒童保障專業審核。',
        evidence:'危機介面只係示範流程；尚未完成真實高風險安全測試。',
        scene:'safety', demoLabel:'固定劇本：支援資源'
      },
      {
        id:'collab', duration:30, title:'建議合作起點', eyebrow:'05 · COLLABORATION',
        headline:'由成年專業評估開始，唔急住招募個案。',
        script:'第一步係邀請 NGO／社工做成年持份者可用性同風險審視。第二步共同訂立是否合適試點、知情同意、退出、危機處理同資料規則。只有獲批准同完成安全審核，先再研究任何服務對象參與。今日唔係要求即場批准上線。',
        evidence:'合作框架係建議，現階段未有合作協議、試點結果或審批。',
        scene:'name-mood', demoLabel:'查看固定劇本樣本'
      }
    ]
  }
});

export const PILOT_STAGES = Object.freeze([
  {
    id:'professional-review', label:'第一關', title:'成年專業持份者檢視',
    state:'建議中 · 未開始',
    detail:'由 NGO／學校社工及安全、私隱專業人士檢視五個虛構劇本、拒絕選項、危機文案、適用及不適用場景。只用虛構資料；唔接觸未成年服務使用者。',
    gate:'須有明確書面問題清單、風險記錄及下一步責任人；冇完成唔升級。'
  },
  {
    id:'co-design', label:'第二關', title:'共同訂立倫理與安全方案',
    state:'建議中 · 未開始',
    detail:'在考慮真實資料前，界定資料最小化、知情同意、退出、保留期、責任分工、危機轉介與事故應對。另行進行適用法律、兒童保障與 AI 安全審查。',
    gate:'需由相關專業／機構審查批准；單憑勾選成年人展示同意並不足夠。'
  },
  {
    id:'conditional-pilot', label:'第三關', title:'有條件的小規模試點研究',
    state:'僅屬可能方向 · 未獲批准',
    detail:'只有在完成前兩關、倫理與安全審批以及研究設計後，才考慮由合適成年人開始，並明定撤回、負面事件停用及資料刪除流程。未成年人參與必須有額外獨立審查。',
    gate:'唔以「使用次數高」代表療效；任何健康效益需另有合適研究設計。'
  }
]);

export const PROPOSED_MEASURES = Object.freeze([
  {
    id:'choice', title:'選擇權可理解度', category:'可用性',
    method:'提議由成年評審用虛構劇本嘗試拒絕任務，觀察是否容易找到「唔做／離開」選項。',
    caveat:'屬未開始嘅設計檢查，唔代表實際自主感改善。'
  },
  {
    id:'clarity', title:'安全資源資訊清晰度', category:'安全',
    method:'提議由專業人士核對危機提示文字、香港熱線及非緊急／緊急分流是否清楚。',
    caveat:'資訊清晰唔等於已證明真實危機應對安全。'
  },
  {
    id:'privacy', title:'資料流向與權限', category:'私隱',
    method:'提議逐項審核邊啲資料會傳送、記錄、保留或被第三方存取；確認冇真人位置及對話原文第三方閱覽。',
    caveat:'尚未完成正式服務資料流審核或合規認證。'
  },
  {
    id:'comfort', title:'自願使用舒適度', category:'體驗',
    method:'如將來有獲批研究，才考慮取得自願成年參加者嘅知情回饋，包括是否感到被催促。',
    caveat:'尚未收集任何人類參加者回饋；唔係情緒療效指標。'
  }
]);

export const FALLBACK_STEPS = Object.freeze([
  { id:'static', title:'網絡或 API 不穩定', instruction:'轉用 /demo.html 五個固定劇本；頁面載入後的劇本互動不需任何 AI API。', warning:'網站初次載入仍須網絡（除非事先獲授權在本機備妥靜態副本）。' },
  { id:'gate', title:'展示前確認成年使用範圍', instruction:'所有獨立展示頁都保留成年人自我確認。只用虛構故事，唔請觀眾提供個人經歷。', warning:'勾選並非正式年齡或身份驗證。' },
  { id:'safety', title:'遇到現場真實求助', instruction:'停止用產品當場處理危機；遵循機構真實支援程序。劇本只係演示設計思路。', warning:'正式使用前仍需要專業危機支援流程審核。' }
]);

export const TOTAL_SECONDS = 180;
