# 本機開發代理／MCP 接手

MCP 是工具連接方式；專案本身不需要 MCP server 才能執行。
本交接不假設使用哪個 IDE 或代理，也未替本機建立連線與帳戶授權。

## 建議能力

| 能力 | 用途 |
| --- | --- |
| 專案檔案讀寫 | 閱讀／修改完整 source、規則、素材與文件 |
| 本機命令執行 | Node.js 24、npm test／build／dev |
| Git | 差異檢查、分支與提交；遠端由使用者提供及授權 |
| 真實瀏覽器工具（建議） | 手機 viewport、畫面、滑動、網路及 console 驗證；不能以 VM stub 冒充 |
| Hosting 操作（選用） | 後續部署時才連接，不是本機開發必要能力 |

只開放需要的專案目錄；無需把舊 Sites write credential、整台電腦帳號或真實對局
資料放入 repository。部署、推送到遠端與傳訊等操作仍依使用者授權執行。

## 第一個回合應做的事

1. 讀 README → AGENTS → architecture → boards → role-system → victory-and-forecast → development-handoff → known-issues。
2. 檢查 Node 24 與 package 版本，執行 `npm test`，再 `npm run dev`。
3. 確認當前全套 26 支測試通過、本機首頁與角色圖可用；手機驗收清單中的狀態不要先標成通過。
4. 若工具無法實機驗證，清楚記錄限制；有錯誤先解讀訊息，不要改規則來遷就環境。
5. 在自己的 Git 留下基準，再接受下一個明確開發任務。

## 可直接貼給本機代理的任務

> 請接手這個 Aurawolf｜全知之人專案，先只完成環境驗證。讀取 README.md、AGENTS.md 與
> docs/ 中的架構、八板家規、角色系統、localStorage 保存及已知問題文件。
> 專案版本以 package.json 為準，使用 Node.js 24，無第三方執行期依賴（Wrangler 是選用部署開發依賴）。先執行 npm test，
> 確認乾淨建置及全部 26 支測試，再用 npm run dev 啟動本機預覽，回報可用網址與限制。
> 遊戲以手機為主，請依 mobile-acceptance.md 協助驗收，沒實際驗證的項目不要宣稱通過。
> UI 修改不能改動底層規則；不重寫框架、不降低角色圖畫質、不新增完整存檔匯出／匯入，
> 也不擅自清除或更換 localStorage key。先不要部署或推送遠端，等我提供下一個任務。

## 已完成與未完成

已備妥完整原始碼、24 張圖、建置、本機指令、測試、版本標示、文件與靜態輸出。
使用者已完成前版的本機驗證，並驗收第 31 版判勝修正；本包仍須在接手電腦重新執行基線。
本機已有 Git 分支與提交；遠端／Hosting 設定與當前手機完整對局／連開兩局效能未在此任務驗證。
目前是本機 Git checkout；docs/history/handoff-0.30.3.json 只記錄舊 ZIP 的來源／checksum，不驗證當前檔案。現行版本看 package.json／Git，驗證看 testing.md。

## 接手後的協作方式

本機代理／MCP 負責實作、Git 與本機測試；本對話後續以產品發展方向、規則與需求討論為主。
功能需求未明確時先整理問題與做法，不自行擴張板子或改變家規。
獲得具體任務後，先記錄驗收情境，再實作與檢查，回報差異、測試、未驗證限制。
改 UI 時遵守呈現層邊界；改規則時同步 victory-and-forecast.md 及對應測試。

## 首輪實機回歸重點

- 警上發言／白天短內容不露出深色斷層，手機直向與橫向皆確認。
- 選取前後 footer 不跳動，警徽移交／撕毀卡片可切換、確認與撤回。
- 開第二盤同板子與切不同板子，量測圖片請求、快取命中、解碼及記憶體；不先清快取。
- 復仇刀已用的狼弟＋狼人＋獵人＋平民，放逐結算後可提示必勝（含保留票單／PK）。
- 不將 Node VM／DOM stub 的綠燈當作真實手機版面或網路效能驗證。

當前接手先讀 [documentation-review.md](documentation-review.md)、[visual-assets.md](visual-assets.md) 與 [dead-code-audit.md](dead-code-audit.md)。0.45 Patch 文件只供歷史追溯，不對目前 HEAD 重套。現行角色新圖來源為 src/assets/roles。只提交本機；合併 main／推送／部署需新授權。
