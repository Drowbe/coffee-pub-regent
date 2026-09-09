# Architecture: Blacksmith Integration

**Audience:** anyone changing how Regent talks to Coffee Pub Blacksmith.

Regent is a leaf consumer of Blacksmith. This document records **Regent's** integration decisions.
It deliberately does not restate Blacksmith's API surface: that is documented in the
[Blacksmith wiki](https://github.com/Drowbe/coffee-pub-blacksmith/wiki), and a copy here would be a
second source of truth that drifts. An earlier version of this file was exactly that copy, and it
was deleted.

## Everything goes through the bridge

`scripts/blacksmith-bridge.js` is the only file that touches Blacksmith. Every other file imports
from it.

That is a rule about **change**, not about tidiness. When Blacksmith moves a surface, exactly one
Regent file needs editing, and the failure of a missing API is handled once rather than at every call
site. Each accessor degrades on its own terms: logging falls back to `console`, chat cards notify the
user, journal creation throws with an actionable message.

| Accessor | Reaches |
|---|---|
| `postConsoleAndNotification`, `playSound`, `trimString` | `api.utils` |
| `getHookManager` | `api.HookManager` |
| `createJournalEntryFromBlacksmith` | `api.createJournalEntry` |
| `getChatCards`, `getChatCardThemeId` | `api.chatCards` |
| `getDialog` | `api.dialog` |

**Two things do not go through the bridge, and both are deliberate.** The window base is a real ES
import, because `extends` needs the class at module-evaluation time. The shell template is a path
string handed to Handlebars, not code.

## The one import, and why the obvious version does not work

```javascript
import { BlacksmithWindowBaseV2 } from '/modules/coffee-pub-blacksmith/api/blacksmith-api.js';
```

**Reading the base class off `mod.api` at module top level cannot work**, and the way it fails is
worth stating because it is silent. `extends` is evaluated when the module is evaluated, which is
before `game` exists, so a bare `game.modules.get(...)` there throws -- and ES modules cache a failed
evaluation, so that throw disables the module for the entire session.

Regent's earlier code used an optional-chained resolver, which never threw. `api` was simply always
`undefined`, so a local fork was used as the base every time and the `mod.api` branch never ran once.
That is worse than a crash: it ran for months looking correct. Both the resolver and the fork are
gone.

`api/blacksmith-api.js` is a published entrypoint and a real ES module. **`scripts/*.js` paths inside
Blacksmith are not a contract** and must never be imported; they have been renamed repeatedly.

## Chat cards: Regent writes no card HTML

Both posting sites -- Send to Chat, and the GM Regent Report whisper -- compose Blacksmith-owned
parts and call `chatCards.post()`. Regent supplies no wrapper, no theme class and no header marker.

**Model text is always wrapped in `{ literal }`.** That is what keeps a fabricated `@UUID` or
`[[/r 2d6]]` inert. It matters most in `tiles`, whose captions and values come entirely from model
output; those fields joined Blacksmith's text pipeline in 14.1.0, and before that a literal there
would have stringified. Regent therefore requires that version or later.

**The theme setting stores a theme id and is normalised on read.** `getChatCardThemeId` maps a stored
CSS class name back to its id, because the setting used to hold class names. This avoids a migration
script; do not remove it while any world may still hold an old value.

## Dialogs

Regent has no dialogs of its own. Every one goes through `api.dialog` -- never `new Dialog(...)`, and
never `DialogV2` directly.

**The reason is the dismissal contract.** Foundry's raw `DialogV2` statics *reject* when a dialog is
dismissed unless `rejectClose: false` is passed, so each call site would need a `try`/`catch` to treat
"pressed Escape" as an ordinary outcome, and the one that forgets turns a shrug into an unhandled
rejection. Blacksmith's helpers resolve instead.

Read the outcome as `{ action, value }` and compare `action` against `api.dialog.ACTIONS`. **Resolve
the expected action into a local before comparing.** Writing `outcome.action !== dialog.ACTIONS?.SUBMIT`
inline means that if `ACTIONS` were ever absent the optional chain yields `undefined`, every outcome
is rejected, and the failure is silent: the dialog opens, the user chooses, nothing happens.

**A dismissal is not a choice.** `addEncounterFromJournal` returns without creating anything unless
the action is `SUBMIT`.

## Window registration

Regent registers `consult-regent` through `api.registerWindow`, so the toolbar, the menubar, macros
and other modules all open the window through `api.openWindow('consult-regent')` without importing
Regent's class. The toolbar and menubar entries call that same path rather than constructing the
window, so all three routes share one set of error handling.

## Hooks

Regent registers exactly one hook -- `controlToken`, in `token-handler.js` -- through Blacksmith's
`HookManager`. It is not a `pre*` hook and vetoes nothing, so it does not need `canCancel`. That flag
belongs at the top level of the registration object rather than inside `options`, which is easy to get
wrong and fails by silently ignoring a falsy return.
