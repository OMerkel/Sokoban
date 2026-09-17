# Sokoban Software Architecture

## Goals

- No runtime dependencies on third-party JavaScript/CSS libraries.
- Move to modular ES modules with clear boundaries.
- Isolate board rules from rendering and from DOM/page navigation.
- Prefer immutable state transitions and pure domain logic.
- Keep the UI layer thin and focused on rendering and events.

## Architectural Style

The application follows a layered, module-oriented frontend architecture.

- Presentation layer: SVG rendering and page/panel navigation.
- Application layer: orchestration of user intentions and game flow.
- Domain layer: board rules, move/push validation, state transitions.
- Data layer: the curated level collection (plans, hints, solutions).

The architecture favors the following properties.

- Pure functions for domain transitions.
- Small modules with single responsibility.
- Dependency inversion from orchestration to abstractions (module APIs).
- Side effects isolated in the render/navigation/hmi/main modules.

## Module Overview

- html5/src/js/main.js: bootstraps navigation and the HMI on
  `DOMContentLoaded`.
- html5/src/js/hmi.js: application-layer orchestration. Wires DOM
  controls, keeps the current board state, and delegates rendering.
- html5/src/js/navigation.js: vanilla replacement for the jQuery Mobile
  page/panel router (hamburger menu, side panel, subpages).
- html5/src/js/render.js: pure SVG drawing for the board, sprite, and
  joystick controls, replacing the former Raphael.js dependency.
- html5/src/js/board.js: pure board model transitions and queries.
- html5/src/js/common.js: immutable symbol and direction constants.
- html5/src/js/levels.js: the curated level collection (plans, info
  text, and reference solutions).
- html5/src/css/index.css: layout and theming for the header, pages,
  and side panel.
- html5/src/test/unit/: unit tests for all modules.
- html5/src/test/e2e/: end-to-end tests for navigation and gameplay.

## SOLID Mapping

- Single Responsibility Principle: each module has a clear, bounded
  purpose (domain, rendering, navigation, orchestration).
- Open/Closed Principle: new levels are added by extending the level
  collection without touching board or render logic.
- Liskov Substitution Principle: all four movement directions satisfy
  the same shared direction contract.
- Interface Segregation Principle: consumers call narrow function
  exports instead of a monolithic class API.
- Dependency Inversion Principle: main.js depends on init APIs
  (`initNavigation`, `createHmi`), not on internals.

## Functional Programming Practices

- Immutable state updates in board transitions (`applyMove`,
  `undoMove`) that always return a new state object.
- Pure selectors and derivations (`isCompleted`, `findSokoban`,
  `getDimension`).
- Referential transparency in board queries (`isPos`, `isPosEither`,
  `cellAt`).
- Side effects restricted to render.js (SVG DOM), navigation.js
  (page/panel DOM), and hmi.js (event wiring, localStorage).

## Use Case Diagram

```mermaid
flowchart LR
  Player([Player])
  UC1([Start or restart a level])
  UC2([Move the warehouse keeper])
  UC3([Push a box onto storage])
  UC4([Undo the last move])
  UC5([Switch to next/previous/random level])
  UC6([Open the hamburger menu])
  UC7([View rules, statistics, options, or about])

  Player --> UC1
  Player --> UC2
  Player --> UC3
  Player --> UC4
  Player --> UC5
  Player --> UC6
  Player --> UC7
```

## Class Diagram

```mermaid
classDiagram
  class Main {
    +bootstrap(doc, win)
  }

  class Navigation {
    +initNavigation(options)
    -showPage(id)
    -openPanel()
    -closePanel()
  }

  class Hmi {
    +createHmi(doc, win, storage)
    -render()
    -resize()
    -move(directionName)
    -undo()
    -next()/previous()/random()/restart()
  }

  class Render {
    +renderBoard(svg, state, boardSize, options)
    +computeBoardSize(width, height)
    +clampControlSize(size)
  }

  class Board {
    +createBoardState(challenge, level)
    +applyMove(state, directionName)
    +undoMove(state)
    +isCompleted(model)
    +findSokoban(model)
  }

  class Common {
    +SYMBOL
    +DIRECTIONS
    +STORAGE_KEY_CHALLENGE
  }

  class Levels {
    +levels.setup
  }

  Main --> Navigation : bootstraps
  Main --> Hmi : bootstraps
  Hmi --> Board : uses domain API
  Hmi --> Render : uses rendering API
  Hmi --> Levels : reads level data
  Board --> Common : uses symbols/directions
  Render --> Common : uses directions
  Board --> Levels : builds initial model
```

