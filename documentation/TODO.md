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

3. **Icon prefixes are mixed** -- 53 legacy `fas`/`far` against the modern `fa-solid`/`fa-regular`.
   Both resolve under Font Awesome 7, so this is consistency only, with no functional effect.

4. **A dead jQuery normalisation branch remains** in `activateListeners` (`window-query.js`).
   ApplicationV2 never passes jQuery, so it cannot fire on v13 or v14. It is kept because
   `module.json` still claims `minimum: "13"` and no v13 install exists to prove the branch
   unreachable there.

## Repo

5. Add optional `.webp` banner files under `images/banners/` for stock narrative card images
   (see `images/banners/README.md`).
