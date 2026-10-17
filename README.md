# 月夜議會｜狼人殺上帝控制台

手機優先的狼人殺主持工具，提供 12 人警長局及指定板子的固定 10 人變體。支援八個固定板子、首夜逐步認牌、
技能目標、夜間結算、警長／放逐投票、撤回、玩家詳情與中文復盤紀錄。

專案版本：**0.47.0-beta.1**。右上角改為角色圖鑑：24 位角色集卡冊，點卡查看完整大圖、名稱與技能概覽，無篩選、不顯示本局玩家身分、不改對局。原隱藏按鈕因 inline handler 的 hidden 屬性名稱衝突而未生效，本輪替換入口。詳見 [圖鑑說明](docs/role-atlas.md)。

0.46.1-beta.1：第二階段收斂內容／抽屜動態、補齊投票結果與回合提示淡入淡出，日夜插畫交接保留 400ms、背景慢載等待最多 600ms（不阻擋操作）。詳見 [動畫修正紀錄](docs/motion-refinement.md)。

0.46.0-beta.1：介面一致性延伸至選板／詳情、玩家名冊、紀錄、管理及站內確認／輸入／提示視窗；沿用 0.45 城市與角色原圖，不改規則／存檔。轉場微調留待下一階段。Chrome 多尺寸抽屜與彈窗已做部分檢查，手機實機與八板完整對局仍待驗收。詳見 [本輪紀錄](docs/interface-consistency.md)。

0.45.0-beta.1：遊玩主畫面接入同構圖的日夜城市正式插畫、墨色乾筆材質與克制金色筆線；技能金色、投票中立灰藍。環繞座位與技能線保留，新增操作區回合標題；角色原圖、底層規則及存檔格式不變。選板、名冊、紀錄與管理當時不屬改版範圍（0.46 已延伸）。此版本只做 Node／VM 自動檢查，**尚待手機與瀏覽器視覺驗收**，不能沿用 0.44.1 的部分 Chrome 紀錄認定通過。詳見 [視覺契約](docs/visual-design.md) 與 [本輪驗收及 Patch 說明](docs/visual-redesign-acceptance.md)。
0.43.0 狼兄狼弟／黑市商人可在板子詳情選擇 12 人標準版或 10 人狼王版（3 狼、4 神、3 民），不提供 9 人版；普通狼王自爆／中毒不能開槍，不新增報槍環節。
0.42.0 新增「預女獵白／四小狼」12 人警長局，白痴首次放逐翻牌仍存活、無投票權，仍計入神邊；現有丘比特板家規不變。
0.41.0 黎明統整夜死名單之外，警長與放逐投票結束也提供統整結果視窗；放逐後先處理出局技能與警徽，再列出本次所有出局者及死因。平票進入 PK 時保留前一輪票數。
0.40.3 綁票預測不再假設狼人知道隱藏身分；狼刀確認後可在夜間提示提前宣告。
0.40.2 依操作意義區分容器開關、層內導覽、回合切換與局部結果，名冊／詳情提供輕微方向感；混合轉場保留村莊與座位節點，回合內容短淡入、日夜場景交疊過渡，並保留角色剪影備援與一日內的保守綁票預測。
0.40.1 改善黑市商人獨立選取、投票恢復回執、取消開新局與開槍／放棄入口。
交接功能基底對應 Site 第 33 版；本次未發布網站。MCP 接手入口為 [docs/agent-handoff.md](docs/agent-handoff.md)。
規則、推算範圍與手機驗收情境見 [勝負與綁票預測](docs/victory-and-forecast.md)。

## 本機開始

需要 **Node.js 24.x**（本次驗證 24.19.0），npm 隨 Node 提供。
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
| [CHANGELOG.md](CHANGELOG.md) | 專案版本變更紀錄 |

## 發布與資料

網站是純前端，不需要 API key、後端、帳號服務或資料庫。發布 `dist/` 的全部內容，
包含 `assets/roles/`，不能只上傳 index.html。
對局以 localStorage 保存在目前來源及瀏覽器，沒有雲端同步或多局列表。
完整存檔匯出／匯入已由使用者確認暫不開發；文字復盤匯出不等於可還原存檔。

先使用固定測試網址進行封閉測試；目前自動測試通過不代表已完成手機實機驗收。
交接包不含 Git 歷史、部署憑證、個人對局或帳戶設定。先在自己的 repository
建立版本，再連接 Hosting；不要把舊 Sites 的 project identity 套用到新服務。
