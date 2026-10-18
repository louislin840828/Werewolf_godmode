# 自動測試基線

目前 0.49.4-beta.1 為 **30 支測試**；後續各版本段落是歷史回歸紀錄，當時數量／環境／待驗收狀態不代表現況。0.43.0 歷史基線 20 支、0 失敗。0.29 的 14 支原有測試完成修復並加入
tooling-check，0.30 再加入 victory-check／forecast-check。規則更新以目前確認家規為準。

## 執行

在專案根目錄執行 `npm test` 或 `node test-all.cjs`，不需安裝第三方依賴。
最近驗證環境：Node.js v24.22.0。

統一入口會複製目前原始碼、建置腳本與測試到新暫存目錄，從零建置，檢查
合併後 JavaScript 的內容／語法及全部 24 張角色圖，再依序執行所有
`check.cjs`／`*-check.cjs`。不讀取專案裡既存的舊 `dist/`，不覆寫本機建置產物。
每支測試有 45 秒上限，錯誤或逾時均回傳非零 exit code；結束後刪除暫存目錄。
新測試應使用同樣的命名規則，以便自動納入。

`node role-system-check.cjs` 可單獨檢查共用角色規則與呈現層邊界。
部分個別測試需要建置後的圖片；完整驗證以統一入口為準。

## 0.49.4 回饋入口

feedback-check 確認常駐「建議」連結、結局主按鈕與文字紀錄按鈕，且沒有自動結束彈窗。不代表已在瀏覽器點開外部表單。

## 0.49.3 自爆技能卡

explosion-card-check 檢查一般四板直接卡片／無 prompt、非法座位拒絕、選取與取消不改 state、缺目標拒絕、確認後出局／撤回、過期投票鎖、機械狼設定、10 席狼王自爆無槍與警徽續接。Chrome 390×844 狼兄弟使用隔離測試 fixture（非完整對局）實際點卡、狼兄拒絕、普通狼選取摘要及取消返回無重播介紹；其他板／手機實機待驗收。既有備援 prompt adapter 測試保留，正式 UI 改走座號選擇。

## 0.49.2 自爆投票鎖

新增 explosion-check，以正式控制層／resolver 驗證八板零票即鎖、實票／棄票／舊保存／PK、警長投票與過期確認拒絕不寫 state、重整／撤回／翌日重設及 10 席變體。election-check 原允許記票後第二爆的斷言改為投票前退水雙爆，保持雙爆中斷／恢復與特殊角色效果；其他投票案例增加正式開始投票。首載速度與固定來源重整續局／撤回必須實機量測，詳見 mobile-acceptance.md，不以測試 stub 代替。

## 0.49.1 完整角色圖彈窗

mobile-layout-check 追加 1:1／contain、雙角色並排、無畫作遮罩與獨立底欄入口契約。Chrome 黑市商人單角色於 320×640、390×844、430×932、844×390、1200×900 已局部確認方形尺寸、contain、入口至少 48px 且可見、無內容橫向溢出；橫向圖文實際捲動到底入口仍可見。雙角色以 DOM fixture 確認兩張 182×182，非完整狼兄弟對局驗收。手機實機、守衛回合、長預測／特殊資訊與讀屏仍待驗證。

## 0.49 手機操作優先

mobile-layout-check 驗證原生浮動選單、捲動末端保存說明、技能優先與常駐確認／撤回的靜態契約，並確認選單操作不改 frozen viewState。Node v24.22.0 全套 27 支、0 失敗。Chrome 狼兄弟認牌多尺寸第一屏選項、44px 座位／選單不重疊、無橫向溢出、名冊工具中的紀錄開關／焦點返回、選座摘要與捲動後確認位置部分通過；不代表其他板子技能、投票／特殊情境或手機實機完成。

## 0.48.1 靜態與文件 Review

branding-check 增加選板 Beta badge／舊 header 文案移除斷言；全套保持 26 支。scripts/static-audit.cjs 為可重跑保守詞彙掃描（不自動刪碼），限制／已刪及保留風險見 dead-code-audit.md。文件用途與現況分類見 documentation-review.md。Chrome 檢查與手机實機分開回報。

## 0.48 品牌／素材與隱藏清理

新增 branding-check：品牌標題／匯出、hidden 模式與專用樣式移除、不同 keyed SVG 與正式角色素材建置位元組一致；保持所有既有規則及 UI 斷言。Chrome 多尺寸 header 與圖示接入範圍見 [aurawolf-brand.md](aurawolf-brand.md)。

## 0.47 角色圖鑑

role-atlas-check 驗證 24 角色／素材對應、卡冊／詳情／返回、無篩選、不讀玩家資訊、不改 state 或選取。Chrome 真實點擊入口、詳情、返回焦點／捲動、Escape 與多尺寸版面 smoke check 見 [role-atlas.md](role-atlas.md)。舊隱藏的 inline 名稱衝突是在真實點擊發現，VM 字串檢查不代表事件接線有效。

## 0.46.1 動畫修正

