# 0.48.1 全文件 Review 與維護分類

性質：本輪稽核紀錄及文件用途索引。範圍涵蓋全部 22 份既有專案 Markdown（排除 node_modules／.git／工具外部文件）、HANDOFF.json 與 build／package／Hosting 設定對照；本輪另新增 dead-code-audit.md 與此文件。沒有將舊版本測試數改寫為新數字、沒有憑文件推斷已部署或完成實機。

## 當前狀態／契約（更新時以現況為準）

| 文件 | 存在目的／本輪處理 |
| --- | --- |
| README.md | 現行產品與啟動入口；移除連串歷史版摘要，指向 CHANGELOG。更新版號、Node、分支／部署限制與新圖／圖鑑 |
| AGENTS.md | 開發邊界與已確認家規；保留規則，補現行素材／全介面與本機授權，歷史第一階段不再限制當前範圍 |
| .agents/skills/moonlit-check/SKILL.md | 驗證流程；品牌更新，保留技術 skill 名稱兼容 |
| docs/architecture.md | 當前模組／串接／UI 邊界；修正 CSS 載入順序、城市插畫、全介面、6px 動態及歷史 manifest 狀態；標明舊 render 僅早期 loader |
| docs/boards.md | 已確認八板家規；標示最近規則更新而非過期產品版號，未更動規則 |
| docs/role-system.md | schema v1／死因／角色權限契約；現況相符，內容保留 |
| docs/victory-and-forecast.md | 正式勝負／預測邊界；移除手機清單要求歷史版號，不修改判勝條件 |
| docs/development-handoff.md | 保存／快取／搬站限制；改為當前交接，八板／26 支／新版圖，歷史 0.30.3 來源獨立標示 |
| docs/agent-handoff.md | 新代理操作入口；移除七板／17 支／固定舊版本，區分 runtime 與 Wrangler 開發依賴；先尊重既有 Git／本機授權 |
| docs/deployment.md | 可選 Hosting 發布操作；區分 ZIP 與現有 checkout，不再稱尚未建立 repository，未宣稱部署。保留來源／localStorage／快取及授權限制 |
| docs/known-issues.md | 當前開放問題／待驗收／刻意不做；修正舊設計已替換現況，納入新圖 33.53 MB 需量測，本夜預測範圍 |
| docs/mobile-acceptance.md | 現行實機驗收清單＋歷史 Chrome 背景；移除已不存在的隱藏畫面待測與舊限定範圍，加入 Beta／新圖／圖鑑／SVG |
| docs/visual-design.md | 現行視覺 token／互動契約；修正 CSS 順序、全介面／共享城市／新圖，歷史第一階段敘述明確標示 |
| docs/visual-assets.md | 正式來源與替換＋素材 provenance；新版 src 來源已符合現況，0.45 提示保留來源追溯 |

## 歷史紀錄（保留當時版本／環境／驗收，補後續狀態）

| 文件 | 存在目的／本輪處理 |
| --- | --- |
| CHANGELOG.md | 各版變更／驗收歷史；加入整體用途與 0.48.1，不把歷史 17／22 支或未合併改寫成現況 |
| BACKLOG.md | 版本 17 的歷史修正，不是當前 backlog；已指向 known-issues，保留 |
| docs/visual-redesign-acceptance.md | 0.45 Patch 鎖定基準／安全套用與當時測試；補使用者驗收、c99ee5a／main，明示不能對目前 HEAD 重套／reverse |
| docs/interface-consistency.md | 0.46 決策／部分 Chrome 結果；補後續動畫／角色圖更新，保留當時 23 支 |
| docs/motion-refinement.md | 0.46.1 動畫規格與當時驗收；規格仍沿用，補當前角色圖更新／測試入口 |
| docs/role-atlas.md | 0.47 真實 Hidden 問題、圖鑑設計／當時圖片保護；補 0.48 分支已移除、新圖正式來源，舊 dist 備份不是現行策略 |
| docs/aurawolf-brand.md | 0.48 品牌／素材決策、清理與 Chrome 證據；補 0.48.1 後續 Beta／清理入口 |
| docs/testing.md | 混合：開頭現行指令／基線，後段按版歷史測試；更新當前 26 支／Node 24.22.0，明示後段不代表現況 |
| docs/history/handoff-0.30.3.json | 原 HANDOFF.json 原位元組封存；hash 只驗證舊 ZIP，不用作當前 manifest、不偽造新 checksum |

## 跨文件一致性與範圍

- 產品目前為 Aurawolf｜全知之人、八板／12 席及指定 10 席、24 張新版角色圖；技術 package name／localStorage key 保留。
- 全介面一致性已接入；0.45「抽屜未改」與 0.47「舊 Hidden 保留」只留在歷史上下文，不能當作當前狀態。
- Node／VM 全套與 Chrome 部分檢查、手機實機完整對局分開記錄。0.45 真人驗收依使用者回報，不補造手機裝置紀錄。
- 本機已有 Git；後續工作不合併 main、不推送、不部署。Hosting 文件是操作參考，不是授權。
- 本輪搜尋並檢查相對 Markdown 文件連結／引用檔案；封存 manifest 的檔案路徑是歷史 hash key，刻意不逐項改寫。外部 Hosting 文件未重新做線上服務選單驗證，發布時另查。
- 新文件不改寫遊戲規則；未確認的 dead code／相容性負擔集中於 dead-code-audit.md，避免後續代理誤刪。
