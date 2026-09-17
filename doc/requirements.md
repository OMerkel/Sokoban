# Sokoban Requirements

## Purpose

This document lists the functional requirements (FR) and non-functional
requirements (NFR) for the Sokoban HTML5 application. It mirrors the
module boundaries described in
[software_architecture.md](software_architecture.md) so that each
requirement can be traced to the module that implements it and to the
automated test(s) that verify it.

## Requirement ID Scheme

- `FR-<MODULE>-nnn`: functional requirement owned by the named module
  (`RENDER`, `NAV`, `HMI`, `MAIN`, `BOARD`, `COMMON`, `LEVELS`), plus a
  cross-cutting `FR-E2E-nnn` group for whole-application workflows.
- `NFR-<CATEGORY>-nnn`: non-functional requirement grouped by quality
  attribute (`PORT`, `IMMUT`, `COVERAGE`, `QUALITY`, `DOC`, `PERSIST`,
  `A11Y`, `PERF`).
- "Verified by" cites the test file, the `describe`/`test.describe`
  block, and the exact test title(s) that cover the requirement.

## Functional Requirements

### Presentation layer — render.js

| ID | Requirement | Verified by |
| --- | --- | --- |
| FR-RENDER-010 | Compute a square board size that fits the available viewport, never smaller than a given minimum. | `render.test.js` › `computeBoardSize` › "picks the smaller of width/height, respecting the minimum" |
| FR-RENDER-020 | Clamp joystick/menu control icon sizes into a sane `[min, max]` pixel range. | `render.test.js` › `clampControlSize` › "clamps into the [min, max] range" |
| FR-RENDER-030 | Render every board cell type (wall, storage, box, boxOnStorage, sokoban, sokobanOnStorage) plus an info/completion text overlay. | `render.test.js` › `renderBoard` › "renders every cell type without throwing and appends an info text node" |
| FR-RENDER-040 | Render the warehouse-keeper as a posed sprite figure when the "warehouse keeper" display option is enabled. | `render.test.js` › `renderBoard` › "draws the warehouse-keeper figure as a group when enabled" |
| FR-RENDER-050 | Re-rendering must clear prior board content before drawing the new state, leaving no stale DOM nodes. | `render.test.js` › `renderBoard` › "clears previous content on re-render" |
| FR-RENDER-060 | Provide four clickable joystick controls (up/down/left/right) that invoke `onMove` with the matching direction. | `render.test.js` › `renderBoard` › "wires the four movement controls to onMove with the right direction" |
| FR-RENDER-070 | Show previous/next level-navigation controls only before the first move or once a level is completed; hide them otherwise. | `render.test.js` › `renderBoard` › "adds level-navigation controls that call onPrevious/onNext when shown", "omits the level-navigation controls when showLevelNav is false" |

### Presentation layer — navigation.js

| ID | Requirement | Verified by |
| --- | --- | --- |
| FR-NAV-010 | Exactly one `.page` element is visible at a time; the game page is shown by default. | `navigation.test.js` › `initNavigation` › "shows only the default game page on init" |
| FR-NAV-020 | Notify subscribers of which page became visible, including the initial page. | `navigation.test.js` › `initNavigation` › "notifies onShowPage with the initial page id" |
| FR-NAV-030 | Clicking a side-panel link to another page shows that page and hides every other page. | `navigation.test.js` › `initNavigation` › "navigates to another page when a matching anchor is clicked" |
| FR-NAV-040 | Clicking the hamburger control opens the side navigation panel. | `navigation.test.js` › `initNavigation` › "opens the panel when the hamburger anchor is clicked" |
| FR-NAV-050 | "Back"/"Close" links close the side panel and return to the game page. | `navigation.test.js` › `initNavigation` › "closes the panel and returns to the game page on back links" |
| FR-NAV-060 | Links that target a non-page element are ignored without navigating or throwing. | `navigation.test.js` › `initNavigation` › "ignores anchors that target a non-page element" |
| FR-NAV-070 | Clicking outside the open panel closes it; clicking the hamburger button itself does not close it. | `navigation.test.js` › `initNavigation` › "closes the panel when clicking outside of it", "keeps the panel open when clicking the menu button itself" |
| FR-NAV-080 | Expose `showPage`/`openPanel`/`closePanel`/`isPanelOpen` for programmatic control by other modules. | `navigation.test.js` › `initNavigation` › "exposes showPage/openPanel/closePanel for programmatic control" |

### Application layer — hmi.js

