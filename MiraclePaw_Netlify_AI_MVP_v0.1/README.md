# 星爪 MiraclePaw — Netlify Web App（內部 MVP v1.0）

> **用途：** 內部團隊及**成年** NGO／社工持份者試玩展示，並非已完成安全驗證的未成年人產品；不能用於緊急求助、醫療診斷或治療。

這份專案由零建立，採用 **純 HTML / CSS / JavaScript + Netlify Functions + OpenAI Responses API**，不需要資料庫，也不必預先安裝 React。

## v1.0 — NGO Pilot Preparation（成年專業持份者候審包）

- **新入口**：`/pilot.html`。由主頁、v0.7 評審導覽、v0.8 QA 及 v0.9 Pitch 直接進入。
- **候審資料**：六大治理關口、八項初步風險、真實代碼資料流、未來家長／NGO 權限方向、分三階段合作方案與 45 分鐘交流工作坊。
- **文件**：`docs/NGO_PILOT_PREPARATION_v1_0.md`；含現有功能與未完成審批清單、NO-GO 原則、風險及正式會議紀錄建議。
- **準備 ≠ 試點批准**：所有關口預設未完成；「已討論」剔選只存本頁記憶體，無分數、無資料庫，唔會解鎖 Go、真實招募或未成年人功能。
- **真實私隱界線**：本頁本身純靜態、無 API；現有 `mood.js` 心情係頁面記憶體；但主網站選用真 AI 聊天時會將當次訊息與部分上下文經 Netlify Function 交 OpenAI API，`store:false` 唔等於已核證所有供應商／平台日誌。相關資料流、保留、同意與權限尚待獨立審查。
- **持續原則**：不因不出門／拒絕而懲罰；禁止強制配對或真人即時定位；危機保持陪伴及顯示香港熱線，不暗中聯絡第三方；家長／NGO 後台尚未實作、任何第三方不得查看對話原文；基本陪伴免費、無廣告／付費牆。
- **安全範圍**：成年專業持份者虛構資料審閱，唔係未成年人產品、醫療或正式危機介入；尚未有確認 NGO 協議／倫理批准／臨床成效。任何準備頁的專業判斷仍須在合作機構認可渠道作正式紀錄。
- **Preview**：`pilot-preview.js` 只為 Netlify Deploy Preview 加上官方 `ntl-drawer-state=hidden` 參數，係 CSP 容許嘅同源外部 script，不影響 Production。
- **發布原則**：先通過 `npm test` 同 Netlify Preview、成年團隊實際桌面／手機驗收；未確認唔合併 `main`。

## v0.9 — NGO／HKSEC Pitch Ready（成年持份者演示）

- **新入口**：`/pitch.html`，由主頁、v0.7 展示導覽、v0.8 FAQ／驗收頁進入。
- **雙路線三分鐘 Pitch**：HKSEC 與 NGO／社工，均為五段、建議合計 180 秒的廣東話講稿。可跳段、切換路線、手動開始／暫停／重設計時；不會自動跳段，背景頁面會暫停計時。
- **NGO 試點討論框架**：成年專業人士檢視 → 倫理／安全及資料治理方案 → 僅在審核批准後考慮小規模試點。現階段**未有 NGO 合作協議、倫理批准、未成年服務試用或研究成效**。
- **建議指標**：拒絕任務嘅可理解度、危機資訊清晰度、資料流向與第三方權限、未來獲批研究才收集嘅自願舒適度。呢啲都**唔係現有實測結果**，亦唔係臨床療效證明。
- **現場備援**：提供固定劇本、危機劇本及 QA 快速連結；固定劇本互動無需 AI API，但首次載入網站仍可能需要網絡。所有固定劇本仍有成年人確認入口。
- **私隱**：Pitch 本身只係靜態講稿同計時器，唔傳資料、唔儲存觀眾資訊、唔定位、唔收集真實個案。成年人勾選不等於身份核實；不得將原型作正式危機支援或學生服務。
- 本版僅限展示頁及文件，**沒有更改主網站 AI、Netlify Functions、危機熱線內容或收費／Billing**。合併前須先運行 `npm test`，以及實際在桌面及手機 Preview 驗收。

## v0.8 — NGO／HKSEC 展示驗收與常見問題

