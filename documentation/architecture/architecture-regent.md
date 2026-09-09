# Architecture: Regent

**Audience:** anyone changing Coffee Pub Regent.

How Regent is put together, and the decisions that are not obvious from reading the code.

## Shape

Regent is a **leaf consumer**. It calls Blacksmith and nothing calls it, apart from the small AI
surface it publishes for other modules. It owns no canvas layer, no combat logic and no documents of
its own; what it owns is one window, five worksheets, and the path from a model's reply to something
usable in Foundry.

| File | Holds |
|---|---|
| `scripts/window-query.js` | The Consult the Regent window, all five worksheets, drop handling, chat and journal actions |
| `scripts/api-openai.js` | Provider calls, response normalisation, conversation memory, the published `module.api.ai` |
| `scripts/card-composer.js` | Model reply to Blacksmith card composition |
| `scripts/blacksmith-bridge.js` | Every call into Blacksmith, in one place |
| `scripts/regent-settings.js` | Settings registration |
| `scripts/regent-bootstrap.js` | `ready` wiring: settings, window registration, toolbar and menubar |
| `scripts/token-handler.js` | Populating worksheets from the selected token |

`window-query.js` is by far the largest file and is the honest description of the module: Regent is a
window with worksheets attached.

## Two providers, one shape

Regent talks to **OpenAI** or **Anthropic**, chosen by a setting, with separate keys and model lists
for each. Everything downstream is provider-agnostic because `_normalizeProviderResponse` flattens
both wire formats to one object carrying content, usage and cost before anything else sees it.

**The published API is `module.api.ai`.** `module.api.openai` remains as an alias, because it was the
original name and other modules may still use it. Do not remove it without checking the suite.

## Model output is text, and is treated as such

Regent asks for HTML and the model half-obeys: headings and bold arrive as tags, emphasis arrives as
markdown asterisks, rules and tables arrive as markdown, and `<br><br>` does the work `<p>` was asked
to do. This is not an occasional failure. It is what a reply looks like.

Two consequences that are easy to get wrong:

- **Never pass a model reply anywhere that renders HTML.** `card-composer.js` parses it into
  structured card parts and escaped literals instead. Its header comment carries the full reasoning;
  read it before changing anything there.
- **Anything derived from a reply must be parsed line-first, not element-first.** An element-oriented
  walk collapses a stat block into a single paragraph, because in that reply the line is the unit of
  structure. This was shipped once and corrected.

## The window

`BlacksmithWindowQuery` extends Blacksmith's `BlacksmithWindowBaseV2` and renders Blacksmith's shell
template. Regent has no window base of its own; an earlier fork was deleted. The integration rules
that go with that are in [architecture-blacksmith-integration.md](architecture-blacksmith-integration.md).

**Position is persisted by Regent, not by the base.** The window passes `rememberPosition: false` and
stores bounds in a world setting, because the base restores position in `_onFirstRender` -- after the
subclass constructor -- so leaving both enabled means the base wins.

## Worksheets

Five, each a Handlebars partial set under `templates/`: **Lookup**, **Character**, **Assistant**,
**Encounter**, **Narrative**. The active one is a property on the window, persisted so the window
reopens where the user left it.

A worksheet contributes two things to a submission: text appended to the prompt, and rows in the
report shown to the GM. Both are built in `_onSubmit` by `gmRow`, which fills an HTML string for the
prompt and a structured array for the chat card in one call so the two cannot drift.

**Encounter and Narrative accept drops** -- actors onto the party and monster zones, journals onto
the encounters zone. Drop handling is delegated at the document level rather than bound per element,
because worksheet markup is replaced wholesale when the workspace switches.

## JSON answers

The Narrative and Encounter worksheets ask for JSON rather than prose, and the reply becomes a
journal entry through Blacksmith's `createJournalEntry`. `cleanAndValidateJSON` exists because models
wrap JSON in code fences and add commentary around it; it isolates the object before parsing.

**A JSON reply still renders in the window as text.** There is no separate viewer, and the Create
Journal button is offered on every answer rather than only on valid JSON.
