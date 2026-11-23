# MiraclePaw v1.4 — Native Netlify Rate Limiting & AI Cost Guardrails

**用途：**內部成人持份者 Demo 工程審閱；不是醫療／兒童保障認證、完整反濫用系統、使用費用保證或真實 NGO 試點許可。  
**決策：NO-GO for real service users / minors.** 靜態虛擬寵物與固定虛構劇本繼續免費、不懲罰、不強制外出、不強制真人社交、不使用 GPS。  
**成本與測試：**v1.4 自動測試只用 Node.js Mock，不需打真實 OpenAI API、不需充值。部署與真實平台規則必須由團隊用 Netlify UI/Deploy Log 確認。

## 1. 已實作的控制

| 控制 | 程式／設定 | 行為 | 不能推論的事 |
|---|---|---|---|
| Netlify 平台原生 Rate Limit | `netlify/functions/chat.mjs` → `export const config.rateLimit` | `/api/chat` 每個 IP + domain 在 60 秒內上限 6 次，超額由 Netlify 平台回 HTTP 429；包括密碼錯誤的請求 | 不是「每個實名使用者」；共享 Wi-Fi/NAT 可能共用限額；分散來源可突破；**並非全站總成本上限** |
| 管理員緊急停止 AI | Netlify 環境變數 `AI_CHAT_DISABLED=true` | Function 在任何 OpenAI 請求前返回 HTTP 503、`AI_DISABLED`；提供免費固定劇本及自行求助熱線，唔影響靜態寵物頁面 | 係營運人員控制；需確認環境變數變更已對相關 Production／Preview 執行環境生效，唔係即時硬切斷所有在途請求 |
| 內建模型回覆長度上限 | `chat.mjs` Responses API | `max_output_tokens: 420`（由 v1.3 保留），當次輸入訊息、歷史數量及長度已有界線 | 只限制個別模型輸出 token，唔係 USD 金額上限；Moderation 同入站 tokens 亦可能計費 |
| 無自動重試 | `chat.mjs`、`app.js` | 上游 429／超時安全回覆；Netlify 原生 429 可為空或 HTML，瀏覽器先辨識狀態再做非 AI 備援 | 唔代表平台網絡層或供應商永遠唔出錯 |
| 基本陪伴仍可用 | `public/index.html`、`public/app.js`、`/demo.html` | AI 被停止或超額時顯示固定虛構劇本；拒絕出門只喺本頁回應，不上傳 | 初次下載 Netlify 靜態網站仍需要網絡；不是離線 PWA |

### 為何選 Netlify 原生規則，而非記憶體或 Netlify Blobs Counter

Netlify Function 可以喺多個獨立實例處理請求，單個 Node.js `Map` 或全局計數器**無法**提供跨實例有效限流。Netlify 官方原生 Function `rateLimit` 規則由平台執行，無須新增 Redis、外部資料庫、付費 SDK 或保存 IP 到本專案。

不要用 `netlify.toml` 寫 Function 的原生限流；規則必須放在 Function 的 `config`。不應將 Netlify Blobs 的讀寫反覆計數錯誤當成原子、強一致的財務交易或全站配額。

