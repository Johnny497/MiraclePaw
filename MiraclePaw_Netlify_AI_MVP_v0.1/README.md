# 星爪 MiraclePaw — 真 AI 對話 Netlify Web App（MVP v0.1）

> **用途：** 內部團隊及**成年** NGO／社工持份者試玩展示，並非已完成安全驗證的未成年人產品；不能用於緊急求助、醫療診斷或治療。

這份專案由零建立，採用 **純 HTML / CSS / JavaScript + Netlify Functions + OpenAI Responses API**，不需要資料庫，也不必預先安裝 React。

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

版本：v0.1（2026-11-18），適合進一步做模擬及成年持份者測試，**尚未實際連接用戶的 API Key 或部署到 Netlify**。