- 新增 `/review.html` 成年持份者內部展示頁：評審／社工常見問題、講解一致性，以及實際展示檢查清單。
- 將已實作的原型功能與未完成的安全審核、成效驗證及合作試點清楚分開，**不得虛構臨床成效、合作協議或未成年人實際使用**。
- 只建議以虛構資料測試；唔用真實學生資料。檢查進度如有互動，只限目前頁面示範，不代表正式測試記錄或統計。
- 本版唔改 OpenAI API Billing、危機電話、原有聊天、寵物互動、心情記錄或 v0.6 固定劇本。
- `npm test` 會核對 QA／FAQ 相關界面、資料保護及原有功能。

## v0.7 — NGO／HKSEC 評審展示導覽

- **新網址：** `/showcase.html`；主網站及原有成年人試玩密碼視窗都加入入口。獨立導覽頁無需 AI API、用戶輸入或情緒數據。
- **兩條可切換路線：** HKSEC 創業評審（需求假設、原型功能、社交差異、安全、未來驗證）與 NGO／社工（服務範圍、自主權、私隱、危機、合作試點），各五步。
- 每一步包括建議講解稿、清楚註明嘅證據界線，以及連結到相應 v0.6 固定劇本；連結格式 `/demo.html?scene=<白名單 ID>`。**劇本成年確認畫面仍然生效，唔會被導覽頁繞過。**
- 設有「重新開始」、「上一步／下一步」、自選步驟、列印／另存展示摘要。列印係瀏覽器本身嘅 `window.print()`，唔經任何外部 PDF 服務。
- **禁止虛構成果：** 現有可操作 Demo ≠ 真 AI 已驗證、臨床成效、已簽 NGO 伙伴、已完成未成年人測試。建議嘅專業訪談與試點都標明仍屬計劃。
- 安全：只供成年人概念測試（網頁勾選非正式年齡驗證）。無 GPS、真人配對、後台監察、第三方對話原文瀏覽，亦無新增本地儲存或網絡請求。
- `npm test` 包含導覽完整性、成年確認、固定情境深層連結及資料保護測試。
- **展示流程建議：** 開 `/showcase.html` 選 HKSEC 或 NGO 路線 → 逐步講解 → 每步需要時按「相關示範」進入 `/demo.html` → 返回導覽。亦可先列印當前步驟與安全摘要作為簡報提示。

## v0.6 — 安全情境展示模式（完全唔需要 API）

- 用網址 `/demo.html`，或喺主頁及試玩密碼視窗按「🎬 安全情境展示」進入。
- 首先由**成年人自行勾選確認**（只係 UI 聲明，唔係正式身份核實）；整個展示**唔需要 OpenAI API Key、模型額度、試玩密碼或資料庫**（仍由 Netlify 作靜態網站託管）。
- 五個固定劇本：低落時仍陪伴；預設虛構名字「阿明」同心情上下文（**唔代表 AI 真正記憶**）；自願由窗邊到安全日間公共地方；虛構寵物豆豆先打招呼；危機時陪伴及固定香港熱線。
- 全部對白同選項係**事前撰寫嘅虛構劇本**；每個對話都標明「預設台詞／非 AI」，冇開放自由輸入，亦唔聲稱係 AI 生成。
- 安全紅線：唔扣分、唔因拒絕出門而停止陪伴；冇真人配對／即時定位；危機時固定顯示撒瑪利亞會 `2389 2222`、生命熱線 `2382 0000`、即時危險 `999`，由人自行決定致電，唔會暗中聯絡緊急聯絡人。
- `demo.js` 只渲染靜態文字同按鈕，**無 fetch 或其他網絡請求**、無 storage／cookies／GPS。注意靜態網站檔案仍然係由 Netlify 按正常網頁載入，網頁伺服器可能有一般存取記錄；唔代表全無網絡連線。
- 呢個係**獨立安全展示頁**。原有 `/` 主頁嘅 AI 對話端點及 v0.5 情緒記錄冇改動；原有 HTTP 429 額度問題仍然未解決。
- 自動驗證：`npm test` 包含劇本流程、危機電話、非懲罰選項、成人聲明及無 API 存取測試。
- 限制：尚未經正式心理安全研究、專業/法規審核或未成年人用戶測試，**唔可以當作真正危機支援／醫療服務**。

