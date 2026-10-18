# 自有 Git 與 Hosting 部署

性質：發布操作參考，不是已部署證明。0.49.3 使用者授權合併並推送 main，沿用既有 Hosting 的 Git 整合自動部署；0.49.1 為上一輪已推送版本。Git 遠端為 louislin840828/Werewolf_godmode；目前未記錄正式網址，推送成功不代表線上部署已成功，需另外核對狀態與版號。vercel.json／wrangler.jsonc 為選用 Hosting 設定，不另外建立新站。後續發布／遠端分享仍須取得授權。
自有站不需要舊 Sites 的 project id、write credential 或任何 ChatGPT 服務 token。

## 首次接手

1. 解壓交接包，先執行 README 的 `npm test`、`npm run dev`，以手機確認可以操作。
2. 若使用 Git checkout，保留既有歷史／分支，勿重建 repository；只有另製的無 .git ZIP 才需要建立自己的初始提交。
3. 需要發布時，再將該 repository 連到自己的 Hosting；保留一個固定網址給測試者。
4. 新功能使用分支／預覽驗收，合併後才更新固定測試站；不要在進行中的對局中換規則。

## Vercel 設定

| 設定 | 值 |
| --- | --- |
| Root Directory | 交接包內含 package.json 的專案根目錄 |
| Framework | Other（vercel.json 的 framework 為 null） |
| Node.js | 24.x |
| Build Command | npm run build |
| Output Directory | dist |
| Environment Variables | 目前不需要 |

沒有第三方執行期依賴，不需要建立 Functions；Wrangler 是選用 Cloudflare 部署工具的開發依賴。`vercel.json` 已聲明 buildCommand、
outputDirectory 與 framework；Node 範圍在 package.json。
其他靜態 Hosting 亦可執行相同建置並發布整個 dist。
勿把開發伺服器當作 Production server；勿把原始碼根目錄當靜態網站根目錄公開。

設定參考：[Build 設定](https://vercel.com/docs/builds/configure-a-build)、
[部署環境](https://vercel.com/docs/deployments/environments)、
[Node.js 版本](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)。
部署服務選單及帳戶可用功能可能變動，以發布時實際設定為準。

## 發布前檢查

- `npm test` 全通過、`npm run build` 成功；比對版號與 CHANGELOG。
- dist 僅有此次建置 HTML 與 assets，24 張角色圖完整；不要漏掉 villager.webp。
- 固定網址以 HTTPS 提供，檢查手機首次載圖、重整續局、文字紀錄下載與管理版本。
- 更換網域／預覽網址會使用不同 localStorage，這不是資料同步失敗；新站開新局。
- 目前不新增完整存檔匯出／匯入；原站進行中的局先在原站完成。
- 不使用同名角色圖的永久 immutable 快取；圖尚未加內容 hash。
- 若需限制封閉測試訪客，另行設定 Hosting 存取控制並實測；網站本身沒有帳密鎖。

## 回退與版本保留

在自己的 Git 中保留每次測試／發布的 commit 或 release tag。遇到問題時回到上一個
確認版本重新部署；**程式回退不會自動回退 localStorage**，含 schema／流程變動時
必須另驗證存檔相容性。不要把清除使用者對局當作無提示的回退步驟。

歷史 0.30.3 交接對應的 Sites 站為第 33 版（非現行部署狀態查核）；自有部署與 Site 不會自動雙向同步。決定遷移後以
自己的 repository 作為唯一開發來源，避免兩處各改一份。
