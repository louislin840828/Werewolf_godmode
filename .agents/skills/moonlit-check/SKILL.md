---
name: moonlit-check
description: 驗證月夜議會的介面或規則變更。當使用者要求回歸測試、靜態檔驗收或手機介面驗收時使用。
---

# 月夜議會驗證流程

1. 閱讀 AGENTS.md、docs/testing.md，以及本次變更涉及的文件。
2. 查看 Git 差異，辨認改動屬於畫面、控制器或遊戲規則。
3. 確認 Node.js 為 24.x，執行 npm test，回報實際通過的測試數量。
4. 若要交付靜態檔，執行 npm run build，確認 dist/index.html 與角色圖片存在。
5. 若涉及手機介面，依 docs/mobile-acceptance.md 列出實機驗收項目。只有真的使用手機或真實瀏覽器檢查過，才能標示通過。
6. 分別回報「自動測試」「瀏覽器／手機驗收」「未驗證項目」。