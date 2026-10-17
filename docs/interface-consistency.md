# 0.46 介面一致性：第一階段

性質：0.46 第一階段實作／驗收紀錄。動畫於 0.46.1 完成接入；角色素材於 0.48 更新。下列測試數與未驗收項目是當時紀錄，現況見 testing.md／known-issues.md。

## 範圍

以 0.45.0-beta.1 城市、墨色材質、筆線與色彩語意為基準。延伸至選板／配置詳情、名冊／玩家詳情、紀錄／筆記、管理／設定／計時、罕見遊玩卡與主操作；不換角色素材、不改場景構圖、不做第二階段動畫微調。

新增 src/interface-theme.css 共用 ui-* token。舊版版面與命名操作保留，以 component selector 修正舊抽屜 blanket button 覆蓋；遊玩中已驗收的 commit／vote 按鈕仍由 graphic-play.css 管理。

## 站內系統視窗

- src/host-dialog.view.js 以原生 dialog top layer 提供確認、文字輸入及提示；內容轉義，取消／Escape、輸入焦點與關閉後返回焦點。
- app.js host adapter 呼叫服務，等待不建立 checkpoint、不消耗資源。確認前比對完整權威 state，變更後舊 intent 不執行。
- undo、重新認牌、無警長、普通狼人自爆、reset 與縮編保持原本驗證及 mutation 閉包。自爆仍先輸入，再檢查原資格，再確認。
- 配置與 reset 增加完成回呼；選板僅成功後開始認牌，取消縮編重畫原選單，取消開新局不清除抽屜／選取。
- 不支援 HTMLDialogElement 的環境保留原生同步視窗。VM 基線走原生 adapter，新增測試另注入 deferred service 驗證非同步契約。
- dialog／callback 不保存到 localStorage；key 與 schema 不變。

## 已執行檢查

Node v24.22.0：全套 23 支（包含 host-dialog-check），0 失敗。測試在乾淨暫存目錄建置；24 張角色位元組不變。新增案例：取消撤回／開新局／縮編／無警長／自爆、完成回呼、過期確認與原狼人資格。

獨立 Chrome 預覽 http://127.0.0.1:4174：

- 390×844 實際查看選板、板子詳情、管理、名冊與未確認玩家詳情，截圖與 computed style 為新版墨色。
- 320×700、390×844、430×932、844×390、1280×800：三抽屜量測無全頁橫向溢出（屬版面 smoke check，不代表逐畫面視覺驗收）。
- 站內開新局確認取消保持管理／準備階段；Escape 取消縮編保留 12 席與 standard12 顯示。
- 經典板確認後成功進夜間認牌；角色準備流程仍保留。
- prompt／alert 以服務 fixture 確認真實 dialog、輸入焦點、墨色材質與 Escape 清除；不是已走完實際自爆流程。

## 尚待驗證

iPhone Safari／Android Chrome 實機、軟鍵盤與安全區、長資訊的詳細閱讀與捲動、日間名冊／所有已認牌詳情、八板完整對局、實際自爆二段確認、低網速／多分頁、reduced-motion 裝置驗收。此次不宣稱完成全 RWD。未推送遠端、未部署。
