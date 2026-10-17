# 架構與修改指南

## 執行方式

原生 JavaScript、CSS、Canvas；沒有 React／Next.js、npm 執行期依賴或伺服器 API。
`build.cjs` 按 `sources` 陣列串接 29 個模組，合併四份 CSS 進 `dist/index.html`，
複製角色圖。這些檔案共用 script 的全域作用域，**不是 ES modules**。
模組中有 wrapper／adapter 接續前一個實作，載入順序有意義，不可任意排序。
每次建置會先刪除 `dist/`；只修改 `src/` 或工具來源，不手動改 dist。

| 區塊 | 檔案 | 責任 |
| --- | --- | --- |
| 原始對局與板子 | app.js、boards.js、八板 .js（含 classic.js）、election.js | 既有狀態、流程、角色行為、投票 |
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
共用角色系統目前是八板的轉接規格，不是任意角色組合的通用規則引擎。

## 圖像小說第一階段（0.44.0-beta.1）

`graphic-play.css` 限定 play 呈現 token／元件，最後載入，不改全域主題。`city-render.js` 是無玩家資料的純 Canvas 城市 painter，`village-render.js` 依 `.graphic-play` 接入並保留 resize／節點重用／日夜過渡；不改 controller 或存檔。
0.44.1 依使用者確認將呈現範圍延伸至警長、黎明、出局技能與結束流程，遊玩角色介紹與隱藏畫面亦接入同一 token；Canvas 簽章包含 graphic-play 模式。選板、名冊、紀錄及管理抽屜仍用現有設計。詳見 [visual-design.md](visual-design.md)；未使用瀏覽器驗收不得宣稱完成 RWD。

## 0.46 全介面一致性

`interface-theme.css` 在 graphic-play 之後載入，使用 ui-* 共用 token；對齊選板／抽屜／站內彈窗，不改遊玩座位、Canvas 或投票確認。`host-dialog.view.js` 提供原生 dialog top layer 與焦點／取消服務，無權威狀態存取。app.js 的 host intent adapter 在等待時不寫 state，以完整狀態比對拒絕過期 continuation；無 dialog 能力的 VM 使用同步原生 adapter。配置與重設支援完成回呼，界面只在成功後開局／清除抽屜。既有驗證與結算閉包不變。詳見 [interface-consistency.md](interface-consistency.md)。

## 0.47 角色圖鑑

`role-atlas.view.js` 在 game.js 後載入：靜態 24 角色技能概覽，獨立圖鑑選取／捲動狀態，不讀玩家身分、不呼叫 engine。game.js 的 atlas 抽屜與命名入口沿用焦點／導覽；保留肖像快取。詳見 [role-atlas.md](role-atlas.md)。

## 0.46.1 動態收斂

`game.js` MOTION 為內容 160／進場 180／離場 140／場景 400ms，抽屜位移 6px，投票結果納入局部回饋。compact 提示按 transition key 重用／重建並短淡入淡出。`village-render.js` 舊背景等待新插畫解碼最多 600ms，只遮背景；跨階段清理 timer／副本，過期回呼不繪製，不改 controller。詳見 [motion-refinement.md](motion-refinement.md)。

## 0.40 呈現更新與轉場

`game.js` 在對局畫面以同步 DOM reconciliation 保留同型同鍵節點（id／座號／角色／主要 class），保留 Canvas bitmap、成功圖片、焦點輸入與同回合 disclosure。開局輪播亦接入共用節點更新及過渡，保留原生手勢流程並防止重複綁定。VM stub 不支援真實 DOM 時保留 innerHTML 路徑。
`village-render.js` 依場景／存活顯示／動態設定簽章重用 Canvas 迴圈；簽章變更才重建繪製，舊 Canvas 圖層只用於非互動淡出。
轉場由呈現 key 判斷；動畫只處理 opacity，不呼叫 controller／engine，不等待動畫才更新權威狀態。離場副本 inert、aria-hidden 且無 id；隱藏身分立即整頁替換，不建立副本。0.40.2 將回合 key 與局部結果分開，抽屜容器開關與層內導覽分開；名冊／詳情使用 ±10px 輕移。日夜 Canvas 與面板採 400ms，只有環境變更建立 Canvas 副本。靜態場景停止環境與裝飾持續動態，保留導覽回饋；reduced-motion 停用 JS 過渡與程式平滑捲動。首次渲染與手機效能仍須實機驗收。

## 固定配置變體（0.43.0）

boards.js 的 boardConfiguration() 描述固定配置；s.variant 預設 standard12，僅 brothers 可選 wolfking10。
GameEngine.configure() 只允許開局前切換，依配置建立玩家並保留仍在場座位暱稱；不開放任意人數／混牌。
首夜認牌、狼隊／狼王能力與畫面座位读取同一配置，預測快取納入 variant；舊 12 人保存仍可載入。

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