新增 scene-transition-check，驗證插畫解碼交接、600ms 背景等待上限、舊副本／計時清理、過期 callback 及 reduced-motion。presentation-check 更新 160ms／6px 規格，保留同回合不重播與靜態導覽。Chrome 部分動畫屬性／reduced-motion 驗證與限制見 [motion-refinement.md](motion-refinement.md)。

## 0.46 全介面與站內彈窗

新增 host-dialog-check：注入 deferred service，使用正式 adapter／規則驗證取消不寫狀態、過期確認、縮編／重設完成回呼、無警長與自爆資格；全套 Node v24.22.0 23 支、0 失敗。Chrome 抽屜多尺寸／彈窗部分驗證及未驗收清單見 [interface-consistency.md](interface-consistency.md)。VM 不代替 dialog 焦點、top layer、鍵盤或手機驗收。

## 0.45 城市插畫與操作媒介

新增 `city-art-check.cjs`：同時請求共用 Promise、成功解碼只執行一次、失敗與 decode 失敗後重試、日夜映射、不同場景比例 cover 不變形、完整素材建置／HTTP MIME、10／12 席 320／390／430px 數值幾何不重疊。舊 graphic-play-check 保留規則互動與 fallback 決定性斷言；不再要求已移除幾何房屋的 200 次 Canvas 呼叫。

本輪檢查為 Node／VM／靜態契約，尚未做真實 Canvas 呈現、CSS computed style、Safari／Chrome／手機觸控驗證。0.44.1 的歷史瀏覽器紀錄不能代替本次驗收。交付將在乾淨基準套用完整 binary Patch，再執行全套測試與建置。

## 修復內容

| 測試 | 舊問題 | 現在驗證的內容 |
| --- | --- | --- |
| bloodmoon、dream、whiteknight | DOM 模擬不支援新版輪播；斷言仍依賴舊表單 id | 補齊必要 DOM stub，檢查現行認牌介面與 controller 狀態；原板子案例保留 |
| cupid | 發言／投票資格已移到玩家詳情卡 | 打開對應詳情卡，確認顯示區及實際發言／投票權限 |
| gargoyle | 模組載入不足；還在驗證已移除的首夜順序與即刻繼承 | 驗證首夜先認石像鬼、每夜最後查驗、女巫前固定狼刀環節、隔夜繼承，以及原有放逐／查驗／撤回案例 |
| scene | 引用已移除的 dist/scene.js 與舊 DOM 選單 API | 驗證現行座位操作、目標限制、選取取消、日夜光線、狼隊隔離及手機環繞座標 |
| check | 讀取舊 dist/app.js、dist/mechanical.js，原先通過不代表驗證現版 | 依實際建置順序載入目前全部模組；首夜認牌、延後回報、警上發言／退水／投票按目前流程測試 |

`test-support.cjs` 提供共用 VM 載入器，模組順序從 `build.cjs` 讀取，避免另一份
載入清單漂移。只攔截最後的頁面啟動以供測試安排狀態，不替換遊戲判定。
DOM stubs 只支援字串／controller 測試，不代表真實瀏覽器執行結果。

## 0.44.1-beta.1 遊玩流程視覺補齊

graphic-play-check 補上 election／dawn／end 範圍、遊玩角色介紹、罕見選牌／退水／預測／回合提示 CSS 契約及 Canvas 模式簽章。Node 24 全套 21 支與 role-system-check 通過。獨立 Chrome 390×844 已實際走經典板認牌、警長退水／投票、黎明公布及白天投票；角色介紹 computed style 正確、退水及結果卡為墨色、整頁無橫向溢出。罕見選牌、預測確認及回合提示另用 DOM fixture 檢查 computed style，未宣稱完成其實際規則流程。其餘尺寸、實機、多板完整流程尚未驗證。

## 0.44.0-beta.1 圖像小說第一階段

新增 graphic-play-check，測試 play 範圍／選取與取消／固定位置／出局文字／多來源／投票棄票修改，決定性無遊戲資料城市 painter、限定 CSS token／中立票色／穩定摘要／reduced-motion。所有檢查為 Node／VM／靜態契約，不是 computed-style、Canvas 真實画質或 RWD 驗收。
Node v24.22.0 改版前完整 20 支通過，沒有既有失敗；改版後完整 21 支及 role-system-check 通過。真實瀏覽器 320／390／430px 及橫向、字體、安全區、焦點與截圖未驗證（無 control-browser）。

## 0.43.0 狼兄弟 10 人回歸

brothers-ten-check 驗證合法配置／選板／認牌／夜序、狼王死亡槍鏈及复仇、屠邊優先、交易／獵槍、座位與摘要、真正啟動時讀取 10 人及無 variant 的舊 12 人保存、拒絕非法縮編保存、切配置撤回、預測隔離與狼王槍分支；既有八板測試保留。另驗證 10 席手機座標的 44px 命中區分離及警長競選狼王自爆不開槍。

本次 Node v24.22.0：`npm test`（20 支、0 失敗）、`node role-system-check.cjs`、`node build.cjs` 與 `git diff --check` 通過；未執行瀏覽器／手機實測。

