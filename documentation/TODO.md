# Regent — TODO / follow-ups

## Blacksmith API (coordinate with `coffee-pub-blacksmith`)

1. **`mod.api.createJournalEntry`** — Regent calls this from `blacksmith-bridge.js` for narrative/encounter JSON → journal. Without it, **Create journal** runs but errors at runtime. Track Blacksmith wiki (e.g. [API: Supplement](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Supplement) or future API: Journal).

2. **`BlacksmithWindowBaseV2` / `getWindowBaseV2()` on `mod.api` by `init`** — So `window-query.js` can resolve the real base at load and use `window-template.hbs`. If only attached at `ready`, Regent keeps `RegentWindowBaseV2` fallback. See [API: Window](https://github.com/Drowbe/coffee-pub-blacksmith/wiki/API:-Window).

## Regent JSON shape → `createJournalEntry` (Blacksmith contract)

3. **Align narrative / encounter JSON with what `createJournalEntry` expects today** — Valid JSON is not enough; the **shape** must match Blacksmith’s implementation.

   - **`prepsetup`** must be a **string** (HTML that their template/render expects), **not** an object with separate fields like Synopsis / Key Moments / GM Guidance.
   - **Metadata / synopsis scraping** (if used) assumes that string looks like the **legacy pattern**: `<li><strong>Synopsis</strong>: …</li>` (and similar) so synopsis / key moments can be scraped.

   **Action:** Update Regent prompts, `BASE_PROMPT_TEMPLATE.jsonFormat`, post-processing in `api-openai.js` / `regent.js`, and any `cleanAndValidateJSON` normalization so emitted JSON matches the Blacksmith journal pipeline — *or* coordinate a Blacksmith API version that accepts the richer object shape and maps it server-side.

## Regent repo (optional)

- Add optional `.webp` banner files under `images/banners/` if you want stock narrative card images (see `images/banners/README.md`).
