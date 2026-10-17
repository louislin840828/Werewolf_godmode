# 月夜議會 maintenance contract

User priority: visual/UI changes must not change the underlying Werewolf rules.

Start at `README.md`, `docs/architecture.md` and `docs/boards.md`.
Read `docs/development-handoff.md` for localStorage persistence, migration/hosting
limits and handoff scope. Full game-save export/import is deferred by the user;
it is not a deployment prerequisite. Do not confuse portrait cache with game saves.

## Boundaries

- `src/rules/role-state.js`: pure shared role schema, death factors, ability restrictions,
  faction/edge classification, inheritance timing, migration and events. No browser APIs.
- `src/app.js`, `src/boards.js`, and the seven board / election `.js` files: game rules
  and board adapters. No HTML, CSS or DOM access. Existing board fields remain the
  authoritative write format; RoleSystem projects them into one common schema.
- `src/role-runtime.js`: shared integration, versioned save migration, structured journal,
  compact undo checkpoints, common death/shot/winner policies and GameEngine boundary.
- `src/game-controller.js`: validated user intents, turn contracts and host input adapter.
  UI-only selection state is separate from authoritative game state.
- `src/*.view.js`, `src/game.js`, `src/game.css`, `src/village-render.js`, role imagery:
  presentation. Read frozen `viewState()` / `GameEngine` snapshots. Submit named
  controller/engine actions. Do not access live `s`, mutate game fields, or invoke
  `kill`, `checkWin`, `newNight`, or `mutate` from a view.

A layout, color, portrait, animation, popup or mobile UI request should be implemented
in presentation files. Changing a controller is acceptable only for the requested
interaction; keep its game-rule validation contract intact. Do not silently adjust rules.

## Visual design contract

Detailed tokens, component states and phase-one scope: [docs/visual-design.md](docs/visual-design.md).

- 真人上帝的手機輔助器：全知視角觀察共享中古城市；主持節奏與最終決定留給上帝，操作後能迅速抬頭回到現場。
- 粗獷圖像小說：不規則墨線、乾筆陰影、克制印刷質感與色塊；避免擬真 3D、RPG 金屬框、滿版發光與密集裝飾。沿用可替換角色素材，不重生、不降品質。
- 金色用於技能／目標／連線／確認，含狼人技能；緋紅僅表達狼人美術力量。投票選取為中立灰藍／石色，不依陣營變色。出局、停用、錯誤有獨立語意並附文字／形狀，不只靠顏色。
- 日夜共用主要構圖、固定環繞座位與操作結構；白天是天亮城市，不強迫面板亮底。短內容填滿剩餘空間。
- 玩家是獨立命運標記，不綁房屋；座號優先、整個標記可點、不因死亡／行動重排。背景安靜，不干擾文字或多對一／一對多技能線。
- 操作媒介採墨色底與少量筆線；選取摘要保留固定空間，主確認不位移。保留取消／修改／棄票／撤回／警徽等既有入口，不增加拖曳、長按、蓄力或動畫等待。
- 動態只解釋變化、不阻擋操作，支援 reduced-motion；保留節點與圖片準備快取，不逐局清除重載。
- UI 不得改變底層規則、已確認家規、controller 驗證或存檔契約。先交付夜間行動／白天討論／投票供確認，再延伸其他頁面；未有真實瀏覽器验收不得宣稱完成 RWD。

## City artwork and visual delivery (0.45)

- `src/assets/scenes/` contains the shared day/night city; `src/assets/ui/` contains
  ink material and decorative SVG masks. Build copies all `src/assets/` byte-for-byte.
- Preserve image dimensions and lossless quality. Do not reset cityArtwork or the
  existing portrait caches when starting another game. Async city callbacks must
  check the current canvas/signature and must not trigger a game-state change.
- Medium edges are decorative (`pointer-events:none`); keep live text and controls
  above artwork. Voting masks inherit neutral vote color, not gold/faction color.
- Mobile markers retain at least 44px hit areas with stable shared line coordinates.
  Run city-art-check through npm test; numeric geometry does not prove browser RWD.
- Deliver patches with `--binary --full-index`, lock their base commit, and verify
  applying/building/testing in a clean checkout. Never force a failed apply.

## Required checks

For a complete regression baseline run `npm test` (or `node test-all.cjs`). This
builds/tests current source in a clean temporary directory; do not rely on stale
files in the checkout's `dist/`. See `docs/testing.md` for scope and limits.

For any UI or rule change: `node role-system-check.cjs` (includes boundary guards).
For a controller/rule change, also run applicable board regressions and the UX,
undo/migration checks. Run `node build.cjs` before Site packaging.
Do not install a browser or start an improvised preview when control-browser is absent.

## Confirmed house rules (2026-10-14)

- Only blood messenger daytime self-explosion seals good powers the next night.
  Ordinary-wolf exile and the final-blood-wolf exile never seal powers by themselves.
- Any heartbreak factor forbids a death gun, including simultaneous direct knife/poison
  deaths of both lovers. A sole original death does not acquire heartbreak merely
  because it causes the partner's suicide.
- Repeat-dream death and dreamer-death collateral both forbid hunter shooting.
- Third-party members retain their physical role and original wolf/god/villager edge.
- Undo restores resources, death causes, relationships, alignment, confirmed information,
  structured events and pending skills together.
- Ordinary wolves all dead: independent wolf knife starts next night, not mid-night.

## Victory rules updated 2026-10-15

Read docs/victory-and-forecast.md before changing resolution or forecasting.
Night edge priority applies to the complete effective death batch, regardless of
source. Automatic collateral resolves before victory; optional guns/carry resolve
only if victory is still undecided. Physical wolf edge and victory allegiance differ.
Forecasting must reuse production rules, preserve hidden action information and
return unknown on unsupported cases/budget exhaustion. Never mutate the real game
while exploring branches. Run victory-check and forecast-check plus the full suite.
