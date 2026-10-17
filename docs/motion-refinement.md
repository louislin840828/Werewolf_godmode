# 0.46.1 動畫修正：第二階段

性質：0.46.1 動畫決策／驗收紀錄；下列時間規格目前沿用，角色素材已於 0.48 更新，當前測試數見 testing.md。

## 規格

- 局部內容／結果 160ms opacity，抽屜進場 180ms、離場 140ms，方向位移 ±6px。日夜場景仍 400ms。
- 回合只更新世界標題、dock-body、投票結果；Canvas、座位、底部主確認不加入位移。選取不重播同回合轉場。
- 投票結果納入 stage／local-result selector。
- compact 夜間回合提示仍顯示 1200ms；前後約 156ms 淡入淡出，無縮放／位移。data-transition-key 讓新回合重建提示，同回合沿用節點。靜態場景／reduced-motion 不做此動畫。
- 日夜先繪新背景，舊非互動 Canvas 覆蓋至插畫解碼完成，再淡出。等待最多 600ms；超時／失敗淡出至備援，不影響任何控制項。新階段／resize 正常繪製，過期 Promise 不重畫。
- 快速環境切換會取消舊動畫、移除舊場景副本、清除等待 timer。動畫不作為規則提交的時鐘。

## 驗證

Node v24.22.0：24 支全套測試；新增 scene-transition-check 驗證已解碼交接、慢載上限、過期 Promise 與 reduced-motion 清理。presentation-check 更新實際 6px／160ms 規格，保留同回合不重播、靜態導覽與 reduced-motion 契約。

Chrome 獨立測試 session，390×844：讀取實際 Web Animations，抽屜進場 180ms／6px、詳情 160ms／6px；回合提示 fixture computed style 為 ink-role-pass／1.2s。模擬 reduced-motion 後抽屜動畫數 0、離場副本 0，提示 animation-name 為 none。

上述為瀏覽器動畫接入與屬性檢查，不是影片流暢度或完整對局驗收。尚待 iPhone／Android、真實日夜交接、低速網路、快速跨回合、實際第二夜提示、投票結果全流程及效能驗收。未重新宣稱完成 RWD。角色素材與 controller／規則／存檔不變；只提交本機，不推送／部署。
