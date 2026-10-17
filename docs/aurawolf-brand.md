# Aurawolf｜全知之人：0.48 品牌與素材更新

## 正式來源

使用者指定的新 24 張 1024×1024 WebP 原先只位於 dist/assets/roles。本版逐檔原位元組複製至 src/assets/roles，取代舊來源，建置後兩處一致。不降畫質、不再恢復舊圖。Git 歷史仍可追溯，未重寫歷史。

正式修改圖片請使用 src/assets/roles；dist 是建置輸出，直接修改會在下次 build 被覆蓋。圖片沿用原檔名，舊瀏覽器可能需要重新整理／清除 HTTP 圖片快取；不要清除 localStorage 對局資料。

## Hidden 清理

刪除 app.js 的 hidden UI 狀態、兩個 render 中的遮罩分支、presentationHidden 動畫條件、veil-screen 全部專用 CSS，以及舊控制台的隱藏入口／提示。沒有依賴它的規則或存檔欄位，不需要 migration。

保留 HTML hidden（未顯示的 engine-pane）、aria-hidden（裝飾 SVG／非互動離場副本）、CSS overflow:hidden 與勝負推算的未公開資訊，這些不是移除的隱藏模式。

## 品牌與圖示

標題／metadata／首頁／遊玩 HUD／setup model／備援控制台／復盤文字與檔名更新為 Aurawolf｜全知之人。主持規則中「上帝」仍指實體主持角色，不全面改寫口令或規則用語。package name、localStorage key 保留技術相容。

紀錄採文件、管理採完整閉合齒輪、圖鑑採角色卡冊。SVG 加入 data-icon，DOM keyed reconciliation 按圖示名稱重用，避免不同圖示沿用不相容子節點。手機標題不擠壓三個入口，保留文字標籤與 44px 以上目標。

## 驗證

新增 branding-check：品牌標題／model／匯出、無 hidden 模式／veil 樣式、不同 keyed SVG、來源與 build 素材位元組一致。全套 Node 24、角色邊界與 build。

Chrome 390×844 截圖確認品牌和三個不同完整圖示；320×700、390×844、430×932、844×390 headerFits=true、無整頁橫向溢出。手機實機／全部圖片逐張視覺品質與低網路效能仍未驗收。只提交本機、不推送、不部署。