## Sequence Diagram - Manual Play

```mermaid
sequenceDiagram
  actor Player
  participant Render as render.js
  participant Hmi as hmi.js
  participant Board as board.js

  Player->>Render: Click a joystick direction control
  Render->>Hmi: onMove(directionName)
  Hmi->>Board: applyMove(state, directionName)
  Board-->>Hmi: newState (immutable)
  Hmi->>Render: renderBoard(svg, newState, boardSize, options)
  Render-->>Player: Redraw SVG board
  Hmi-->>Player: Update header and statistics text
```

## Navigation and Subpages

The hamburger menu, side navigation panel, and full-screen subpages are
implemented without any third-party router. Exactly one `.page` element
is visible at a time; the game board and its joystick controls live in
`#game-page`, which is hidden whenever a subpage (rules, options,
statistics, about) is shown, and vice versa. The side navigation panel
overlays whichever page is currently visible.

### Navigation Sequence

```mermaid
sequenceDiagram
  actor Player
  participant Nav as navigation.js
  participant DOM as HTML DOM

  Player->>Nav: Click hamburger button
  Nav->>DOM: left-panel.classList.add('open')
  Player->>Nav: Click a subpage link (e.g. "Rules...")
  Nav->>DOM: hide all .page elements
  Nav->>DOM: show the target .page element
  Nav->>DOM: left-panel.classList.remove('open')
  Player->>Nav: Click "Back"/"Close"/"Ok"
  Nav->>DOM: show #game-page, hide the subpage
```

## Activity Diagram

```mermaid
flowchart TD
  A[Start/restart level] --> B[Create initial board state]
  B --> C[Render board and statistics]
  C --> D{Player input}
  D -- direction control --> E[applyMove]
  D -- undo --> F[undoMove]
  D -- next/previous/random --> G[createBoardState for new level]
  E --> H{Box reaches every storage cell?}
  H -- yes --> I[Mark level completed]
  H -- no --> C
  F --> C
  G --> C
  I --> C
```

## State Diagram

```mermaid
stateDiagram-v2
  [*] --> Solving
  Solving --> Solving: Move (floor/storage target)
  Solving --> Solving: Push (box onto floor/storage)
  Solving --> Solving: Undo
  Solving --> Completed: Every storage cell holds a box
  Completed --> Solving: Box pushed off a storage cell again
  Completed --> Solving: Restart/Next/Previous/Random
```

## Component Diagram

```mermaid
flowchart TB
  subgraph Browser
    Main[main.js]
    Navigation[navigation.js]
    Hmi[hmi.js]
    Render[render.js]
    Board[board.js]
    Common[common.js]
    Levels[levels.js]
    DOM[(HTML DOM)]
    SVG[(SVG Canvas)]
    Storage[(localStorage)]
  end

  Main --> Navigation
  Main --> Hmi
  Hmi --> Board
  Hmi --> Render
  Hmi --> Levels
  Hmi --> Storage
  Board --> Common
  Render --> Common
  Navigation --> DOM
  Render --> SVG
```

## Package Diagram

```mermaid
flowchart LR
  subgraph Presentation
    P1[main.js]
    P2[navigation.js]
    P3[hmi.js]
    P4[render.js]
  end

  subgraph Domain
    D1[board.js]
    D2[common.js]
  end

  subgraph Data
    L1[levels.js]
  end

  P1 --> P2
  P1 --> P3
  P3 --> P4
  P3 --> D1
  P3 --> L1
  P4 --> D2
  D1 --> D2
```

## Deployment Diagram

```mermaid
flowchart LR
  UserDevice[Client Device]
  Browser[Web Browser]
  StaticHost[Static File Host]
  Files[(HTML/CSS/JS Assets)]

  UserDevice --> Browser
  Browser <-- HTTP --> StaticHost
  StaticHost --> Files
  Browser --> Files
```

## Data Model Diagram

```mermaid
erDiagram
  BOARD_STATE ||--o{ CELL : contains
  LEVEL ||--o{ BOARD_STATE : instantiates
  BOARD_STATE ||--o{ MOVE_HISTORY : records

  BOARD_STATE {
    int challenge
    string moves
    int pushes
    bool completed
    string direction
    bool pushing
  }

  CELL {
    int x
    int y
    string symbol
  }

  LEVEL {
    string[] plan
    string info
    string solution
  }

  MOVE_HISTORY {
    string letter
  }
```

