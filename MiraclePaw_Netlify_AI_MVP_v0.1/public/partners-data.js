// MiraclePaw v1.1 — nonbinding NGO outreach drafting and meeting preparation.
// Static templates only. No actual NGO relationship, approvals, studies or outreach activity is asserted.
// All placeholders must be replaced and claims manually checked before independently contacting anyone.

export const PARTNERSHIP_STATUS = Object.freeze({
  collaboration: '現階段無已獲確認的合作 NGO、簽署協議、試點批准或真實服務使用者研究成果。',
  goNoGo: 'NO-GO — 只可提出以虛構資料進行成年專業人士初步評審；不可招募學生、未成年人或真實服務個案。',
  outbound: '本頁不會寄送電郵、不會建立聯絡紀錄或將 NGO／個人資料傳往任何伺服器。',
});

export const OUTREACH_TEMPLATES = Object.freeze({
  zh: {
    label: '繁體中文（香港）',
    initial: {
      label: '首次合作邀請',
      subject: '星爪 MiraclePaw｜邀請 NGO／社工提供成年專業意見（初步交流）',
      body: `[NGO／機構名稱] [聯絡人稱呼] 您好：

我哋係星爪 MiraclePaw 團隊，正開發一個以廣東話為主、以無壓力虛擬寵物陪伴為設計方向嘅概念原型。使用者可以選擇心情、同小貓互動，亦可以拒絕出門或任何微行動而不受懲罰。

我哋現時有可操作嘅成年持份者展示版及五個虛構固定劇本，但未有真人試點、已證實嘅心理健康成效、適用未成年人嘅安全驗證，亦未獲任何正式 NGO 合作或倫理批准。星爪唔係心理治療、診斷或危機介入服務。

想請教貴機構會否願意安排約 30 分鐘初步交流，由適合嘅社工／專業同事就使用情境、用戶自主權、危機安全、私隱及日後可能嘅共同設計方向提供意見？交流只展示虛構資料，唔涉及個案、學生招募或資料共享；如有任何下一步，須另行取得合適批准及書面共識。

如適合，我哋可以先提供一頁概念摘要同展示連結，俾貴機構自行評估是否值得進一步討論。若未能配合，亦完全理解，感謝考慮。

此致
星爪 MiraclePaw 團隊
[團隊聯絡人及聯絡方式]`
    },
    followup: {
      label: '未回覆時禮貌跟進',
      subject: '跟進｜星爪 MiraclePaw 成年專業意見交流邀請',
      body: `[NGO／機構名稱] [聯絡人稱呼] 您好：

早前我哋曾就星爪 MiraclePaw 概念原型發出初步交流邀請，想禮貌跟進貴機構是否方便考慮。

我哋希望先以約 30 分鐘、只用虛構資料嘅成年專業交流，聆聽 NGO／社工就自主權、危機安全、私隱及服務適配性嘅意見。呢個邀請唔代表正式合作、使用者招募或任何試點啟動。

如暫時不合適，毋須特別回覆，亦無任何承諾或責任。感謝您抽空閱讀。

星爪 MiraclePaw 團隊
[團隊聯絡人及聯絡方式]`
    },
    thanks: {
      label: '會議後致謝及確認',
      subject: '感謝交流｜星爪 MiraclePaw 後續待核實事項',
      body: `[NGO／機構名稱] [聯絡人稱呼] 您好：

感謝今日抽空就星爪 MiraclePaw 原型提供專業意見。以下為我哋建議再核實嘅議題，請先按實際會議內容修改，並取得雙方核對，切勿直接當成貴機構承諾：

— 產品適用與不適用情況：[待雙方核實]
— 危機安全及人工支援責任：[待雙方核實]
— 私隱、同意、平台／AI 資料流：[待雙方核實]
— 如適合再交流嘅方式：[待雙方核實]

我哋會繼續將本項目標示為概念原型。現階段無任何已批准試點、資料共享安排或真人招募；日後如涉及合作、研究或服務，必須另有適用嘅正式文件及審批。

再次多謝貴機構考慮，歡迎指出我哋理解有誤嘅地方。

星爪 MiraclePaw 團隊
[團隊聯絡人及聯絡方式]`
    },
  },
  en: {
    label: 'English',
    initial: {
      label: 'Initial partnership enquiry',
      subject: 'MiraclePaw | Invitation for an initial NGO professional review (adult-only prototype)',
      body: `Dear [NGO / organisation name] [contact name],

We are the MiraclePaw team, developing an early Cantonese-first virtual pet companion designed around voluntary, non-judgmental interaction. The prototype includes pet interactions, optional mood check-ins and fictional, pre-scripted scenarios. Declining an activity or staying indoors never removes companionship or triggers punishment.

We have a demonstrable adult-stakeholder prototype. We do not yet have an approved service pilot, verified mental-health outcomes, clinical safety validation, safeguarding clearance for minors, or a confirmed NGO partnership. MiraclePaw is not therapy, diagnosis or a crisis-response service.

Would your team be open to an exploratory 30-minute conversation with an appropriate social work or other qualified colleague? We would welcome input on suitable use cases, user autonomy, crisis safeguards, privacy, and whether a future co-design process might be appropriate. The discussion would use fictional content only, with no service-user recruitment or personal-data sharing.

We can share a one-page concept brief and a demonstration link for your consideration. This is an invitation to explore, not a commitment or request to approve a pilot.

Kind regards,
MiraclePaw team
[team contact name and contact details]`
    },
    followup: {
      label: 'Courteous follow-up',
      subject: 'Follow-up | MiraclePaw invitation for an exploratory NGO discussion',
      body: `Dear [NGO / organisation name] [contact name],

I am following up courteously on our earlier invitation to discuss MiraclePaw, an adult-stakeholder demonstration of a Cantonese-first virtual pet companion.

We would value a brief, nonbinding discussion with a suitable NGO professional about user choice, safeguarding, privacy and possible future co-design. The meeting would involve fictional scenarios only; it is not a request to recruit service users or approve any pilot.

We understand if this is not a current priority, and no response or commitment is required.

Kind regards,
MiraclePaw team
[team contact name and contact details]`
    },
    thanks: {
      label: 'Post-meeting thank-you',
      subject: 'Thank you | MiraclePaw discussion and points to verify',
      body: `Dear [NGO / organisation name] [contact name],

Thank you for taking the time to discuss the MiraclePaw concept with us.

Before sending this note, please replace the items below with an accurate, mutually checked summary of what was actually discussed. These are prompts, not agreed outcomes:

- Appropriate and excluded use cases: [to verify]
- Crisis safeguarding and human oversight: [to verify]
- Privacy, consent and AI provider data flow: [to verify]
- Whether any follow-up conversation is appropriate: [to verify]

The project remains an unvalidated prototype. This discussion does not itself create any partnership agreement, approval, data-sharing arrangement or consent to recruit real participants. Any future activity would require separate written processes and appropriate approvals.

Thank you again. Please let us know if our understanding needs correction.

Kind regards,
MiraclePaw team
[team contact name and contact details]`
    }
  }
});

