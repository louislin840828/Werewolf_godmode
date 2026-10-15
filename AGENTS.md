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
