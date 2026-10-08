# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **`scripts/window-query.js`: dead event wiring removed.** `BlacksmithWindowQuery` is an `ApplicationV2` window, which never calls `activateListeners` -- and Blacksmith's own base class, which used to supply one, had it removed. `activateListeners` (and the `_attachWorksheetListenersToWrapper` it deferred via `requestAnimationFrame`) were therefore unreachable: nothing in the module ever ran them.
  - **Narrative-cookie persistence now actually runs.** The `change` listener that called `saveNarrativeCookies`, and the one-time `loadNarrativeCookies` call, lived only in the dead code. Both are now wired through `_attachRegentDelegationOnce`'s document-level delegation (load deferred to `_onFirstRender`), matching the pattern the rest of the file already uses for clicks, drag/drop and the Enter key.
  - **A native form submit from any field other than the message textarea is now caught and stopped**, instead of silently doing nothing (there was no listener to call `preventDefault`), which left Enter in e.g. a narrative text field free to trigger the browser's default form submission and navigate the window away. It is swallowed, not routed to `_onSubmit` -- sending is already explicit (the `regentSubmit` action, or Enter in the message textarea with "Enter Sends" checked), and other fields in the form are data entry, not a second way to send.
  - **The remaining wiring in the dead code -- the add-tokens/add-monsters/add-npcs/add-all/roll-dice button clicks, the card buttons, and the workspace tab clicks -- was already duplicated by document-level delegation elsewhere in the file and is simply deleted, not moved.**
  - **Checked, not a bug:** `initialize()` is called from `regent.js` with no `html` argument, so `switchWorkspace(html, ...)` runs with `html === undefined` on open. `switchWorkspace` already has a fallback branch for a falsy `html` that queries `document` directly, so the initial workspace tab/visibility still resolves correctly.

## [14.0.0]

Foundry VTT **v14** support. Regent runs on **v13 and v14 from one codebase** — there are no
`game.release.generation` branches, and none were needed.

### Changed

- **`module.json`**: `compatibility` is now `{ minimum: "13", verified: "14", maximum: "14" }`, and the `coffee-pub-blacksmith` requirement moves from `>= 13.19.0` to `>= 14.1.0`.
- **README** gains the standard badge row, including a green **Foundry v14** badge.
- **Dialogs go through Blacksmith's `api.dialog`** instead of Foundry's V1 `Dialog`. Two near-identical "Select Encounter Page" dialogs — one on the generic journal drop, one in `_handleEncountersDrop` — are now a single helper, `addEncounterFromJournal`, over `api.dialog.choose`. Each old copy carried its own jQuery-vs-native shim inside the button callback; both are gone.
  - **This was deprecation hygiene, not a v14 fix.** V1 `Dialog` still resolves on v14 (measured on 14.367), and the old code was not broken. It is removed because it was the last V1 UI in the module and the duplication was a drift risk, not because v14 forced it.
  - **A dismissal now creates nothing.** Blacksmith's helpers resolve rather than throw when a dialog is dismissed, and the helper returns without adding a page unless the outcome is `SUBMIT` — silently adding a page on Escape would be the worse failure.

### Verified on v14

Measured on a live **14.367** client by the Blacksmith agent:

- **Window opens clean** via `api.openWindow('consult-regent')` — `BlacksmithWindowQuery` renders on `BlacksmithWindowBaseV2`, 1245 nodes, **0 console errors**.
- **All 91 Font Awesome icons render.** 58 of them use legacy `fas`/`far` (Font Awesome 5) syntax, and those aliases still resolve under **Font Awesome 7**. The single blank icon in the window is Foundry's own titlebar icon carrying `hidden` deliberately, not Regent's.
- **`canvas.tokens.controlled` and the `controlToken` hook** are unaffected by Scene Levels.

### Not affected by v14

Recorded so the next migration does not re-scan: Regent has no `MeasuredTemplate`, no TinyMCE, no `ActiveEffect` handling, no `ChatLog.MESSAGE_PATTERNS` or custom chat commands, no `detectionModes`, no `createThumbnail`, no V1 `Application`/`FormApplication` windows, and no raw jQuery. Foundry helpers were already namespaced (`foundry.utils.*`, `foundry.applications.handlebars.*`).