export const ONE_PAGER = Object.freeze({
  zh: {
    eyebrow:'NGO 合作概念摘要 · 待專業審閱',
    title:'星爪 MiraclePaw｜由無壓力陪伴開始，先問安全同適用性',
    summary:'星爪係廣東話優先嘅虛擬寵物陪伴概念原型，希望為唔想即刻分享個人經歷、亦未必準備好參與社交活動嘅人，提供自主、無懲罰嘅微互動起點。此為需驗證嘅設計方向，並非已證實改善孤獨或情緒。',
    built:'已有成年持份者展示版：小貓互動、自願心情選擇、五個虛構固定劇本、HKSEC／NGO Pitch、v1.0 專業審查準備包。真 AI 聊天係可選 Demo，會經 Netlify／OpenAI API 傳送文字及部分上下文。',
    values:'不逼出門、不扣分或撤回陪伴；禁止強制真人配對或 GPS 即時定位；基本陪伴永久免費，無廣告／付費牆。',
    safety:'危機介面設計為維持陪伴並顯示香港撒瑪利亞會 2389 2222、生命熱線 2382 0000；即時危險可致電 999。唔會暗中聯絡家長／NGO。危機安全仍未經專業獨立驗證。',
    privacy:'冇 NGO／家長正式後台；第三方不可查看聊天原文。心情選擇只係頁面暫存；真 AI 對話及部分最近上下文會經 Netlify Function 傳送到 OpenAI API。平台日誌、供應商保留、私隱告知／同意尚待審查。',
    ask:'希望邀請合適 NGO／社工進行約 30 分鐘初步成年專業意見交流；只用虛構情境，首先共同檢視風險、適用性及是否值得再設計專業評估。',
    exclusions:'目前 NO-GO：未有已確認 NGO 合作、研究倫理批准、獨立危機安全驗證、兒童保障核准、真實服務使用者試點、臨床效果或未成年服務使用資格。初次交流、任何口頭興趣或問答都不等於合作協議、資料共享、正式招募授權或試點批准。',
    footer:'聯絡方式：[由團隊自行填寫] · 僅供成年專業持份者概念審閱'
  },
  en: {
    eyebrow:'NGO CONCEPT BRIEF · FOR PROFESSIONAL REVIEW',
    title:'MiraclePaw | A gentle virtual companion, with safety and suitability assessed first',
    summary:'MiraclePaw is an early Cantonese-first virtual pet companion concept. Its design hypothesis is that voluntary, non-judgmental interactions may offer a gentle starting point for people who do not wish to share personal experiences or engage socially. No improvement in loneliness or mental health has been demonstrated.',
    built:'An adult-stakeholder demonstration exists, including pet interaction, optional in-page mood check-ins, five fictional scripted scenarios, HKSEC / NGO pitch materials and a professional readiness pack. Optional live AI chat sends message text and limited context through Netlify and OpenAI APIs.',
    values:'No pressure to go outside, no punishment or loss of companionship, no forced human matching and no live GPS. Basic companionship is intended to remain free, without ads or paywalls.',
    safety:'The prototype crisis interface is designed to keep offering companionship and display Hong Kong helplines: The Samaritans 2389 2222 and Suicide Prevention Services 2382 0000; 999 for immediate danger. No covert alerting of third parties. Independent crisis-safety validation is outstanding.',
    privacy:'There is no operational parent / NGO dashboard. Third parties must never see raw chats. Mood check-ins are temporary in-page; optional live AI chat transmits text to external APIs. Provider retention, platform logging, consent and privacy terms require review.',
    ask:'We seek an optional 30-minute exploratory conversation with an appropriate adult NGO / social-work professional, using fictional scenarios only, to explore suitability, risks and whether further professional review makes sense.',
    exclusions:'Current decision: NO-GO for real service-user pilots. No confirmed NGO agreement, ethics approval, clinical result, or validated use by minors. An initial conversation creates no partnership or data-sharing agreement.',
    footer:'Contact: [complete manually] · Adult professional concept review only'
  }
});

