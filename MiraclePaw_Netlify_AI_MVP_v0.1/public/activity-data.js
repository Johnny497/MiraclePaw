// MiraclePaw v1.2 — discussion-only NGO activity proposal materials.
// Themes were inspired by user-supplied activity presentation examples (community,
// employment, health and AI-assisted PPT workflow). Their venues/organisations are
// NOT verified MiraclePaw partners; this source DOES NOT assert any attendance.
// All narrative is an idea to review, not a field observation or study result.
export const ACTIVITY_STATUS = Object.freeze({
  maturity:'概念提案 · 未經 NGO 批准 · 無真實參加者或活動成果',
  noGo:'NO-GO：不得以此頁招募學生／未成年人、收集個案、啟動真實服務試點或宣稱已獲合作機構同意。',
  copyright:'上傳或引用活動照片前，必須核實拍攝者／參與者的適用授權及所需同意；本版不接受圖片上傳。',
});

export const TOPICS = Object.freeze([
  {
    id:'community',emoji:'🌱',label:'青年社區參與',english:'Community participation',
    tagline:'由自願、可退出嘅小小社區行動開始',
    context:'可以討論有啲人對參與社區活動感到陌生或者壓力；呢個係待檢視嘅服務需求假設，唔代表已經有訪談或調查證實。',
    challenge:'如何避免將外出或社交變成「必須完成」嘅任務？如何提供室內替代選項？',
    need:'清楚可拒絕嘅邀請、無懲罰陪伴、無障礙安排、適合時間及安全場地評估。',
    observation:'建議討論題：社區設施、聚腳地方、可選活動及非參加者嘅感受；未進行實際考察。',
    insight:'需由成年專業人士核實：低門檻活動是否有助參與？如何避免標籤化、互相比較同社交壓力？',
    proposal:'與願意參與嘅成年專業持份者共同設計「窗邊觀察→自選日間公共地方→虛構寵物問候」選項；全部可跳過，唔安排真人配對或即時 GPS。',
    resource:'需要 NGO 場景意見、場地風險評估、無障礙審查、可退出資訊及人手安排；目前全部未落實。',
    safety:'外出非必要；拒絕不會扣分或令寵物失去陪伴。未完成保障審核前不可安排青少年參與。',
    sample:'虛構場景：成年人選擇今日唔出門，爪爪一樣陪住佢，並提供室內替代選項。',
    scene:'small-steps'
  },
  {
    id:'employment',emoji:'💡',label:'青年就業／技能',english:'Employment & skills',
    tagline:'唔催促成果，先了解青年學習同求助需要',
    context:'可以從求職自信、學習資源及數碼技能等方向提問，但星爪尚未做過青年就業需求調查，唔應聲稱發現普遍問題。',
    challenge:'資訊太多、選擇未必清楚；有冇簡單易明、由參與者自行決定嘅入門學習路線？',
    need:'容易取得嘅技能資訊、負責任使用 AI 嘅示範、可尋求真人導師嘅渠道、無壓力參與權。',
    observation:'建議討論題：現有職涯中心、青年工作坊、AI 技能培訓資源；未考察圖片所示工場。',
    insight:'未驗證假設：應從真實學員需要出發，而唔係以就業人數、薪金或 AI 技能提升作未證實成果。',
    proposal:'一場由合適成年專業人士審閱嘅「AI 整理資料與負責任做 PPT」概念工作坊：虛構工作紙 → 事實核對 → 八頁簡報大綱 → 自願分享與回饋。',
    resource:'需要經核准的示例資料、講師、無障礙設備、版權許可、資料保護與活動時段；未有合作安排。',
    safety:'不得輸入求職者真實私隱、敏感家庭或健康資料；AI 內容要人手查核，唔保證會改善就業。',
    sample:'虛構場景：用已公開或自創嘅示例工作紙做八頁內容大綱，唔上傳真人個案相片。',
    scene:'name-mood'
  },
  {
    id:'health',emoji:'🫶',label:'青年健康／情緒',english:'Youth health & wellbeing',
    tagline:'情緒支援概念必須先做好界線同專業安全審查',
    context:'青年健康可能涵蓋情緒、社交、求助資源等議題；呢啲係討論題目，並非疾病率、醫療需求或臨床成效研究。',
    challenge:'部分參與者可能唔想即刻講私人經歷；點樣設計唔逼人透露資料又可以得知求助資源嘅示範？',
    need:'無壓力選擇、清晰嘅危機資源、專業人員審查、私隱保護及安全退出。',
    observation:'建議討論題：醫療教育、公共求助資訊同專業轉介界線；未同圖片中醫院建立任何關係或做場地考察。',
    insight:'現階段無臨床試驗、診斷或對未成年服務使用者嘅安全驗證；不能推斷任何情緒改善。',
    proposal:'由成年 NGO／社工和具適當資格的安全專業人士評審虛構低落與危機回應情境，檢查拒絕選項、熱線及不當輸出風險，唔向真人收集情緒或病歷。',
    resource:'需要適當資格專業安全審核、私隱及倫理判斷、人工危機承接與事故停止程序；目前未備齊。',
    safety:'星爪非治療或危機服務。示範危機時保持陪伴，列撒瑪利亞會 2389 2222、生命熱線 2382 0000，即時危險 999；唔暗中通知第三方。',
    sample:'虛構場景：成年人提到情緒低落，爪爪唔迫佢出門；真實危機須用可信任真人及正式支援渠道。',
    scene:'safety'
  }
]);