| ID | Requirement | Verified by |
| --- | --- | --- |
| FR-HMI-010 | On init, render the current level's header text and statistics (move/push counters, history, completion wording). | `hmi.test.js` › `createHmi` › "renders the initial level header and statistics after init" |
| FR-HMI-020 | Persist the current challenge/level index to storage on every render. | `hmi.test.js` › `createHmi` › "persists the current challenge index to storage" |
| FR-HMI-030 | Create and mount a single SVG board element inside the board container. | `hmi.test.js` › `createHmi` › "creates an svg element inside the board container" |
| FR-HMI-040 | Resume a previously persisted level index on startup; fall back to level 0 for a missing or corrupt value. | `hmi.test.js` › `createHmi` › "reads a previously persisted challenge index on init", "falls back to level 0 for a corrupt stored challenge index" |
| FR-HMI-050 | Moving the keeper updates the displayed move/push history live. | `hmi.test.js` › `createHmi` › "moves the sokoban and records history text" |
| FR-HMI-060 | Show a congratulatory message once the current level is solved. | `hmi.test.js` › `createHmi` › "completes level 0 after two pushes upward" |
| FR-HMI-070 | Next/Previous/Random controls switch levels, wrapping around the start/end of the level collection. | `hmi.test.js` › `createHmi` › "advances to the next level, wrapping past the last one", "goes to the previous level, wrapping before the first one", "random selects a level within bounds" |
| FR-HMI-080 | Restart resets the move/push history for the current level without changing the level. | `hmi.test.js` › `createHmi` › "restart resets the moves for the current level" |
| FR-HMI-090 | Undo reverts the last move/push and its displayed history. | `hmi.test.js` › `createHmi` › "undo reverts the last move" |
| FR-HMI-100 | Level-changing actions (restart/next/previous/random/undo) close the navigation side panel. | `hmi.test.js` › `createHmi` › "closes the navigation panel on level-changing actions when provided" |
| FR-HMI-110 | The board re-renders responsively when the window is resized. | `hmi.test.js` › `createHmi` › "re-renders on window resize" |
| FR-HMI-120 | Toggling the "show full info" or "warehouse keeper vs. red circle" options immediately re-renders the board and level info text accordingly. | `hmi.test.js` › `createHmi` › "re-renders when the options back/ok controls are used", "omits level info text when the level has no info and full info is unchecked", "shows level info text when full info is checked and the level provides one" |
| FR-HMI-130 | The keeper can be moved with the WASD keys or the arrow keys (in addition to the on-screen joystick), each key facing/moving the keeper in the matching direction. | `hmi.test.js` › `createHmi` › "faces the sokoban %s towards \"%s\"" (parameterized over w/a/s/d, their uppercase forms, and the four arrow keys), "pushes the box upward when \"w\" is pressed on level 0" |
| FR-HMI-140 | A handled movement key press calls `preventDefault` so the browser does not scroll the page; unrelated keys, modifier-key combinations, and key presses while a subpage covers the game board are ignored. | `hmi.test.js` › `createHmi` › "prevents the default action for a handled key so the page does not scroll", "ignores unrelated keys", "ignores key presses combined with a modifier key", "ignores key presses while a subpage is shown instead of the game page" |

### Application layer — main.js

| ID | Requirement | Verified by |
| --- | --- | --- |
| FR-MAIN-010 | A single bootstrap entry point wires navigation and the HMI together. | `main.test.js` › "main.js bootstrap" › "exposes a bootstrap function that wires navigation and the hmi" |
| FR-MAIN-020 | Start the application immediately if the document is already ready, or defer startup until `DOMContentLoaded` otherwise. | `main.test.js` › "main.js bootstrap" › "runs bootstrap immediately when the document is already ready", "defers bootstrap until DOMContentLoaded when the document is still loading" |

### Domain layer — board.js

