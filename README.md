# Aurawolf｜全知之人

手機優先的狼人殺主持工具，提供 12 人警長局及指定板子的固定 10 人變體。支援八個固定板子、首夜逐步認牌、
技能目標、夜間結算、警長／放逐投票、撤回、玩家詳情與中文復盤紀錄。

專案版本：**0.49.1-beta.1**（以 package.json 為準）。選板右上角為 Beta 標籤；全介面採墨色圖像小說呈現，使用新版 24 張角色圖，提供唯讀全角色圖鑑與站內主持視窗。手機遊玩頂欄收為右上角浮動選單，技能優先、保存說明置於捲動內容末端，確認／棄票與撤回仍常駐。角色介紹彈窗完整呈現 1:1 圖片，進入按鈕常駐。Hidden 模式已移除。對局存檔 key／schema 不變，文字復盤不是可還原存檔。

0.49.1 已由使用者確認，授權合併並推送 `main`，由既有 Hosting 的 Git 整合自動部署；線上部署結果需另外核對。後續開發仍使用 `visual/interface-consistency`。Chrome 已有部分多尺寸／互動檢查，**手機實機與八板完整對局仍未完成驗收**。歷史變更見 [CHANGELOG.md](CHANGELOG.md)，文件用途與稽核見 [docs/documentation-review.md](docs/documentation-review.md)。

規則與預測範圍見 [勝負與綁票預測](docs/victory-and-forecast.md)；接手入口為 [docs/agent-handoff.md](docs/agent-handoff.md)。

## 本機開始

需要 **Node.js 24.x**（最近驗證 24.22.0），npm 隨 Node 提供。
遊戲無第三方執行期依賴，本機建置／測試不需先執行 `npm install`；Cloudflare 部署工具 Wrangler 為開發依賴。有 nvm 時可執行 `nvm use`。

在解壓後、含有本 README 的目錄執行：

```sh
npm test
npm run dev
```

開啟 `http://127.0.0.1:4173`。原始碼變更後約一秒內重新建置，**手動重整瀏覽器**
查看結果；不是 HMR。`Ctrl+C` 停止。用 HTTP 開啟，勿直接雙擊 HTML 使用 `file://`。

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 建置、啟動本機伺服器、監看 src／package.json／build.cjs |
| `npm run preview` | 建置並啟動無監看預覽；變更後需停止再啟動 |
| `npm run build` | 清除並重新產生 `dist/`，勿在該目錄手動保存原始碼 |
| `npm test` | 在乾淨暫存目錄建置及執行全套測試 |
| `node scripts/dev-server.cjs --check` | 只檢查建置與首頁路徑，不啟動伺服器 |
| `npm run dev -- --port 8080` | 使用另一個連接埠 |

用同一 Wi-Fi 的手機驗證：

```sh
npm run dev -- --host 0.0.0.0
```

在手機開啟 `http://你的電腦區網IP:4173`，需允許電腦防火牆的區網連線。
`0.0.0.0` 是監聽設定，不是手機要輸入的網址。本機伺服器只供開發，勿對公網轉發。
手機與電腦、localhost 與區網 IP 的對局資料不共用。

## 文件入口

| 文件 | 內容 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | 開發代理必讀；介面／規則修改邊界與必要檢查 |
| [docs/architecture.md](docs/architecture.md) | 模組責任、建置順序、版本與修改流程 |
| [docs/boards.md](docs/boards.md) | 八板配置、夜序、關鍵家規及程式／測試對照 |
| [docs/role-system.md](docs/role-system.md) | 共用角色狀態、技能權限、死因、勝負與遷移 |
| [docs/development-handoff.md](docs/development-handoff.md) | localStorage 保存、手機限制及搬站行為 |
| [docs/testing.md](docs/testing.md) | 自動測試基線與驗證限制 |
| [docs/known-issues.md](docs/known-issues.md) | 待驗證、已知限制與未開發範圍 |
| [docs/mobile-acceptance.md](docs/mobile-acceptance.md) | 手機完整對局驗收與問題回報格式 |
| [docs/deployment.md](docs/deployment.md) | 自有 Git／Hosting、Vercel 設定與回退原則 |
| [docs/agent-handoff.md](docs/agent-handoff.md) | 給本機代理／MCP 的接手步驟及可貼上的任務說明 |
| [docs/visual-design.md](docs/visual-design.md) | 圖像小說 token、共用元件、分階段範圍與驗收 |
| [docs/documentation-review.md](docs/documentation-review.md) | 全文件用途、當前／歷史分類與本輪修正 |
| [docs/dead-code-audit.md](docs/dead-code-audit.md) | 靜態掃描、已刪項目與保留風險 |
| [CHANGELOG.md](CHANGELOG.md) | 專案版本變更紀錄 |

## 發布與資料

網站是純前端，不需要 API key、後端、帳號服務或資料庫。發布 `dist/` 的全部內容，
包含 `assets/roles/`，不能只上傳 index.html。
對局以 localStorage 保存在目前來源及瀏覽器，沒有雲端同步或多局列表。
完整存檔匯出／匯入已由使用者確認暫不開發；文字復盤匯出不等於可還原存檔。

先使用固定測試網址進行封閉測試；目前自動測試通過不代表已完成手機實機驗收。
目前是本機 Git checkout；原 0.30.3 ZIP checksum 已封存於 docs/history，不代表現況。若另行製作交接包，不包含部署憑證、個人對局或帳戶設定，且須重新產生版本與校驗清單。推送／部署需另取得明確授權，不把舊 Sites 的 project identity 套用到新服務。