export const PRE_OUTREACH_CHECKS = Object.freeze([
  {id:'claim', title:'每項產品聲稱已核實', detail:'現有 Demo 同未完成研究／合作分開講；唔聲稱療效或實際 NGO 支持。'},
  {id:'audience', title:'只邀請成年專業持份者', detail:'唔招募學生／未成年或真實服務對象；唔要求對方分享個案或情緒紀錄。'},
  {id:'privacy', title:'清楚披露 AI 資料流', detail:'真 AI 聊天會經外部 API；唔承諾所有聊天都不出裝置，第三方不得讀對話原文。'},
  {id:'safety', title:'危機及同意限制無遺漏', detail:'已有提示只係 Demo，尚未完成獨立危機、安全、倫理與兒童保障審核。'},
  {id:'recipient', title:'人手核實對方與適合聯絡途徑', detail:'只用 NGO 官方公開聯絡渠道；核對機構名稱及個別稱呼，唔使用未核實電郵。'},
  {id:'approval', title:'團隊負責人核對草稿', detail:'正式發送需人手編輯、審核、另用本人電郵發出；呢頁唔發信或記錄對方回覆。'}
]);

export const PARTNER_FIT = Object.freeze([
  {question:'機構現有服務範圍是否適合討論非醫療數碼陪伴？', note:'先聽社工對適用及不適用對象嘅意見。'},
  {question:'可否由獲授權成年專業人士檢視完全虛構嘅 Demo？', note:'初步交流唔要求學生或服務對象參與。'},
  {question:'機構有無合適危機／兒童保障／私隱專業支援或轉介途徑？', note:'冇嘅話先停留喺意見交換，不啟動真實試點。'},
  {question:'工作量、時間、責任分工與停用權係咪值得進一步討論？', note:'唔預設 NGO 必須提供免費人手或支援。'},
  {question:'如果冇合作意向，能否尊重機構決定並停止跟進？', note:'無承諾、無壓力、無默示同意。'}
]);