export const SLIDE_BLUEPRINT = Object.freeze([
 {id:'cover',number:'01',title:'封面／活動概念',field:'tagline',helper:'用「建議活動」標示，不要將圖片中的活動當成已落實合作。'},
 {id:'context',number:'02',title:'參考場景／考察方向',field:'observation',helper:'只有實際勘查及獲授權圖片先可標示為實地紀錄；目前屬待驗證方向。'},
 {id:'observations',number:'03',title:'我哋希望了解啲咩？',field:'context',helper:'問題假設不等於已有調查結果。'},
 {id:'insight',number:'04',title:'最值得進一步驗證嘅發現',field:'insight',helper:'將「發現」改成待專業驗證嘅假設，唔虛構數據。'},
 {id:'problem',number:'05',title:'青年面對嘅問題',field:'challenge',helper:'呢段係討論方向，不代表所有青年都面對同一問題。'},
 {id:'needs',number:'06',title:'青年可能需要啲咩？',field:'need',helper:'需由相應持份者／專業人士核實，不能假裝已訪談。'},
 {id:'proposal',number:'07',title:'我哋嘅活動建議',field:'proposal',helper:'清晰區分原型、建議活動及未批准真人試點。'},
 {id:'closing',number:'08',title:'資源、風險與下一步',field:'resource',helper:'必須講清楚未有 NGO 合作、倫理／私隱／危機安全批准。'}
]);

export const FOUR_QUESTIONS = Object.freeze([
 '我哋正在面對邊個未驗證嘅問題或機會？',
 '真正嘅需求係咩？有邊啲需要 NGO／社工核實？',
 '我哋可以提出咩可退出、非強制嘅活動概念？',
 '要安全推行，需要咩資源、保護措施及正式批准？'
]);

export const PPT_WORKFLOW = Object.freeze([
 {id:'worksheet',title:'整理工作紙／參考資料',detail:'先用虛構或經許可嘅素材，標明未經實地驗證嘅假設；唔上傳真人個案資料。'},
 {id:'outline',title:'用本頁整理八頁內容大綱',detail:'按社區、技能或健康主題切換，複製已寫好嘅討論草稿；唔等於 AI 已讀你嘅附件。'},
 {id:'photos',title:'人手核對及選擇照片',detail:'只用已核實版權、肖像權及使用同意嘅圖；活動示例圖片不可當成星爪真實成果。'},
 {id:'deck',title:'製作 PPT 草稿',detail:'喺經批准嘅工具手動排版、加圖、加來源；本版唔上傳圖或自動產生 .pptx。'},
 {id:'review',title:'正式分享前再次核對',detail:'專業責任人核實事實、安全、資料及用語，確認 NGO、地點及活動都唔被錯誤描繪為已合作。'}
]);

export function slidesFor(topicId) {
 const topic=TOPICS.find(t=>t.id===topicId) || TOPICS[0];
 return SLIDE_BLUEPRINT.map(page=>({
  ...page,
  body:topic[page.field],
  topicId:topic.id
 }));
}

export const ADULT_NOTICE='只供成年專業持份者以虛構材料討論，並非真人活動、醫療服務、已獲批准試點或未成年人招募工具。';
