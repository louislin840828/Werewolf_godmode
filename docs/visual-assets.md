# 視覺素材來源與替換

0.45 使用本次對話的內建 imagegen 產生／編輯，不使用外部素材庫，不更換24張角色圖。

| 檔案（src/assets/ 下） | 尺寸 | 用途 |
| --- | --- | --- |
| scenes/city-night-v1.webp | 1086×1448 | 先前確認的城市夜景；極光、河道、石橋與山城 |
| scenes/city-day-v1.webp | 1086×1448 | 以同一夜景為編輯參考的白天版 |
| ui/ink-surface-v1.webp | 1254×1254 | 墨色媒介材質；不包含文字／介面 |
| ui/power-frame-v1.svg | 向量 | 程式編寫的筆線確認／已選框；顏色由 CSS mask 決定 |
| ui/medium-edge-v1.svg | 向量 | 程式編寫的場景與媒介交界筆線 |

三張 PNG 產圖輸出轉無損 WebP，轉換時逐像素比較 RGBA 相同，保留原尺寸。WebP 即為可保真取回的主素材；不另重複保存 PNG。建置輸出 dist/assets/ 為相同位元組。新版本素材請另命名 v2 並更新 CITY_ART／CSS 引用，避免同 URL 舊磁碟快取。

## 夜景方向

同一座城市、全知高處斜俯視、河道與拱形石橋、右上高塔、遠山與克制極光。中古石造／木骨房屋；粗墨線、乾筆與印刷圖像小說質感，靛藍灰夜色、零星暖窗。完整場景而非角色剪貼或12棟對應玩家的住宅。背景不得畫座號、按鈕或文字。

## 白天版實際編輯提示

參考圖：夜景原圖。內建 imagegen，lighting-weather 編輯。

> Use case: lighting-weather. Edit this exact medieval city illustration into its daytime counterpart for a graphic-novel mobile game. Keep EXACT same camera, framing, city buildings, river, bridges, cathedral tower, mountains, foreground rooftops, drawing contours and 3:4 aspect ratio. Change ONLY time of day, sky, lighting and color palette. Soft overcast morning daylight, desaturated stone, muted blue-gray rooftops, pale warm sky, gentle golden cloud light, calm mysterious life. Windows no longer brightly lit. The aurora has faded to an almost imperceptible faint gold veil at top. Preserve rough hand-inked linework, drybrush shadow, printed graphic novel texture. Illustration must look drawn, not photographic or glossy 3D. Quiet restrained contrast as an interactive scene background. No people in foreground, no interface, no circles, no writing, no border. Full bleed high quality.

此處「EXACT」是製作約束，生成式編輯仍可能有局部細節差異；本輪檢視結果主要鏡位、河道、橋與高塔對應，不宣稱日夜像素級幾何完全一致。

## 墨色媒介實際生成提示

內建 imagegen，無參考圖，stylized-concept。

> Use case: stylized-concept. Production material texture for a dark graphic-novel game interface, NOT a mockup. Square full-bleed flat ink surface only, deep midnight charcoal blue #101a22. Tactile handmade ink on coarse paper, scumbled drybrush marks and very subtle etched organic fibers, low contrast near-black marks. Rich physical printed texture but quiet and consistently dark so cream text will remain legible over every region. Soft irregular brush grain at varied scales, avoid pure uniform digital noise. No borders, no frame, no gold, no bright areas, no gradients, no letters, no symbols, no objects, no city, no UI. Flat evenly lit material scan, not glossy and not 3D. 1024 by 1024.

工具實際輸出 1254×1254；未為符合提示中數字而縮圖。CSS 以512px材質尺寸使用並疊低透明墨色層，保持文字可讀；操作框與力量筆線另以SVG繪製，避免把固定尺寸圖片中的文字／按鈕拉伸。
