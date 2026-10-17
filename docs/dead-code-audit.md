# 0.48.1 靜態分析與 Dead Code Review

性質：本輪稽核紀錄，非「全站零 dead code」證明。規則、存檔契約及動態操作入口不因清理而改動。

## 方法與範圍

- Review build.cjs 的 29 模組載入順序；src 全部 JS／四份 CSS、建置與 dev 工具、全部回歸測試的入口和引用。
- `node scripts/static-audit.cjs` 可重跑保守詞彙引用掃描，包含 inline HTML handler 字串及測試引用，不安裝新依賴。
- 手動檢查覆寫／wrapper、只寫不讀狀態、DOM reconciliation、條件分支、備援呈現與 localStorage／遷移欄位；語法及行為用乾淨 build／npm test 交叉檢查。
- 掃描不是 AST／控制流分析：註解與屬性名稱會增加引用數，不分析作用域；只列每個 let／const 的第一個 binding。因此「無候選」不代表沒有 dead code。CSS 未命中單一對局也不代表可以刪除。

## 已安全移除

| 位置 | 移除 | 證據／影響 |
| --- | --- | --- |
| src/game-controller.js | gameNote() | production 與測試沒有呼叫；現行入口 saveHostNote() → GameEngine.note()，未改 note 驗證 |
| src/mechanical.js | MREG | 定義後無引用；現行認牌使用 mechRegRoles()，舊常數不是規則來源 |
| src/game.js | presentationLight 與 finishPresentation 的 light 參數 | 只有初始化／賦值，無讀取；scenePhase／body dataset 與 village 繪製保持 |
| src/game.js | setup early-return 後多餘的 phase 條件 | setup 已直接 return，後續無條件清除 setupBoardFocus 等價 |

## 保留並標注的風險

| 項目 | 為何不刪／下一步 |
| --- | --- |
| cupidSeatStatus() | production 詞彙掃描只有定義，但 cupid-check 直接驗證發言／關係文案；涉及規則 query 相容，不能為清理刪掉斷言。後續先確認 API 消費者與替代測試 |
| app.view.js 的原 render() | 正式 build 最終被 game.js render 覆寫，但多支舊 VM 測試只載入早期模組；移除需先統一測試 loader／確認 standalone 使用。保留，不宣稱 production 主入口 |
| mainUI()／各板 *.view.js／engine-pane | 不是全部死碼：管理實際搬移 engine-pane；select id 仍供 register／shoot／badge controller adapter 使用。直接刪除會造成耦合斷裂 |
| dayModel() 的 elect=false 舊競選分支、actionTray() setup／candidates、confirmGame() candidates | 看似不可達，但 controller 有獨立函式呼叫／測試、sheriff adapter 與 model 契約；須專項等價證明及八板／競選回歸，不在本輪重構 |
| stoneFirstNight／舊板子欄位 | 部分現行僅初始化，仍會進存檔／撤回／forecast 副本。刪除會影響序列化契約；需要 migration 決策 |
| 各板 base／wrapper、GameEngine／RoleSystem 物件方法 | 函式可作引用或動態屬性呼叫，名稱次數不足以判死碼；載入順序和純規則邊界不可破壞 |
| village-render 非 graphic painter、城市／肖像剪影與原生 dialog adapter | 正常模式看不到不等於無用，圖片失敗、VM 與不支援 dialog 等情況仍需備援；不刪失敗處理 |
| 舊 pawn／daylight CSS 與零星元件 | 部分被 graphic-play 覆寫，仍有備援 markup／media cascade／夜日狀態依賴；需逐 selector 對照及真實多流程 coverage，不能以一次 Chrome coverage 刪除 |
| 技術名稱 moonlit、localStorage key | 舊名稱不是 dead code；package／工具 identity 與已存對局相容保持 |

## 驗證結果與界線

Node v24.22.0：npm test 26 支、0 失敗；role-system boundary、build、diff check 通過。清理後詞彙掃描 29 JS／26 測試，只剩 cupidSeatStatus 單一定義候選（測試有引用，保留）。

Chrome：320×700、390×844、430×932、844×390、1280×800 的選板 Beta 皆可見、headerFits=true、無整頁橫向溢出；320px 真實截圖確認文字與徽章不重疊。未完成 iPhone／Android 全對局、所有備援環境與瀏覽器 coverage；未推送／部署。未刪測試斷言來遷就清理。