## Quality Attributes

- Maintainability: cohesive modules and explicit dependency graph.
- Testability: domain and rendering logic are deterministic and easy
  to exercise with plain objects and jsdom.
- Portability: standard browser APIs only (no runtime dependencies).
- Performance: lightweight SVG rendering without framework overhead.

## Testing Strategy

The project employs a two-tier testing approach to ensure correctness
across domain logic and user workflows.

### Unit Tests

Located in `html5/src/test/unit/`, these tests validate pure functions
and deterministic behaviors:

- **common.test.js**: symbol table and direction constants.
- **board.test.js**: board state transitions, move/push validation,
  undo, and full-solution replay for every level that ships a
  reference solution string.
- **render.test.js**: SVG DOM construction and joystick control wiring.
- **navigation.test.js**: page/panel show-and-hide behavior.
- **hmi.test.js**: orchestration, statistics text, and persistence.
- **main.test.js**: bootstrap wiring for both DOM-ready states.
- **levels.test.js**: level data integrity (single sokoban per level,
  well-formed plans, symbol table parity with common.js).

### End-to-End Tests

Located in `html5/src/test/e2e/`, these tests validate complete user
workflows using Playwright:

- **app.spec.js**: default board rendering, hamburger menu open/close,
  and navigation to/from every subpage (rules, options, statistics,
  about), confirming the board and subpages are mutually exclusive.
- **gameplay.spec.js**: solving a level via the joystick controls,
  undoing a push, switching levels with persistence across a reload,
  and restarting a level.

### Test Architecture

- **Pure function tests**: board.js and common.js use Vitest.
- **DOM integration tests**: render.js, navigation.js, and hmi.js use
  Vitest with jsdom.
- **System tests**: complete workflows use Playwright against a
  locally served build.
- **Coverage gate**: statements, branches, functions, and lines are
  each enforced at a minimum of 96% via `vitest --coverage`.

## Extensibility Guidelines

- Add a new level: append an entry to `levels.setup` with a `plan`
  and, optionally, `info` and `solution`.
- Add a new movement rule: extend `DIRECTIONS` in common.js and the
  corresponding branch in `applyMove`/`undoMove`.
- Add a new subpage: add a `.page` element with a unique id and a
  side-panel link targeting `#that-id`; navigation.js requires no
  changes.

## Development Toolchain Baseline

### Runtime & Module System

- **Node.js**: LTS (18+) or current version
- **Module Format**: ES modules (`type: "module"` in package.json)
- **Package Manager**: npm 9.x or later

### Build & Serve Tools

- **http-server**: static file server for development and e2e testing
- **biome**: fast JavaScript/JSON linter and formatter

### Testing Framework

- **vitest**: unit and integration test runner (Vite-native)
- **@vitest/coverage-v8**: code coverage reporting
- **jsdom**: DOM environment for unit tests
- **@playwright/test**: end-to-end testing framework

### Documentation & Linting

- **markdownlint-cli2**: markdown style validation

### Scripts

Run via `npm run <script>` inside `html5/`:

- **test**: run all tests (unit + e2e)
- **test:unit**: run unit tests with coverage (96% thresholds)
- **test:unit:watch**: watch mode for development
- **test:e2e**: run Playwright e2e tests
- **test:e2e:ui**: e2e tests with browser UI
- **lint**: run all linters (markdown + biome)
- **lint:md**: markdown linting
- **lint:biome**: JavaScript/JSON code quality
- **format**: apply biome formatting

### Quality Gates

- **Test Coverage**: minimum 96% statements, branches, functions, and
  lines, with no warnings suppressed.
- **Code Quality**: Biome linting (enforces consistent style).
- **Documentation**: Markdown linting.
- **E2E Coverage**: application shell navigation and core gameplay
  (move, push, undo, level switching, completion) validated end to
  end.

### Configuration Files

- **package.json**: dependencies and npm scripts
- **vitest.config.js**: unit test configuration with jsdom environment
- **playwright.config.js**: e2e test configuration (localhost:4173)
- **biome.json**: linter/formatter rules and file exclusions
- **.markdownlint-cli2.jsonc**: markdown linting rules