export const MEETING_AGENDA = Object.freeze([
  {slot:'00–05', title:'互相介紹及用途界線', detail:'講清楚只係成年專業人士初步交流、概念原型、唔做真人試點。'},
  {slot:'05–12', title:'五個虛構情境示範', detail:'由對方選擇想睇嘅自主權／低落／危機劇本；唔要求個案分享。'},
  {slot:'12–22', title:'專業疑問與風險', detail:'傾適用／不適用情境、危機責任、私隱與 AI 資料流、社工工作量。'},
  {slot:'22–30', title:'下一步由雙方自行決定', detail:'只討論如有需要嘅第二次專業審閱、需補證據及決策角色；冇即場批准。'}
]);

export const RESPONSIBILITIES = Object.freeze([
  {area:'原型展示與技術說明', team:'建議主責：星爪團隊', ngo:'如願意，提供意見', specialist:'有需要才邀請獨立覆核', gate:'未指派任何正式職責'},
  {area:'適用服務場景與自主權', team:'提供虛構劇本', ngo:'建議諮詢：社工／服務設計', specialist:'可按需要審閱', gate:'尚未核實服務適配性'},
  {area:'危機安全與兒童保障', team:'披露目前限制及技術方案', ngo:'由機構決定可否參與', specialist:'需有適當資格者獨立審查', gate:'未獲正式書面批准前 NO-GO'},
  {area:'私隱、平台供應商與同意', team:'提供代碼資料流及待查項目', ngo:'若討論合作，指派合適資料負責人', specialist:'需獨立私隱／安全審核', gate:'不得共享個人或對話原文'},
  {area:'倫理、研究、停止決策', team:'草擬風險與退出方案', ngo:'如願意共同界定角色', specialist:'適用審查／決策機構', gate:'星爪不能單方面批准真人試點'}
]);

export const DISCUSSION_TERMS = Object.freeze([
  {id:'purpose', title:'合作目的及範圍', proposal:'初步只討論成年專業人士以虛構內容審閱原型；任何後續研究另行評估。', boundary:'唔代表現時存在 NGO 伙伴或服務委託。'},
  {id:'status', title:'非約束性／審批', proposal:'可討論意向及文件清單，但不構成法律協議、招募授權、倫理批准或資料處理安排。', boundary:'正式條款需雙方授權人員及法律／專業顧問另行審核。'},
  {id:'data', title:'資料與保密', proposal:'初次交流僅用虛構內容；不分享真實學生、服務使用者、情緒或對話原文。', boundary:'任何日後資料處理須另簽適用文件、完成資料流／供應商及同意審查。'},
  {id:'safeguard', title:'危機支援責任', proposal:'雙方可共同提出需要嘅危機專業審查、轉介、事件處理及停用程序。', boundary:'現時無已運作嘅危機承接服務，唔可當作醫療／緊急支援。'},
  {id:'resources', title:'人手、費用及資源', proposal:'日後如有活動，需要另行確認工作量、支出、保險與費用安排。', boundary:'概念交流唔暗示 NGO 須免費提供人手，亦冇預設資助。'},
  {id:'rights', title:'品牌、知識產權及宣傳', proposal:'展示既有原型供審閱；後續如要用對方名稱／標誌，需逐項取得書面許可。', boundary:'唔可用 NGO 名稱、標誌或意見暗示已獲背書。'},
  {id:'exit', title:'退出及停止', proposal:'任何一方可選擇唔繼續；如日後擬定合作，需另設結束、撤回、事故及停用條件。', boundary:'本頁唔管理合同，亦冇已確認試點期限。'},
]);

export const NEXT_STEPS = Object.freeze([
  '先由團隊核實 Pitch、危機資源、資料流及對外文字。',
  '選擇適合嘅 NGO 類型，經官方公開渠道核對聯絡人與方式，請勿把聯絡資料填入此網站。',
  '複製中／英文首次邀請範本，自行按對方實際範圍修改，經負責人核對後才從正式電郵發出。',
  '對方如有興趣，可先提出 30 分鐘、只用虛構內容嘅成年專業初步交流。',
  '會後經對方核實下一步，再回到 v1.0 六項 NO-GO 關口進行獨立審查；唔會自動開啟真人試點。'
]);
