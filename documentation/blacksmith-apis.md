# Coffee Pub Blacksmith — integration for Regent and other modules

Wiki entry point: [Coffee Pub Blacksmith Wiki](https://github.com/Drowbe/coffee-pub-blacksmith/wiki)

## One-liner (Regent / consumers)

Use **`game.modules.get('coffee-pub-blacksmith').api.createJournalEntry`** for JSON → journal, and **`api.BlacksmithWindowBaseV2`** / **`api.getWindowBaseV2()`** for Application V2 subclasses — both are on **`mod.api` after `ready`**; **do not** import Blacksmith **`scripts/*`** for those behaviors. For “open this registered window,” use **`api.openWindow(windowId, options)`** (registry only).

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

Blacksmith exposes **two** related surfaces on **`game.modules.get('coffee-pub-blacksmith').api`** (after **`ready`**):

| Surface | Purpose |
|---------|---------|
| **Registry** — `registerWindow`, `unregisterWindow`, `openWindow`, `getRegisteredWindows`, `isWindowRegistered` | Register an **id** + **opener** so toolbars, macros, and other code open your window **without importing your class**. |
| **Base class** — `BlacksmithWindowBaseV2` or `getWindowBaseV2()` | **Subclass** Blacksmith’s Application V2 base for zone template + shared behavior (scroll, delegation, size constraints). **Do not** deep-link `scripts/window-base-v2.js`. |

Regent registers and opens **`consult-regent`** via the registry; the query window **extends** the API base when it is available **when Regent’s `window-query.js` first runs** (typically requires **`BlacksmithWindowBaseV2` on `mod.api` by `init`**, not only `ready`), else **`RegentWindowBaseV2`** + **`regent-window-shell.hbs`**.

## Quick how-to (consumers)

1. **Regent:** no ES **`import`** of URLs under `/modules/coffee-pub-blacksmith/` for scripts. Use **`mod.api`** at runtime; journal via **`createJournalEntry`**; window base via **`api.BlacksmithWindowBaseV2` / `getWindowBaseV2()`** (see `window-query.js` resolver). Shell template path **`modules/coffee-pub-blacksmith/templates/window-template.hbs`** is used only when the official base is in use (template asset, not a `.js` import).

2. **After `ready`:** `const api = game.modules.get('coffee-pub-blacksmith')?.api;`

3. **Optional timing bridge:** `api/blacksmith-api.js` + `BlacksmithAPI.get()` — Regent does not import this file.

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
| Application V2 subclass | `api.BlacksmithWindowBaseV2` or `getWindowBaseV2()`; fallback `regent-window-base-v2.js` if api not ready at load |
| JSON → journal | **`api.createJournalEntry`** (`blacksmith-bridge.js`) |
| Toolbar, utils, HookManager, chat cards, macros | `mod.api` |

## Regent implementation

- **`scripts/blacksmith-bridge.js`** — `mod.api.utils`, `HookManager`, `createJournalEntry`
- **`scripts/regent-window-base-v2.js`** — fallback base only when `mod.api` has no window base at Regent load time
- **`templates/regent-window-shell.hbs`** — fallback shell (paired with fallback base)
- **`scripts/window-query.js`** — `resolveWindowQueryBase()` + matching shell path
- **`scripts/regent-bootstrap.js`** — `ready`; `mod.api` only

## Shared roll + campaign context

- `api.openRequestRollDialog({ ... })`
- `api.campaign` (see wiki)
