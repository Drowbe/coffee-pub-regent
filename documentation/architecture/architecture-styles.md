# Architecture: Styles

**Audience:** anyone changing how Coffee Pub Regent looks.

Regent styles its own window. It does not inherit Blacksmith's, and the reasons are not obvious.

## What loads

`module.json` declares one stylesheet, `styles/default.css`, which is an import list:

```
@import "regent-window.css";          /* the window frame, messages, toolbar */
@import "regent-workspace-forms.css"; /* worksheet form controls */
```

**`styles/window-query.css` is not loaded by anything, and that is a defect rather than dead code.**
It is 258 lines of workspace-content rules that never made it into the import list. The classes it
styles -- `.workspace-item-*`, `.primary-info`, `.details-grid`, `.spell-list-container` and the rest
-- **are used in the worksheet templates and are defined in no other stylesheet**, so that markup
renders unstyled today.

It cannot simply be imported. **Not one of its rules is scoped**: they are bare class selectors, and
`.form-label` alone appears 48 times in Regent's templates but would, as a global rule, also style
every other module's forms and Foundry's own interface. Importing it as it stands trades missing
styling for leaked styling.

The fix is to scope every rule to `#coffee-pub-regent-wrapper` and then import it -- mechanical, but
it changes how the worksheets look, so it wants someone watching the screen. `node tools/check-styles-loaded.mjs`
reports the file until this is resolved, and that report is correct.

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