| ID | Requirement | Verified by |
| --- | --- | --- |
| FR-BOARD-010 | Compute board dimensions (width, height) from a level plan of text rows. | `board.test.js` › `getDimension` › "returns the max row width and row count", "handles an empty plan" |
| FR-BOARD-020 | Build a rectangular cell model from a plan, padding short rows with the floor symbol. | `board.test.js` › `createModel` › "pads short rows with floor symbol" |
| FR-BOARD-030 | Create a fresh board state for a given level: empty move history, zero pushes, not completed, default facing direction. | `board.test.js` › `createBoardState` › "creates a fresh, non-completed state for a level" |
| FR-BOARD-040 | Query the symbol at a cell and match it against one or two symbol names, returning `undefined` outside the model bounds. | `board.test.js` › `cellAt / isPos / isPosEither` › "reads the symbol at a position", "returns undefined outside the model bounds", "matches a single symbol name", "matches either of two symbol names" |
| FR-BOARD-050 | Locate the warehouse keeper on the board, whether on a plain floor cell or a storage cell, or report its absence. | `board.test.js` › `findSokoban` › "locates the plain sokoban symbol", "locates the sokobanOnStorage symbol", "returns {-1,-1} when no sokoban is present" |
| FR-BOARD-060 | Determine level completion: true only when no plain storage or plain box cell remains on the board. | `board.test.js` › `isCompleted` › "is false while storage or boxes remain", "is true when no storage or plain box cell remains" |
| FR-BOARD-070 | Move the warehouse keeper onto an adjacent floor or storage cell. | `board.test.js` › `applyMove` › "moves the sokoban onto an empty floor cell" |
| FR-BOARD-080 | Push a box one cell forward when the keeper steps into it and the far cell is free, recording an uppercase push letter and incrementing the push counter. | `board.test.js` › `applyMove` › "pushes a box forward and records an uppercase push letter" |
| FR-BOARD-090 | Block moves/pushes into walls or otherwise illegal targets; a blocked attempt still records the attempted facing direction. | `board.test.js` › `applyMove` › "does not push a box into a wall", "records the attempted direction even when blocked" |
| FR-BOARD-100 | Mark a level completed as soon as every storage cell holds a box. | `board.test.js` › `applyMove` › "marks the level completed once every box reaches storage" |
| FR-BOARD-110 | Undo the most recent move or push, restoring the prior keeper/box position and the push counter; undoing with no history is a no-op. | `board.test.js` › `undoMove` › "is a no-op when there is no move history", "reverts a plain move", "reverts a push, restoring the box and the pushes counter", "fully reverts a two-step push sequence back to the initial state", and the parameterized "reverts a plain %s move" / "reverts a %s push" cases for all four directions |
| FR-BOARD-120 | Every level shipped with a recorded reference solution string must be solvable end to end by replaying that solution through `applyMove`. | `board.test.js` › "official level solutions replay to completion" › "has at least one level with a recorded solution", "solves \"%s\" by replaying its recorded solution" (parameterized over every level with a solution) |

### Domain layer — common.js

| ID | Requirement | Verified by |
| --- | --- | --- |
| FR-COMMON-010 | Provide the seven canonical Sokoban plan symbols: floor, wall, box, sokoban, storage, boxOnStorage, sokobanOnStorage. | `common.test.js` › "common constants" › "defines all seven Sokoban plan symbols" |
| FR-COMMON-020 | Provide four movement directions, each paired with its opposite direction and a distinct lowercase move / uppercase push letter. | `common.test.js` › "common constants" › "defines four directions with opposite pairs", "gives every direction a distinct move and push letter" |

### Data layer — levels.js

| ID | Requirement | Verified by |
| --- | --- | --- |
| FR-LEVELS-010 | Ship at least one playable level. | `levels.test.js` › "levels data" › "exposes at least one level" |
| FR-LEVELS-020 | Keep the level collection's symbol table in sync with `common.js` `SYMBOL`. | `levels.test.js` › "levels data" › "keeps its symbol table in sync with common.js SYMBOL" |
| FR-LEVELS-030 | Every level provides a non-empty plan made of plain text rows (strings). | `levels.test.js` › "levels data" › "gives every level a non-empty plan of strings" |
| FR-LEVELS-040 | Every level places exactly one warehouse keeper on its plan. | `levels.test.js` › "levels data" › "places exactly one sokoban on every level" |

### Cross-cutting — full application workflows

