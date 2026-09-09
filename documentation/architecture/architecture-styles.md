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
