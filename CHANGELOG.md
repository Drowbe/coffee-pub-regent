# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