### Documentation

Regent adopts the suite documentation standard. It and Vault were the two modules of fifteen that
never converged; Regent now matches the other twelve.

- **`tools/wiki-sync.mjs` and `tools/check-docs-structure.mjs`** added, taken from Blacksmith HEAD unmodified -- both are repo-agnostic and read their identity from `module.json`. **`.github/workflows/sync-wiki.yml`** added, which is what actually publishes. Regent's documentation now mirrors to the GitHub wiki on push.
- **`documentation/` restructured** into `api/`, `architecture/`, `userguides/`, `plans/` and `assets/`, with `home.md` and `known-issues.md` at the root. Six loose files at the root had been the whole tree.
- **Four user guides added** -- getting started, settings, the five worksheets, and sharing answers. Regent previously documented nothing for the person using it.
- **Three architecture documents added** -- how Regent is built, how it integrates with Blacksmith, and how its styles are scoped.
- **`documentation/blacksmith-apis.md` deleted.** It restated Blacksmith's API surface inside Regent, which is the duplication the standard exists to stop; Regent's own integration decisions moved to `architecture/architecture-blacksmith-integration.md` and the rest is now a link.
- **`documentation/note-to-blacksmith-chat-cards.md` deleted** -- correspondence is not documentation, and its conclusions already live in `card-composer.js`.
- **`documentation/investigation-regent-css.md` absorbed** into `architecture/architecture-styles.md` and deleted. The durable conclusions were kept; the account of finding them was not.
- **`README.md` rewritten** to the standard's shape, and now carries the suite's AI-assistance disclosure verbatim from the canonical copy in Blacksmith.

### Fixed

- **The Character worksheet was rendering unstyled.** `styles/window-query.css` -- the stylesheet holding the layout for the core details, features, spells and weapons panels -- was never in the import list, so none of its 41 rules ran. The classes it defines are used in those templates and appear in no other stylesheet, so those panels fell back to browser defaults: no grids, no item cards, no icon sizing.
  - **It could not simply be imported.** Not one rule was scoped. `.form-label` alone appears 48 times in Regent's templates and, as a bare global selector, would have restyled every other module's forms and Foundry's own interface. All 41 rules are now scoped to `#coffee-pub-regent-wrapper` and the file is imported; rule and declaration counts are unchanged.
  - **Its colours were also wrong once it finally ran.** The file had been authored against a light ground: every panel fill was a low-alpha BLACK, and these panels sit on a near-black surface, so all eleven composited to exactly the parent colour. The rules applied, `getComputedStyle` returned the authored values, nothing overrode them, and the screen did not change. They are now white at the same alphas, which reads as a raised panel and lands the strongest state on `#313030` -- the colour `regent-workspace-forms.css` already uses for one.
  - Found by `node tools/check-styles-loaded.mjs`, adopted the same day. **Confirmed visually on a live v14 client** once the colours were corrected.
- **Movement showed internal data instead of speeds.** The Character panel listed `ignoredDifficultTerrain [object Set] ft` and `fromSpecies [object Object] ft` beside walk and climb. `token-handler.js` excluded only the `units` key and kept everything else truthy, but dnd5e 5.x also stores a boolean, a `Set` and an object in `system.attributes.movement`. It now filters on the value being a positive finite number, so a future dnd5e addition cannot reintroduce the same defect.

### Found while documenting

- **`styles/window-query.css` was not loaded by anything** -- 258 lines with no effect. First recorded as dead code; it turned out to be missing styling, and is fixed above. The lesson is worth keeping: a tool reporting "nothing loads this file" reads like *delete it* and can equally mean *you forgot to load it*, and the two have opposite fixes.

### Verified on a live v14 client

Driven on 14.367 by the Blacksmith agent, with two API calls authorised by the author:

