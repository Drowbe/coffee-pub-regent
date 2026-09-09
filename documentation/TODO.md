# Regent — TODO / follow-ups

## Verification owed

1. **Send to Chat, the GM Regent Report whisper, and journal creation from a JSON answer have never
   run in a live world**, on any Foundry version. They were rebuilt onto Blacksmith's Chat Cards API
   and verified by static analysis and an offline harness only. Exercise all three in a running game
   and record the result in `CHANGELOG.md`.

## Regent JSON shape to `createJournalEntry`

2. **Align narrative / encounter JSON with what `createJournalEntry` expects.** Valid JSON is not
   enough; the shape must match Blacksmith's implementation.

   - `prepsetup` must be a **string** of HTML, not an object with separate Synopsis / Key Moments /
     GM Guidance fields.
   - Metadata scraping assumes that string follows the legacy pattern
     (`<li><strong>Synopsis</strong>: ...</li>`) so synopsis and key moments can be recovered.

   **Action:** update the prompts, `BASE_PROMPT_TEMPLATE.jsonFormat`, the post-processing in
   `api-openai.js` and `regent.js`, and `cleanAndValidateJSON` so the emitted JSON matches the
   journal pipeline -- or agree a Blacksmith API version that accepts the richer object and maps it
   itself.

## Optional cleanup

3. **`styles/window-query.css` is not loaded, and the worksheets are unstyled because of it.**
   The classes it defines are used in the templates and appear in no other stylesheet, so this is
   missing styling rather than dead code. It cannot be imported as-is: none of its 44 rules is
   scoped, and `.form-label` -- used 48 times in Regent's templates -- would leak into every other
   module's forms as a global rule. Scope every rule to `#coffee-pub-regent-wrapper`, then import,
   then look at the worksheets. `node tools/check-styles-loaded.mjs` flags this correctly until done.

4. **Icon prefixes are mixed** -- 53 legacy `fas`/`far` against the modern `fa-solid`/`fa-regular`.
   Both resolve under Font Awesome 7, so this is consistency only, with no functional effect.

5. **A dead jQuery normalisation branch remains** in `activateListeners` (`window-query.js`).
   ApplicationV2 never passes jQuery, so it cannot fire on v13 or v14. It is kept because
   `module.json` still claims `minimum: "13"` and no v13 install exists to prove the branch
   unreachable there.

## Repo

6. Add optional `.webp` banner files under `images/banners/` for stock narrative card images
   (see `images/banners/README.md`).