Netlify 官方參考：
- [Rate limiting documentation](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)
- [Functions configuration / config.rateLimit](https://docs.netlify.com/build/functions/api/#ratelimit)
- [Netlify AI rate limiting and surprise cost guide](https://www.netlify.com/blog/how-to-rate-limit-ai-features-and-avoid-surprise-costs/)

## 2. 啟用／暫停真 AI（需要有權限嘅團隊成員操作）

1. 登入對應 **Netlify 專案**，核對 Production 同 Deploy Preview 使用嘅 environment context。
2. 若要完全暫停新真 AI 呼叫，經 Netlify 專案環境變數設定 `AI_CHAT_DISABLED=true`。請按 Netlify 當時的環境變數生效／重新部署程序操作，核對已生效。**不要將任何金鑰或密碼寫入 GitHub Repository**。
3. 使用虛構成年測試語句確認：`/api/chat` 回 HTTP 503，JSON `code: AI_DISABLED`，且無上游 OpenAI 呼叫。保留自由使用 `/demo.html` 同小貓互動。
4. 如未設、設為 `false` 或其它值，本版只表示**未啟動緊急停用**，原有 Key、Demo Passcode、內容格式及 Netlify 原生限流仍然適用。
5. 恢復真 AI 前，由有權限團隊再核實配額、供應商帳戶限額、資料處理、測試範圍及應對事故責任，之後才取消停用開關。**唔要求測試者充值。**

> **注意：**對正在進行、已送出的上游請求，手動切換環境變數未必能立即取消；請按當前 Netlify 官方操作方式驗證生效時間。緊急情況應由營運負責人處理平台層級封鎖／供應商金鑰。

## 3. 部署時必須核實 Netlify 原生規則確實生效

Netlify 官方文件指明，**rate-limit rules 係喺部署 post-processing 階段驗證**。就算部署狀態顯示成功，仍可能因語法或規則限制未真正被套用。

- 在 Netlify **Deploy details / Deploy log** 找類似 `Rate limiting rules applied: /api/chat: 6 requests per 60 seconds per IP` 嘅確認文字，並檢查是否有 validation error；具體 UI 和日誌格式可能變更。
- 本版 GitHub Node tests 只檢查 `config` 正確、Function kill switch、前端 HTTP 429；**唔會自行模擬 Netlify Edge 平台計數**。
- 如負責人需要做平台行為驗收，只准在**已批准的專用 Preview 測試範圍**用無效試玩密碼、小量請求觀察 HTTP 429，**切勿用真 AI 帳號／個案灌流量**。按機構及平台政策決定是否可測，唔應因無法檢測便虛構通過。
- 以正式部署記錄為準；GitHub 的 Preview 成功標記**不代表** Production Published 或限流規則已被驗證。

## 4. 成本限制：哪些已做到、哪些仍未做到

| 目標 | v1.4 狀態 |
|---|---|
| 特定 IP 在短期濫用時減少昂貴推理請求 | 以 Netlify 原生 Rate Limit 配置達到，部署後需核實 |
| 停用選用 AI，同時保留免費寵物陪伴 | 已加入 `AI_CHAT_DISABLED` 管理員開關，測試證據以 Mock 為準 |
| 限制當次模型輸出 | 已有 `max_output_tokens: 420` |
| 在 AI 配額／服務故障時停止重試 | 已有 Safe Error + Free Scripted Fallback |
| **所有 IP 共用每日請求／USD 硬上限** | **未實作**：原生 `aggregateBy: ['ip','domain']` 唔係全站共享金額總額；應另外由 OpenAI／平台可用嘅供應商預算／消費上限、告警、或具原子共享配額嘅已批准方案控制 |
| 用戶正式登入、防共享密碼濫用、未成年人安全 | **未實作**；不能投入正式 NGO 服務 |
| 高風險危機內容獨立安全審核、私隱合規、供應商保留審核 | **未實作**；維持 NO-GO |

**部署審閱的成本建議：**使用受限制、可撤回嘅測試憑證；由平台帳戶權限人員設定可用嘅預算/告警；避免將 HTTP 429 失敗自動重試。任何「月費不超過 HK$X」需有真正可核實的財務控制，不能由本版程式碼宣稱。

## 5. Mock 與人工 QA 清單

`npm test`：
- RateLimit 設定符合官方欄位（`windowLimit=6, windowSize=60, aggregateBy=['ip','domain']`）。
- `AI_CHAT_DISABLED=true` 時返回 `AI_DISABLED`、無任何上游呼叫，並保留香港熱線。
- 即使試玩密碼錯誤也會由停用開關拒絕上游請求；非 POST 照常拒絕。
- 前端可處理 Netlify 產生嘅 **非 JSON** HTTP 429、顯示免費固定劇本、唔重試。
- 繼續執行 v1.3 HTTP 429／AbortError／Moderation fail closed／危機支援／自主拒絕零請求測試。

由成年人團隊於 Preview 驗收：
- 主站仍可正常操作寵物、心情、自願微步、固定劇本。
- 已輸入內部試玩密碼時，AI 受限只顯示備援，不會無限重試或要求充值。
- 桌面／手機、鍵盤焦點、繁體中文換行、危機支援資源沒有受影響。
- **Netlify 部署日誌**明確套用 6/60s 規則，否則標記需修正，不合併。
- `main`、Production Published 只可於正式驗收／合併後核實。

## 6. 最終界線

本版仍為只供**成年** NGO／社工持份者使用**虛構資料**審閱嘅 MVP。冇實際 NGO 伙伴同意、真實研究、臨床效果或未成年服務使用批准。唔強制外出、唔懲罰，亦無 GPS／真人配對、第三方對話原文後台或暗中通知。真 AI 對話仍會經 Netlify 傳訊息與有限上下文到 OpenAI API；平台／供應商日誌、資料保留與適用知情同意尚待專業審查。