- **Send to Chat builds a correct card**, 0 console errors. `<br><br>` became four real paragraphs, lists survived as `<ul>`/`<li>`, bold and italic both rendered, and there was no `[object Object]` and no visible markdown pipes.
- **The GM Regent Report whisper reaches only GMs.** The whisper array is stored verbatim, so a player never sees it; identity, avatar, section and prose all render.
- **All three dialog paths behave.** Choosing a page resolves that page; the close button and Cancel both resolve to a dismissal and create nothing. The Escape *key binding* is not proven, but the dismissal path it triggers is. A scripted `KeyboardEvent` carries `isTrusted: false` and Foundry's keybinding layer ignores it, so that test could never have succeeded whatever the dialog does -- it needs a real keystroke.

### Known broken, scheduled after v14

- **Narrative journals are not created.** Regent emits `"journaltype": "Narrative"`, which Blacksmith's journal API rejects: *"Legacy narrative journals are not supported. Use journaltype `area` with the blocks envelope."* The error is caught and shown as a notification, so a narrative answer produces no journal and no console error. The Encounter worksheet is unaffected. **This predates the v14 work and is present on v13**; it is a Regent defect, not a v14 regression.
- **The window renders less markdown than the chat card.** `_markdownToHtml` handles headings and `**bold**`; it has no rule for `*italic*`, markdown tables, or `---`, all three of which the card composer handles. The same answer can therefore look correct in chat and show raw asterisks in the window. Intermittent in symptom, not in cause.

### Still unverified

- **Foundry v13.** `compatibility.minimum` remains `"13"`, but no v13 client was available during this work, so nothing in this release was exercised there. The claim rests on the code carrying no v14-only API and no `game.release.generation` branch.
- **The Escape key on the page-choice dialog.** The dismissal path it triggers is proven; the key binding is not. A scripted `KeyboardEvent` carries `isTrusted: false`, which Foundry's keybinding layer ignores, so only a real keystroke can verify it.

## [13.1.2]

### Removed

