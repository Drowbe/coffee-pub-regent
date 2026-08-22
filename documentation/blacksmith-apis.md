# Coffee Pub Blacksmith — integration for Regent and other modules

Wiki entry point: [Coffee Pub Blacksmith Wiki](https://github.com/Drowbe/coffee-pub-blacksmith/wiki)

## One-liner (Regent / consumers)

Use **`game.modules.get('coffee-pub-blacksmith').api.createJournalEntry`** for JSON → journal — that resolves after `init`, so `mod.api` is right. **Base classes are different:** import them from the bridge, **`/modules/coffee-pub-blacksmith/api/blacksmith-api.js`**. For “open this registered window,” use **`api.openWindow(windowId, options)`** (registry only).

> **Corrected 2026-08-22.** Earlier revisions of this file said to read `BlacksmithWindowBaseV2` off `mod.api` at module top level. That cannot work: `extends` is evaluated when the module is evaluated, and `game` does not exist then. A bare `game.modules.get(...)` there throws, and ES modules cache a failed evaluation, so the throw disables the module for the whole session. Regent's optional-chained resolver never threw, but `api` was always undefined, so the local fork was the base every time and the `mod.api` branch never ran. Both the resolver and the fork are gone. The rule that **`scripts/*` paths are not a stable contract** still holds — the bridge is the supported path, and it is a real ES module.

Authoritative Window doc: **[API: Window](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Window)** (registry vs public base class, zone contract, template data).

## Documented API surfaces (prefer these)

| Area | Wiki |
|------|------|
| Core (utilities, console / notifications) | [API: Core Blacksmith](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Core-Blacksmith) |
| Toolbar | [API: Toolbar](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Toolbar) |
| Menubar | [API: Menubar](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Menubar) |
| Canvas | [API: Canvas](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Canvas) |
| Hook Manager | [API: Hook Manager](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Hook-Manager) |
| Sockets | [API: Sockets](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Sockets) |
| Stats | [API: Stats](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Stats) |
| Pins | [API: Pins](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Pins) |
| Chat Cards | [API: Chat Cards](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Chat-Cards) |
| **Window (registry + base class)** | **[API: Window](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Window)** |
| Request Roll | [API: Request Roll](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Request-Roll) |
| Campaign | [API: Campaign](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Campaign) |
| OpenAI | Provided by **coffee-pub-regent** when installed; Blacksmith core does not ship OpenAI |
| Supplement | [API: Supplement](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Supplement) |

**Journal from JSON:** Blacksmith is adding **`createJournalEntry`** to the public API — track **[API: Supplement](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Supplement)** or a dedicated **API: Journal** wiki page when published.

## Application V2 Window API (summary — see wiki for full contract)

Blacksmith exposes **two** related surfaces, reached **two different ways**:

| Surface | How to reach it | Purpose |
|---------|-----------------|---------|
| **Registry** — `registerWindow`, `unregisterWindow`, `openWindow`, `getRegisteredWindows`, `isWindowRegistered` | **`mod.api`**, after `init` | Register an **id** + **opener** so toolbars, macros, and other code open your window **without importing your class**. |
| **Base classes** — `BlacksmithWindowBaseV2`, `BlacksmithToolWindowBaseV2`, plus `BLACKSMITH_WINDOW_STYLES` / `BLACKSMITH_TOOL_TITLEBARS` / `BLACKSMITH_TOOL_THEMES` | **`import` from `/modules/coffee-pub-blacksmith/api/blacksmith-api.js`** | **Subclass** Blacksmith’s Application V2 base for zone template + shared behavior (scroll, delegation, size constraints, position persistence). **Do not** deep-link `scripts/window-base.js`. |

The constants are the same objects as `api.windowStyles`, `api.toolTitlebars`, `api.toolThemes`.

Regent registers and opens **`consult-regent`** via the registry, and `BlacksmithWindowQuery` **extends** `BlacksmithWindowBaseV2` unconditionally — no resolver, no fallback base, no fallback shell.

**Two base behaviours worth knowing when subclassing:**

- **Size constraints** are published as CSS custom properties (`--blacksmith-window-min-*`) against a `.blacksmith-window` marker class, never as inline `min-height`. Inline minima cannot be minimised away: Foundry's `minimize()` sets inline `max-height`, and CSS resolves min over max, so an inline minimum leaves a title bar on an empty full-size frame. Do not reintroduce one.
- **Position persistence** is built in, to `localStorage` under `options.windowPositionKey`. Pass **`rememberPosition: false`** if you persist bounds yourself — Regent does, to a world setting, and the base's restore runs in `_onFirstRender`, i.e. after your constructor, so leaving both on means the base wins.

## Quick how-to (consumers)

1. **Regent:** the only ES **`import`** of a Blacksmith URL is the bridge, **`/modules/coffee-pub-blacksmith/api/blacksmith-api.js`**, for the window base — `scripts/*` stays off limits. Everything resolved after `init` goes through **`mod.api`**; journal via **`createJournalEntry`**. Shell template path **`modules/coffee-pub-blacksmith/templates/window-template.hbs`** is a template asset, not a `.js` import.

2. **After `ready`:** `const api = game.modules.get('coffee-pub-blacksmith')?.api;`

3. **Bridge:** `api/blacksmith-api.js` — base classes and style constants (import), plus `BlacksmithAPI.get()` for timing.

4. **Logging:** `api.utils.postConsoleAndNotification(...)`

5. **Open by id:** `api.openWindow('your-window-id', options?)`

6. **Sockets / hooks / sounds:** `api.sockets`, `api.HookManager`, `api.utils.playSound`, `api.utils.trimString`

## Policy: do **not** deep-link `scripts/*.js`

Internal filenames are not a stable contract. Use **`mod.api`** and the wiki.

### Recent internal renames (reference only — do not import)

| Old (fragile) | Current canonical (internal) |
|---------------|------------------------------|
| `scripts/common.js` | `scripts/utility-common.js` *(shim may exist)* |
| `scripts/journal-page-pins.js` | `scripts/ui-journal-pins.js` |
| `scripts/encounter-toolbar.js` | `scripts/ui-journal-encounter.js` |
| `scripts/combat-tracker.js` | `scripts/ui-combat-tracker.js` |
| `scripts/combat-tools.js` | `scripts/ui-combat-tools.js` |
| `scripts/journal-tools.js` | `scripts/manager-journal-tools.js` |
| `scripts/vote-config.js` | `scripts/window-vote-config.js` |

### API coverage for Regent

| Need | Approach |
|------|----------|
| Open / register Consult the Regent | `registerWindow` / `openWindow` |
| Application V2 subclass | **`import { BlacksmithWindowBaseV2 } from '/modules/coffee-pub-blacksmith/api/blacksmith-api.js'`** — no fallback |
| JSON → journal | **`api.createJournalEntry`** (`blacksmith-bridge.js`) |
| Toolbar, utils, HookManager, chat cards, macros | `mod.api` |
| Cancelling a `pre*` hook | `registerHook({ ..., canCancel: true })` — **top level, not inside `options`**. Without it a falsy return is ignored, which is what you want for a callback whose natural return value is a boolean. Regent's one hook (`controlToken`, `token-handler.js`) is not a `pre*` hook and vetoes nothing. |

## Regent implementation

- **`scripts/blacksmith-bridge.js`** — `mod.api.utils`, `HookManager`, `createJournalEntry`, chat cards
- **`scripts/window-query.js`** — imports `BlacksmithWindowBaseV2` from the bridge; renders `window-template.hbs`
- **`scripts/regent-bootstrap.js`** — `ready`; `mod.api` only

## Shared roll + campaign context

- `api.openRequestRollDialog({ ... })`
- `api.campaign` (see wiki)