## 0.42.0 預女獵白回歸

新增 classic-check，涵蓋 12 席首夜認牌、夜序、狼刀／女巫／查驗／獵人、白痴翻牌仍存活、無票權、神邊、刀毒槍致死、投票結果、結構事件、重整與撤回、夜間屠邊優先、預測反制／隔離及丘比特家規不變。role-system-check 納入新板 schema 與無 DOM 邊界；ux-check 驗證八張選板卡片與逐板開局。

本次 Node v24.22.0：`npm test`（19 支、0 失敗）、`node role-system-check.cjs`、`node build.cjs` 與 `git diff --check` 均通過；未執行瀏覽器／手機實測。

## 驗證範圍

自動測試涵蓋八板的主要流程與邊界案例、角色狀態、死因／技能條件、
警長流程、撤回／遷移、介面結構及圖片載入流程。
「全套通過」不是已遍歷任意角色組合或所有可能對局的保證。

手機 Safari／Chrome 的實際滑動、鍵盤、版面、效能、圖片網路載入與完整對局，
仍須另外實機驗收；這些測試不能取代該步驟。

## 交接工具檢查

`tooling-check.cjs` 檢查本機 server 的 URL／路徑、HTTP 方法、版本 metadata、
原始碼／機密檔不公開及角色原圖位元組。直接呼叫 handler，不開監聽埠，不能宣稱
已在使用者電腦啟動過 dev server 或完成手機連線。
統一測試入口會把 scripts 與 package.json 一併複製到隔離目錄。

## 0.41.0 投票統整視窗回歸

`ux-check.cjs` 新增放逐結論視窗（放逐／平票 PK／無人放逐、PK 前一輪票數、跨夜不重現、撤回）、槍與警徽完成前不遮住目標、放逐與後續槍擊／殉情死亡因素彙整及白天攝夢人不牽連的回歸；`election-check.cjs` 新增警長結論視窗（當選／唯一候選人／警徽流失含原因、PK 前一輪票數、跨夜不重現）。仍為 Node／VM 測試，非實機驗收。

## 0.40.2 語意過渡回歸

`presentation-check.cjs` 直接執行過渡分類，驗證同回合選取不重播、結果只局部更新且保留展開資訊、抽屜容器與頁籤／詳情分離、前進／返回 ±10px、reduced-motion 停用與靜態場景保留導覽。Node v24.22.0 全套 18 支通過，角色邊界與建置通過。原生 dialog 的 top layer、焦點恢復、實際捲動與快速連點仍需瀏覽器／手機驗收。

## 0.40.1 互動回歸

`ux-check.cjs` 增加黑市商人雙向獨立選取、合法目標／禮物、未完整確認、跳過及撤回；七板投票恢復回執（含棄票）、完成與換輪；取消／確認開新局的畫面狀態；五個獵人板的開槍／放棄模式、主確認與撤回。仍為 Node／VM 測試，非實機驗收。
本次 Node v24.22.0：`node role-system-check.cjs`、`npm test`（18 支、0 失敗）、`node build.cjs` 與 `git diff --check` 均通過；未執行瀏覽器／手機實測。

## 0.40.0 呈現連續性回歸

新增 `presentation-check.cjs`，以可操作的 DOM 節點模型驗證 reconciler 保留 Canvas、座位、已解碼圖片、焦點輸入及展開狀態，並驗證重排／刪除、離場副本 inert／aria-hidden、立即隱藏與減少動態契約。
既有 VM stub 仍走純 innerHTML 路徑，不可將全套測試描述為已驗證真實瀏覽器的 DOM reconciliation、Canvas 交疊或動畫流暢度。本次環境 Node 22.23.3；正式 Node 24 基線與手機驗收待補跑。

## 0.30.5 預判文字回歸

`forecast-check.cjs` 增加主持人提示文字檢查：投票前／後的範圍、警徽與 1.5 票、
策略摘要與保密提醒、下一夜結算時的期限、非隨意操作必勝及不自動結束。
兩輪平票後不稱為已放逐；沒有必勝證明仍不顯示提示。既有規則回歸保留。

## 0.30.4 圖片備援回歸

`portrait-loading-check.cjs` 額外檢查剪影容器持續掛載、正式顯示節點解碼完成才顯示、
顯示錯誤／解碼失敗保留剪影及後續重試、成功節點不重複解碼、圖片失敗仍開局、
總等待上限與逾時後切板取消、遲到完成不重複開局。使用可控計時器與 Image mock，
不等於實際 Safari／Chrome 的破圖、裁切與網路驗收。

## 0.30 基線

新增 victory-check.cjs、forecast-check.cjs，現為 17 支測試。
涵蓋夜間多來源同批死亡優先、第三方、待發槍、血月最後夜，以及票權、
守護／解藥／恐懼／夢境／騎士、繼承刀、隔離副本、搜尋上限、提示撤回。
白狼王與丘比特原測試的延後判勝斷言，已依 2026-10-15 家規改成即時判勝。