- **`templates/partial-encounter-scripts.hbs`** — 969 lines of `<script>` inside a Handlebars partial, included by both the encounter and narrative workspaces, that **has never executed**. ApplicationV2 sets part content via `innerHTML`, and scripts inserted that way do not run; the port that fixed this moved all 13 functions into `scripts/regent-encounter-worksheet.js`, which registers each as a global, but the partial was left behind. Every function in it had a live counterpart, so nothing referenced the dead copy. It accounted for **73 KB — a third of the markup built on every window open**.
- **`templates/partial-unified-header.hbs`** (Blacksmith skill-check dialog markup, `cpb-dialog-*`, never Regent's) and **`templates/partial-character-details.hbs`** — registered on every load, referenced from nowhere.

### Changed

- **Partial registration goes through `foundry.applications.handlebars.loadTemplates()`.** `window-query-registration.js` was 33 `await fetch(...)` calls in sequence, so every partial cost a serialised round trip during `ready`. The list is now a name → path map handed to the core loader, which fetches concurrently and skips anything already in `Handlebars.partials`.
- **`getCachedTemplate()` is gone; both call sites use `foundry.applications.handlebars.getTemplate()`.** It duplicated core's template cache with a worse one: a 5-minute expiry meant `window-query.hbs` was re-fetched and re-compiled on any window opened more than five minutes after the last. Core caches compiled templates for the session.

### Fixed

- **The custom card image path never reached the AI.** `_onSubmit` read `#input-CARDIMAGE` + id, missing the hyphen the element actually carries (`input-CARDIMAGE-{{id}}`), so the value was always `null`. Choosing **Custom** and entering a path produced `CARDIMAGE: Set to ""` in both the encounter and narrative prompts. The field appeared to work because `loadNarrativeCookies` reads it with the correct selector and restores it on reopen.
- **The GM Regent Report carried three empty section dividers.** `PREPTITLE` and `PREPDESCRIPTION` exist in no template, so `inputPrepTitle` / `inputPrepDescription` / `inputPrepDetails` were always `null` — and `gmRow` treats a falsy value as a heading rather than a row, which is how `<b>ENCOUNTER</b>` and friends are drawn. Every report ended with "Prep Title", "Prep Description" and "Prep Details" as dividers over nothing. The three variables and their six `gmRow` calls are gone. (`inputPrepDetails` also read the `PREPDESCRIPTION` selector, so had the fields ever been restored, Details would have mirrored Description.)

### Changed

- **Blacksmith is declared correctly as a dependency.** `relationships.requires` pointed at Regent's own manifest URL, so Foundry would have tried to satisfy the Blacksmith requirement by installing Regent. Now points at Blacksmith, with a minimum of **13.19.0** — the release that publishes the window base classes on `api/blacksmith-api.js`, which Regent now imports at evaluation time.
- **Four unconditional `console.log` calls removed** from the click delegation and render hooks. Each sat beside an equivalent `postConsoleAndNotification` that already respects the global debug setting; two of them fired on every click inside the window.

### Performance

- **Opening the Regent window builds 140 KB of markup instead of 213 KB** (−34%), and the encounter and narrative workspaces are roughly half their previous size.

## [13.1.1]

### Changed

- **The Regent window now extends Blacksmith's real base class.** `BlacksmithWindowBaseV2` is imported from **`/modules/coffee-pub-blacksmith/api/blacksmith-api.js`**, the supported bridge, and `BlacksmithWindowQuery` extends it unconditionally.
  - The old `resolveWindowQueryBase()` read the base off `game.modules.get(...).api` at module evaluation time. Optional chaining kept it from throwing — Regent never hit the crash this pattern caused elsewhere — but `game` does not exist while module scripts evaluate, so `api` was always `undefined`. **The Blacksmith branches were dead code that never once ran**, and the "fallback" was the base 100% of the time.
  - `data-action` handlers now take the instance Blacksmith passes as their third argument instead of reading the deprecated `_ref`, which points at whichever instance rendered last.
  - **`rememberPosition: false`** is set, because Regent persists window bounds itself to a world setting. The base also persists to `localStorage` and restores in `_onFirstRender` — after the constructor — so with both on the base would silently win and move bounds from per-world to per-browser.

### Removed

- **`scripts/regent-window-base-v2.js`** and **`templates/regent-window-shell.hbs`** — a fork of Blacksmith's base and shell, kept as a fallback that was in fact the only path. Both are superseded by the bridge import; the shell differed from Blacksmith's only in comments and a default icon Regent overrides anyway.

### Fixed

- **Minimising the Regent window left a title bar over a full-size empty frame.** The forked base wrote size constraints as inline `min-height`, and Foundry's `minimize()` collapses a frame with inline `max-height` — CSS resolves min over max when both are inline, so the minimum won and `maximize()` never cleared it. Blacksmith's base publishes the same constraints as CSS custom properties, where the stylesheet can zero them for `.minimized`.
- **A `document`-level click listener leaked for the session per window class.** The forked base attached one on first render and never removed it. Blacksmith's base binds per instance on `this.element`, so the listener dies with the frame and two open instances cannot steal each other's clicks.

### Requires

- **Blacksmith with `api/blacksmith-api.js` exporting the window base classes.** This is now a load-time dependency rather than a runtime one: if the import cannot resolve, Regent does not evaluate. Bump the `coffee-pub-blacksmith` minimum in `module.json` once that Blacksmith ships.

### Notes

- **HookManager `canCancel` needs no change here.** Regent registers one hook, `controlToken` in `scripts/token-handler.js`. It is not a `pre*` hook and vetoes nothing, so the new opt-in cancellation contract does not affect it.
- **`api.inventory` and `api.importer` are unused** by Regent; the merge fix and the newly public importer need no action.

## [13.1.0]

### Changed

- **Chat cards now use the Blacksmith Chat Cards API.** Both posting sites — **Send to Chat** and the GM **Regent Report** whisper — compose Blacksmith-owned parts through **`chatCards.post()`** instead of building card HTML. Regent no longer writes the card wrapper, the theme class, or the `coffeepub-hide-header` marker; Blacksmith owns all three.
- **`chatCardTheme` now stores a theme id** rather than a CSS class name, matching what `post()` expects. Worlds that ran an earlier Regent keep working: **`getChatCardThemeId()`** in `scripts/blacksmith-bridge.js` normalises a stored class name back to its id on read, so no migration script is needed.
- **The GM whisper is one message to all GMs** instead of one message per GM.

### Added

- **`scripts/card-composer.js`**: converts the model's reply into a parts composition. The reply is **hybrid** — headings and bold arrive as HTML tags, emphasis as `*marks*`, rules and tables as markdown, and `<br><br>` doing the work `<p>` was asked to do — so the walk is line-oriented and parses both. Headings become `section` parts, an ability-score row becomes `tiles`, and paragraphs/lists/tables/quotes become `prose` blocks.
  - **AI output is never passed on as HTML.** The `richtext` part is enriched rather than sanitised, and it inherits its safety from a document having a human author — which model output does not. Everything here ends as escaped literals.
  - **Enricher syntax in model output is inert.** An `@UUID[...]` or `[[/r 2d6]]` the model invents renders as visible characters rather than a broken link or an unrequested roll button. Worth revisiting only if Regent ever feeds the model real uuids.
  - **The walk degrades rather than drops.** An element with no mapping contributes its text as a paragraph, and a parse failure falls back to the whole reply as plain text.

### Requires

- **Blacksmith with `identity`, `ribbon` and `tiles` on the text pipeline** (Blacksmith `[Unreleased]` as of 2026-08-16, after `13.17.2`). Regent passes `{ literal }` to `identity.name` and to `tiles` captions and values, which is only correct once those fields are pipelined — on an older Blacksmith they are Handlebars-escaped and a literal renders as `[object Object]`. Bump the `coffee-pub-blacksmith` minimum in `module.json` once that Blacksmith ships.

### Fixed

- **GM Regent Report rendered unstyled in chat.** It was posted with `regent-message-header-answer` markup, but every rule for those classes is scoped to `#coffee-pub-regent-wrapper` and so never applied outside the Regent window. As a themed card it now picks up Blacksmith's card styling.

## [13.0.5]

### Added

- **Provider selection**: Regent AI settings now support both **OpenAI** and **Anthropic (Claude)** text generation, with provider-specific API keys and model choices under **Regent (AI)**.
- **Provider-neutral API surface**: Regent now exposes **`module.api.ai`** as the primary AI interface while keeping **`module.api.openai`** as a backward-compatible alias for existing integrations.
- **Anthropic browser support**: Direct browser calls to Anthropic now opt into browser access mode so Foundry client-side requests can succeed without a separate SDK wrapper.

### Changed

- **`scripts/api-openai.js`** now acts as a provider-aware Regent AI layer instead of an OpenAI-only implementation. Text requests are routed to either **OpenAI** or **Anthropic**, with normalized response handling for usage and content formatting.
- **Image generation removed**: Regent no longer exposes or documents the old OpenAI image-generation helper. The live AI surface is now text-focused only.
- **AI settings layout**: The Regent AI settings UI is now grouped into **Shared**, **OpenAI**, and **Anthropic** sections so provider-specific controls are easier to scan.
- **Campaign context sourcing**: Regent no longer invents parallel campaign-context settings. AI prompts now pull normalized campaign, geography, party, rulebook, and journal-default context from **`game.modules.get('coffee-pub-blacksmith')?.api?.campaign`**.
- **Prompt composition**: Regent worksheet prompts now use Blacksmith campaign data for the campaign name instead of a hardcoded Regent value.
- **Prompt semantics**: The base AI prompt is now sent as a **system** message rather than a user message.
- **Request size and history defaults**: Added configurable **Max Output Tokens** (default **1200**), reduced default **Context Length** to **4**, and stopped worksheet submissions from dragging prior global conversation history into one-shot prompt generation.
- **Retry behavior**: API retry handling is less punishing under failure/rate-limit conditions and now surfaces richer error messages, including the underlying provider response for **429** errors.

### Fixed

- **Blacksmith settings leak**: Removed the remaining direct reads of Blacksmith-owned settings from Regent’s narrative template data path. Regent now respects the documented API boundary and no longer crashes on missing Blacksmith settings such as **`narrativeDefaultCardImage`**.
- **Duplicate submits**: Regent now prevents overlapping AI submissions from the same window, reducing accidental stacked requests and redundant rate-limit pressure.
- **Processing UI cleanup**: The transient **Thinking...** card is now tracked and removed cleanly on both success and failure instead of accumulating stale processing messages in the output window.
- **Anthropic integration**: Direct Claude requests now work in Foundry’s browser context instead of failing immediately with a CORS/preflight error when browser access opt-in is required.

### Documentation

- **`README.md`** updated to describe provider-based AI configuration instead of OpenAI-only setup.
- **`documentation/api-openai.md`** updated to describe the Regent AI API, provider-neutral access through **`api.ai`**, and the removal of image-generation support.

## [13.0.4]

### Fixed

- **`module.json`**: **`manifest`**  point at the correct Regent GitHub repo and release assets (not Blacksmith-only URLs).

## [13.0.3] - Forced update for v14 compatibility testing


## [13.0.2] - 2026-03-23

Blacksmith integration overhaul, docs, packaging, and **Create journal** UX — all in this release.

### Fixed

- **`module.json`**: **`manifest`**, **`download`**, **`url`**, and **`bugs`** point at the correct Regent GitHub repo and release assets (not Blacksmith-only URLs).
- **Create journal** was only rendered when **`blnIsJSON`** was true; the model often returned **valid JSON** inside **markdown fences** or with extra text, so **`JSON.parse`** on the raw string failed and users only saw **Copy** / **Send to chat**. **Create journal** is now **always** on Regent **answer** toolbars, with visible **“Create journal”** label, tooltip, and book icon (**`partial-message.hbs`**).
- **`cleanAndValidateJSON`** (**`regent.js`**): **`extractJsonStringForParse()`** strips fenced markdown and can pull an embedded **`{…}`** segment before parse, so **`blnIsJSON`** matches real model output more often.

### Added

- **`scripts/blacksmith-bridge.js`** — **`game.modules.get('coffee-pub-blacksmith')?.api`** for **`postConsoleAndNotification`**, **`playSound`**, **`trimString`**, **`getHookManager()`**, **`createJournalEntryFromBlacksmith()`** (API only; no dynamic import of Blacksmith **`scripts/*`**).
- **`scripts/regent-window-base-v2.js`** + **`templates/regent-window-shell.hbs`** — Local Application V2 + Handlebars shell when Blacksmith’s base is not on **`mod.api`** at load time.
- **`images/banners/README.md`** — Optional narrative banners under **`modules/coffee-pub-regent/images/banners/`**.
- **`documentation/TODO.md`** — Blacksmith follow-ups (**`createJournalEntry`**, window base on **`mod.api` by `init`**) and **Regent JSON shape** for **`createJournalEntry`** (**`prepsetup`** as HTML string; legacy **`<li><strong>Synopsis</strong>:…`** pattern — see file).

### Changed

- **No ES imports from the Blacksmith package** — Removed **`/modules/coffee-pub-blacksmith/...`** **`import`**s from **`api-core.js`**, **`token-handler.js`**, **`window-query.js`** (was: **`api-core`**, **`manager-hooks`**, **`manager-sockets`**, **`common`**, **`window-base-v2`**), and **`regent-bootstrap.js`** (**`api/blacksmith-api.js`**). **`regent.js`** **`playSoundSafe`** uses the bridge.
- **`window-query.js`** — **`resolveWindowQueryBase()`**: prefers **`mod.api.BlacksmithWindowBaseV2`** or **`getWindowBaseV2()`**; uses Blacksmith **`window-template.hbs`** when that base wins; else **`RegentWindowBaseV2`** + **`regent-window-shell.hbs`**. Dropped unused **`SocketManager`** import.
- **`regent-bootstrap.js`** — Macros, chat card themes, toolbar/window registry from **`mod.api`** only (after **`ready`**).
- **`partial-global-fund.hbs`** / **`partial-narrative-image.hbs`** — No Blacksmith asset URLs; banners under Regent **`images/banners/`** paths.
- **`documentation/blacksmith-apis.md`** — **One-liner**, **registry vs. base class** ([API: Window](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Window)), no-**`scripts/*`** policy, **`createJournalEntry`**, **`init` vs `ready`** for base resolution.
- **`documentation/plan-regent.md`**, **`README.md`** — Integration and install/API expectations.
- **`module.json`** — **`version` 13.0.2**; **`esmodules`**: **`blacksmith-bridge.js`** after **`const.js`**.
- **`.github/workflows/release.yml`** — Release zip includes **`images/`**.

### Removed

- Deep links to Blacksmith **`scripts/*.js`** from Regent (internal paths are not a stable public contract).

## [13.0.0] - 2025-02-27

### Added

- **Coffee Pub Regent** as a standalone module. All AI tools (Consult the Regent, worksheets: Lookup, Character, Assistant, Encounter, Narrative) now live in this module and require Coffee Pub Blacksmith.
- **OpenAI API ownership**: Regent owns `api-openai.js` and exposes it for other modules via `game.modules.get('coffee-pub-regent')?.api?.openai` (set on `ready`). Methods include `getOpenAIReplyAsHtml`, `getOpenAIReplyAsHtmlWithMemory`, `callGptApiText`, `callGptApiTextWithMemory`, `callGptApiImage`, and session memory helpers.
- **Regent settings**: API key, model, game systems, prompt, context length, temperature, narrative options, and optional macro choice—all under Module Settings → Coffee Pub Regent → Regent (AI). Macro choices are sourced from Blacksmith’s API when available.
- **Documentation**: `documentation/plan-regent.md` (extraction plan) and `documentation/api-openai.md` (how to use the OpenAI API from Regent). Blacksmith docs now point to Regent for AI.
- **Window state persistence**: Regent remembers the last-opened workspace (defaulting to SRD Lookup when none saved) and the window size and position; both are restored on next open. Stored in world settings `lastOpenedWorkspace` and `regentWindowBounds` (not shown in config).
- **Release workflow**: GitHub Actions workflow (`.github/workflows/release.yml`) creates releases from `v*` tags or manual dispatch and attaches `coffee-pub-regent.zip` and `module.json`.

### Changed

- **Blacksmith**: No longer contains any OpenAI code or settings. AI features are provided only when the optional **coffee-pub-regent** module is enabled. Regent registers its toolbar tools (Consult the Regent, worksheets) via Blacksmith’s toolbar API.
- **OpenAI API access**: Consumers should use `game.modules.get('coffee-pub-regent')?.api?.openai` instead of Blacksmith’s former `module.api.openai`. Regent’s `api-openai.md` documents the full API.

### Fixed

- Clear separation of concerns: Blacksmith remains the shared-infrastructure hub; Regent is the optional AI/Regent feature module with a single, documented API surface for OpenAI.
- **Skill Check Assistant dropdowns**: Option text in Roll Details (and other workspace selects) is now styled for readability (dark text on light background).
- **Regent window constructor**: Corrected use of `this` before `super()` so the window opens without "Must call super constructor in derived class before accessing 'this'".
- **Application V2 – Encounter worksheet buttons**: With Application V2, the window body is injected without executing `<script>` inside Handlebars partials. The encounter worksheet used inline `onclick` and functions defined in `partial-encounter-scripts.hbs`; that script never ran, so level/class +/- buttons, remove card, section toggles, and the difficulty slider’s `oninput` did nothing. Encounter worksheet logic is now in `regent-encounter-worksheet.js`: all handlers are registered on `window` at load (`registerEncounterWorksheetGlobals()`), and `addTokensToContainer` / `addAllTokensToContainer` are exposed on `window` (delegating to the Regent window instance) so inline handlers and the NPC drop zone work.
- **Application V2 – Add-token-from-canvas buttons**: The “Add All”, “Add Monsters”, “Add Players”, and “Add NPCs” buttons were only attached in `_attachWorksheetListenersToWrapper()`, which can run before the wrapper exists when the body is injected as a part. These buttons are now handled via document-level click delegation (with card buttons and workspace tabs), so they work regardless of wrapper attachment timing.
- **Styles**: Uncommented `@import "regent-workspace-forms.css"` in `default.css` so workspace/encounter styles load. Corrected the import filename from `regent-regent-workspace-forms.css` to `regent-workspace-forms.css`.
