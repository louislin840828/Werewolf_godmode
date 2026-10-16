# 架構與修改指南

## 執行方式

原生 JavaScript、CSS、Canvas；沒有 React／Next.js、npm 執行期依賴或伺服器 API。
`build.cjs` 按 `sources` 陣列串接 24 個模組，合併兩份 CSS 進 `dist/index.html`，
複製角色圖。這些檔案共用 script 的全域作用域，**不是 ES modules**。
模組中有 wrapper／adapter 接續前一個實作，載入順序有意義，不可任意排序。
每次建置會先刪除 `dist/`；只修改 `src/` 或工具來源，不手動改 dist。

| 區塊 | 檔案 | 責任 |
| --- | --- | --- |
| 原始對局與板子 | app.js、boards.js、七板 .js、election.js | 既有狀態、流程、角色行為、投票 |
| 純角色模型 | rules/role-state.js | 技能、陣營／屠邊、死因、效果、共用判定，禁止 DOM |
| 相容轉接與引擎 | role-runtime.js | 舊狀態轉接、schema 遷移、結構事件、撤回及 GameEngine |
| 綁票預測 | victory-forecast.js | 有界對抗搜尋、隔離副本、重用正式行動及結算、上帝確認 |
| 操作控制 | game-controller.js | 意圖與合法目標驗證、流程確認、草稿／選取 |
| 呈現 | *.view.js、game.js、game.css、mobile.css | 模型呈現、角色圖、彈窗、抽屜、手機互動 |
| 村莊場景 | village-render.js | Canvas 場景與動畫 |
| 圖片 | role-images.js、assets/roles/*.webp | 角色 URL 與 24 張 1024 × 1024 WebP |
| 本機工具 | scripts/dev-server.cjs | 僅公開 dist、監看後建置，不是 production server |

畫面讀取 frozen `viewState()`／GameEngine 快照，透過 controller／命名 engine 操作
提交意圖。不可從 view 直接修改 live `s`，也不可直接呼叫死亡／勝負／切夜結算。
共用角色系統目前是既有七板的轉接規格，不是任意角色組合的通用規則引擎。

## 0.40 呈現更新與轉場

`game.js` 在對局畫面以同步 DOM reconciliation 保留同型同鍵節點（id／座號／角色／主要 class），保留 Canvas bitmap、成功圖片、焦點輸入與同回合 disclosure。開局輪播仍採原本整頁渲染及原生手勢流程。VM stub 不支援真實 DOM 時保留 innerHTML 路徑。
`village-render.js` 依場景／存活顯示／動態設定簽章重用 Canvas 迴圈；簽章變更才重建繪製，舊 Canvas 圖層只用於非互動淡出。
轉場由呈現 key 判斷；動畫只處理 opacity，不呼叫 controller／engine，不等待動畫才更新權威狀態。離場副本 inert、aria-hidden 且無 id；隱藏身分立即整頁替換，不建立副本。靜態場景及 reduced-motion 停用 JS 轉場。首次渲染與手機效能仍須實機驗收。

## 狀態

`s` 保存對局；`roleSystem` 投影共用角色與事件。`g`、drawer、popup、timer 等是
部分暫存的 UI 狀態。技能資源與死亡不能搬到 UI 變數，也不能把顯示上的隱藏
當成真正改變角色生命或勝負。詳見 role-system.md 及 development-handoff.md。

## 版本

- 專案版號唯一來源：`package.json` 的 `version`。
- 建置時寫入 `meta[name="application-version"]`；對局管理讀取該值供回報。
- 修改功能後按影響調整 patch／minor，記錄 CHANGELOG；封閉測試期間保留 beta。
- Site「第 33 版」是網站發布版號；不能當成 package version 或存檔 schema。
- roleSystem schemaVersion 目前為 1；不能因改版號就更換 localStorage key／schema。
- 交接 ZIP 的 HANDOFF.json 含 source commit、檔案清單與 checksum；不是玩家存檔。

## 修改與驗證

1. 閱讀 AGENTS、板子規則與已知限制；從正確層級修改。
2. UI 工作保持原有規則；有規則衝突先指出，勿自行套用其他線下版本。
3. 執行 `npm test`，通過後用手機驗證此次影響的互動。
4. 更新版本、CHANGELOG 與必要文件，重新 build。
5. 對照差異，確認沒有混入 localStorage 資料／憑證，再提交 Git。

不要以刪除斷言、忽略失敗或硬改 state 來讓測試變綠；過時斷言應由目前確認規則
及可觀察的行為取代。測試使用 VM／DOM stubs，不能宣稱完成手機瀏覽器驗收。