| ID | Requirement | Verified by |
| --- | --- | --- |
| FR-E2E-010 | On first load, the game board is visible and every subpage (rules, options, statistics, about) is hidden. | `app.spec.js` › "Sokoban application shell" › "shows the game board by default with all subpages hidden" |
| FR-E2E-020 | The hamburger button reveals the side navigation panel. | `app.spec.js` › "Sokoban application shell" › "opens the hamburger menu revealing the side navigation panel" |
| FR-E2E-030 | Navigating to the rules subpage hides the game board; navigating back restores it. | `app.spec.js` › "Sokoban application shell" › "navigates to the rules subpage, hiding the game board, then back" |
| FR-E2E-040 | Navigating to the options subpage hides the game board; the "Ok" control restores it. | `app.spec.js` › "Sokoban application shell" › "navigates to the options subpage and back" |
| FR-E2E-050 | Navigating to the statistics subpage hides the game board; the "Close" control restores it. | `app.spec.js` › "Sokoban application shell" › "navigates to the statistics subpage and back" |
| FR-E2E-060 | Navigating to the about subpage hides the game board; the "Back" control restores it. | `app.spec.js` › "Sokoban application shell" › "navigates to the about subpage and back" |
| FR-E2E-070 | A level can be solved end to end via the joystick controls, and the Statistics subpage reports successful completion. | `gameplay.spec.js` › "Sokoban gameplay" › "completes level 0 by pushing the box up twice" |
| FR-E2E-080 | Undo, triggered from the side panel, reverts the last push end to end. | `gameplay.spec.js` › "Sokoban gameplay" › "undo reverts the last push" |
| FR-E2E-090 | Next/Previous switch levels end to end, and the chosen level persists across a full page reload. | `gameplay.spec.js` › "Sokoban gameplay" › "next/previous switch levels and persist the choice across reload" |
| FR-E2E-100 | Restart clears the move history for the current level end to end. | `gameplay.spec.js` › "Sokoban gameplay" › "restart clears the move history for the current level" |
| FR-E2E-110 | A level can be solved end to end using the WASD keys or the arrow keys, matching the joystick-based workflow. | `gameplay.spec.js` › "Sokoban gameplay" › "completes level 0 by pushing the box up twice with the \"w\" key", "completes level 0 by pushing the box up twice with the ArrowUp key" |
| FR-E2E-120 | Keyboard controls are ignored end to end while a subpage covers the game board. | `gameplay.spec.js` › "Sokoban gameplay" › "ignores keyboard controls while a subpage covers the game board" |

## Non-Functional Requirements

| ID | Requirement | Verified by |
| --- | --- | --- |
| NFR-PORT-010 | The application must run on standard browser APIs only, without any runtime third-party JavaScript/CSS dependency (no jQuery, jQuery Mobile, or Raphael.js). | Architecture review (see "Goals" in software_architecture.md); exercised indirectly by every DOM-based unit test (`hmi.test.js`, `render.test.js`, `navigation.test.js`, `main.test.js`) and by the Playwright suite, which all run against native browser/jsdom APIs only. No dedicated "no third-party script tag" test exists. |
| NFR-IMMUT-010 | Shared domain constants must be immutable at runtime. | `common.test.js` › "common constants" › "freezes SYMBOL to prevent mutation" |
| NFR-IMMUT-020 | Domain state transitions must never mutate their input arguments; every transition returns a new state/model. | `board.test.js` › `withSokobanRemoved / withSokobanAt` › "does not mutate the input model"; `board.test.js` › `applyMove` › "does not mutate the input state" |
| NFR-COVERAGE-010 | Automated unit test coverage (statements, branches, functions, lines) must each be at least 96%. | Enforced by the `coverage.thresholds` configuration in `vitest.config.js` and checked on every `npm run test:unit` run. |
| NFR-QUALITY-010 | Application and test source must be free of Biome lint and formatting violations, with no rules suppressed inline. | `npm run lint:biome` (`biome.json`); no `biome-ignore` comments are present in the codebase. |
| NFR-DOC-010 | Project Markdown documentation must be free of markdownlint violations. | `npm run lint:md` (`html5/.markdownlint-cli2.jsonc`, root `.markdownlint.jsonc`). |
| NFR-E2E-010 | Core user workflows (navigation shell and gameplay) must be validated against a running, locally served build, not only in isolation with mocked DOM. | `app.spec.js`, `gameplay.spec.js` (Playwright, `playwright.config.js`). |
| NFR-PERSIST-010 | The player's level progress (current challenge index) must survive a full page reload. | `gameplay.spec.js` › "Sokoban gameplay" › "next/previous switch levels and persist the choice across reload"; `hmi.test.js` › `createHmi` › "persists the current challenge index to storage", "reads a previously persisted challenge index on init" |
| NFR-A11Y-010 | Base HTML accessibility: the document declares its language and every `<img>` provides a text alternative. | Fixed and checked via the Biome `lint/a11y/useHtmlLang` and `lint/a11y/useAltText` rules surfaced in the editor; not yet covered by an automated test or by `npm run lint:biome`, since `index.html` is outside the current Biome `files.includes` scope. |
| NFR-PERF-010 | Board rendering must stay lightweight, using native SVG DOM APIs without a rendering framework. | Not covered by an automated performance test; validated by architectural review (`render.js` has no framework dependency) and by the absence of dropped frames observed during manual play. |

## Traceability Notes

- Every `FR-*` and `NFR-*` row above cites at least one automated test,
  except `NFR-A11Y-010` and `NFR-PERF-010`, which are called out
  explicitly as not yet automated so this gap stays visible rather than
  being silently assumed covered.
- When adding a new requirement, add a corresponding test first (or in
  the same change) and record its exact test title here, following the
  existing `describe`/`test.describe` › test title citation style.