## v0.5 — 自願情緒記錄（即使 AI 未連線都可示範）

- **五種非診斷式心情自述：** 開心、平靜、有啲擔心、有啲低落、攰攰哋。單擊後會得到固定、溫柔的廣東話支持文字，爪爪表情亦會暫時變化；不作醫療或心理狀態分數。
- **可選及可退出：** 可以按「今日唔想記錄」；完全冇扣分、無獎懲，亦唔會令寵物停止陪伴。
- **只限頁面記憶：** 最多顯示本頁最近 10 筆記錄，含本機時間；全部只在 JavaScript 記憶體，重新整理即清除，亦可按「清除記錄」。唔使用 localStorage、Cookies 或資料庫。
- **不傳送至 AI／Functions：** 選擇心情只用 `mood.js` 更新本頁，不發起任何網絡請求。AI 聊天仍為分離功能，其 API Billing/HTTP 429 問題未在 v0.5 解決。
- **限制：** 目前無跨日記憶、趨勢分析或社工／家長視圖；只供已獲邀成年持份者以虛構資料試玩，未完成未成年人服務安全審查。

開發驗證：`npm test`。PR 會透過 GitHub Actions 跑本地測試，不需要 OpenAI API Key。


## 已完成的功能

- 真正使用 OpenAI API 生成廣東話 AI 寵物回覆（設定自己的 API Key 後）。
- 在同一頁對話中攜帶最近六輪內容，能參考用戶於本次對話提過的名字／心情；**重新整理或重置後不保留記憶**。
- 自願微行動：開窗、飲水、日間安全地方散步；「模擬完成」不追蹤 GPS、不儲存位置；選擇不出門仍然陪伴。
- 寵物對寵物打招呼概念演示（**固定模擬訊息，並非真實配對**），不連接真人或共享位置。
- 危機提示：本地關鍵詞 + API 端 Moderation，顯示撒瑪利亞會 `2389 2222`、生命熱線 `2382 0000`、緊急危險 `999`；不會暗中聯絡任何第三方。
- API Key 僅由 Netlify Functions 在伺服器端讀取；前端不包含 API Key。
- 必須輸入管理員設定的試玩密碼（至少 12 位），才可呼叫 AI；可減低被隨意使用風險，**但不是正式登入系統及不足以全面防範濫用**。
- 不使用 localStorage／Cookies 儲存對話，後端亦不設聊天資料庫；Responses API 設 `store: false`。**輸入仍會傳送至 OpenAI API 供處理，資料處理及平台記錄仍須獨立審視。**
- 沒有真正寵物配對、家長後台、社工後台、雲端記憶、真實地圖評估及學生身份核實。

## A. 最容易：使用 GitHub + Netlify 部署

