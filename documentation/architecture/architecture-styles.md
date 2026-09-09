# Architecture: Styles

**Audience:** anyone changing how Coffee Pub Regent looks.

Regent styles its own window. It does not inherit Blacksmith's, and the reasons are not obvious.

## What loads

`module.json` declares one stylesheet, `styles/default.css`, which is an import list:

```
@import "regent-window.css";          /* the window frame, messages, toolbar */
@import "regent-workspace-forms.css"; /* worksheet form controls */
```

**All three stylesheets are imported, and a tool proves it.** `node tools/check-styles-loaded.mjs`
verifies that every stylesheet on disk is reachable from the manifest and that every `@import`
resolves. Run it after touching the import list.

That check exists because of a real defect: `window-query.css` -- the layout for the Character
worksheet's panels -- was written, never added to the import list, and therefore never ran. The
classes it defines appear in no other stylesheet, so those panels rendered with browser defaults for
as long as that was true, and nothing errored. **A stylesheet nothing imports fails silently and
looks intentional.**

Fixing it required scoping first. The file had been written with bare class selectors, and importing
it in that state would have leaked `.form-label` and friends into every other module's windows. The
missing-styling bug and the leaked-styling bug are the same edit in opposite directions.

## Diagnosing a stylesheet that seems not to apply

Two traps, both of which cost a round here.

**`document.styleSheets` does not list an `@import`ed file.** Regent's stylesheets are reached
through `default.css`, so a check like this reports nothing even when everything is loaded:

```javascript
[...document.styleSheets].map(s => s.href).filter(h => h && /regent/.test(h))   // -> []
```

An imported sheet hangs off the importing one as a `CSSImportRule`, reachable at
`rule.styleSheet`; you have to walk the tree. The real chain is inline `<style>` to
`styles/default.css` to each imported file. **`rule.styleSheet === null` on a `CSSImportRule` is the
genuine "failed to load" signal** -- an empty `href` filter is not, and would report every module in
the suite as missing its CSS. Read `getComputedStyle` on a real element instead; it answers the
question directly.

**A rule can apply and still be invisible.** These panels sit on a near-black ground, so a
`rgba(0, 0, 0, 0.1)` fill composites to exactly the parent colour. `getComputedStyle` reports the
value you authored, the rule is in the cascade, nothing is overriding it, and the screen does not
change -- so every diagnostic says "working" while the symptom says otherwise. A border-radius on an
invisible fill shows nothing either, which removes the second clue.

**Check the ancestor chain's computed backgrounds before concluding a rule did not land.** Overlays
on this surface are white at low alpha; the strongest lands near `#313030`, which
`regent-workspace-forms.css` already uses for a raised panel.

## Regent does not inherit Blacksmith's window CSS

Blacksmith's window layout lives in `window-common.css`, and **almost none of it can reach Regent**
even when Blacksmith is enabled, because its layout rules are scoped to Blacksmith's own application
ids -- `#coffee-pub-blacksmith-query`, `-wrapper`, `-container`, `-output`, `-input`. Regent's
window carries the same structure under `#coffee-pub-regent-*`, so those selectors do not match.

The consequence is the thing to remember: **sharing Blacksmith's window base class does not mean
sharing its window styles.** Regent takes the frame's behaviour from `BlacksmithWindowBaseV2` and
supplies its own appearance. Copying a rule out of Blacksmith requires rewriting its selector; a
copied rule that still names a Blacksmith id is dead on arrival and silently so.

Blacksmith does publish some things through markers and custom properties that are meant to be
shared -- the `.blacksmith-window` size constraints among them. Those work because they are not
scoped to an application id. Prefer them where they exist.

## Everything is scoped to the window wrapper

Nearly every Regent rule begins `#coffee-pub-regent-wrapper`. That is deliberate: Regent renders
inside a shared frame beside a dozen sibling modules, and an unscoped rule leaks into other windows,
the sidebar and the chat log.

**But the scope has a hard edge, and it has caught us.** A rule scoped to the window wrapper cannot
style anything Regent puts *outside* the window -- and the chat log is outside it. Regent's GM report
was posted to chat for its entire life carrying `regent-message-header-answer` markup, whose only
rules are window-scoped, so it rendered unstyled and nobody noticed: a whisper of plain text does not
look obviously broken.

The lesson generalises past that one bug. **Before styling anything Regent emits, check where it will
render.** Content leaving the window is Blacksmith's to style: chat output goes through the Chat Cards
API and takes a card theme, and Regent contributes no CSS to it at all.

## Fonts and icons

Icons are Font Awesome, supplied by Foundry. Regent's markup mixes the legacy `fas`/`far` prefixes
with the modern `fa-solid`/`fa-regular` equivalents. Both resolve under the Font Awesome 7 build
shipped with Foundry v14, verified on a live client; the mixture is untidy rather than broken, and
normalising it is optional cleanup with no functional effect.