1. 到 [platform.openai.com/api-keys](https://platform.openai.com/api-keys) 建立 OpenAI API Key，確認 API billing／使用限額可用（**ChatGPT Plus 訂閱不等於 OpenAI API 額度**）。
2. 到 [github.com/new](https://github.com/new) 建立**私人** Repository，例如 `miraclepaw-ai-demo`。
3. 將這個資料夾內的檔案原封不動上傳到 GitHub Repo 根目錄。**不要上傳 `.env` 或任何真實 API Key。**
4. 到 [app.netlify.com](https://app.netlify.com) 登入，選 **Add new project / Import an existing project**（介面文字可能更新），連接該 GitHub Repo。
5. Build 設定：**Base directory 留空**、**Build command 留空**、**Publish directory 填 `public`**；Functions 使用 `netlify.toml` 定義的 `netlify/functions`。
6. 先在 Netlify Project configuration／Environment variables 加入三個變數，**Scope 必須包含 Functions**：

   | Name | Value | 說明 |
   | --- | --- | --- |
   | `OPENAI_API_KEY` | 自己的 OpenAI API Key | 私密，絕不能放前端 |
   | `DEMO_PASSCODE` | 自己產生的 16–24 位隨機字串 | 跟獲邀成年測試者分享 |
   | `OPENAI_MODEL` | `gpt-5.4-mini` | 可改成帳戶可用的模型 |

7. 完成部署／重新部署後打開 Netlify 的 `*.netlify.app` 網址，輸入試玩密碼，測試 AI 對話。
8. 如顯示 `管理員尚未設定...` 或 `AI 暫時未能回覆`，先檢查環境變數、OpenAI API billing、模型存取權及 Netlify Functions 日誌。

**重要：不能只將 `public` 拖到 Netlify Drop 就當作完成。** 靜態頁可顯示，但 `/api/chat` 所需的 Netlify Function 需要經支援 Functions 的部署流程建置；建議直接連 GitHub。

## B. Mac／Windows 本機測試

需要 Node.js 20 以上，已裝 Netlify CLI 或可使用 npx；在 Terminal：

```bash
cd MiraclePaw_Netlify_AI_MVP
cp .env.example .env
```

然後用文字編輯器開啟 `.env`，填入**自己的** `OPENAI_API_KEY` 與 `DEMO_PASSCODE`。

```bash
npx netlify-cli dev
```

打開 CLI 輸出的本機網址（通常 `http://localhost:8888`）。**不要直接雙擊 `index.html` 用 `file://` 開啟，因為咁樣不會啟動 Functions。**

驗收程式：

```bash
npm test
```

測試使用 Mock API，不需要真實 API Key，也不會產生真實 OpenAI API 請求。

## C. 請依次驗證五個情景

1. **真 AI**：試玩密碼通過後，輸入「我今日好攰」，應收到廣東話 AI 回覆（而非固定預設字句）。
2. **本次對話記憶**：輸入「我叫阿明」，再問「我叫咩名？」；應可根據最近上下文回應。
3. **拒絕出門**：按「今日唔想出門」，應得到繼續陪伴、不扣分、不催促的回應。
4. **模擬打卡**：按「飲杯水」及「模擬完成」，會顯示本頁模擬訊息，**不會提交 GPS 或出門證據**。
5. **危機詞**：以虛構測試語句輸入「我想自殺」，畫面應有兩條指定熱線；本地端及伺服器端都設有相關檢測。

> 不能將這五項功能測試，等同正式安全驗證或真實心理健康成效。

## D. 上線前必做（特別是向未成年人開放）

- 進行專業兒童保障／心理健康安全評估及真人危機處理流程設計；單靠正則表達式及 Moderation 仍可能漏判、誤判。
- 香港私隱法律／學校及家長同意流程審查，明確定義個人資料收集、保存、刪除、外判處理與意外通報機制。
- 正式身分驗證、服務端持久化限流／API 預算上限、濫用監測、故障處理及安全測試；**目前試玩密碼不足以保護公開長期服務**。
- 鎖定測試用戶為獲邀的成年人，不要要求學生提供真實情緒資料；亦不要把這版本宣傳為 24 小時心理健康支援。
- 研究 OpenAI API 服務條款及資料處理政策，評估是否合適服務目標用戶與學校。
- 若後續新增實際寵物對寵物互動、社工後台、家長後台，必須重新設計身份權限、同意及紀錄政策。

## E. 網站結構

```text
MiraclePaw_Netlify_AI_MVP/
├── public/
│   ├── index.html               # 網頁畫面與互動控制
│   ├── styles.css               # 響應式視覺設計
│   └── app.js                   # 前端聊天流程及模擬打卡
├── netlify/functions/
│   └── chat.mjs                 # 伺服器端 OpenAI API / 安全檢查
├── tests/chat.test.mjs          # API mock 自動化測試
├── netlify.toml                 # Netlify Build、Functions、HTTP headers
├── package.json
├── .env.example                 # 本機環境變數範本，非真密鑰
└── .gitignore
```

## 參考文件

- Netlify Functions: https://docs.netlify.com/build/functions/get-started/
- Netlify Environment Variables: https://docs.netlify.com/build/functions/environment-variables/
- Netlify Git Deploy: https://docs.netlify.com/start/quickstarts/deploy-from-repository/
- OpenAI Responses API: https://developers.openai.com/api/reference/resources/responses/methods/create
- OpenAI Moderation: https://developers.openai.com/api/docs/guides/moderation

版本：內部 MVP v0.9（2026-11-23）。原型已透過 GitHub/Netlify 建立部署流程；固定劇本及展示導覽唔需要 OpenAI API。**AI 真正對話仍須另外驗證 API 額度與安全性；唔係已驗證的未成年人或臨床服務。**
