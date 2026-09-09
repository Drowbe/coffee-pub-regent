# Known Issues

**Audience:** anyone running Coffee Pub Regent who has hit something odd.

Defects and rough edges that are known and not yet fixed. If something here is wrong, or you have
hit something that is not, raise it on the repository.

## Narrative journals are not created

**Create journal does nothing on a Narrative answer.** The Encounter worksheet works; Narrative does
not.

Regent asks the model for `"journaltype": "Narrative"`, and Blacksmith's journal API no longer
accepts it:

> Legacy narrative journals are not supported. Use journaltype "area" with the blocks envelope.

The failure is reported as a notification rather than a crash, so a narrative answer appears to
succeed and simply produces no journal entry.

**Workaround:** use **Copy** and paste the text into a journal page yourself. The Encounter worksheet
is unaffected.

This is a Regent defect rather than a Foundry v14 one -- it predates the v14 work and is present on
v13 as well. The fix is scheduled after v14: Regent must emit `"area"` and adopt Blacksmith's blocks
envelope.

## The window shows raw markdown that the chat card does not

The same answer can render correctly as a chat card and show visible `*asterisks*` in the Regent
window. The window's own converter handles headings and `**bold**` only; it has no rule for
`*italic*`, for markdown tables, or for `---` separators, whereas the chat card composer handles all
three.

The symptom is intermittent, because it depends on whether the model happened to emit those forms.
The gap is not. **Send to Chat renders the answer properly** if the window looks wrong.

Scheduled after v14.

## The model does not know your world

Regent sends the model text, and the model answers with text. It has no access to your actors,
items, journals or scenes beyond the context Regent explicitly includes.

**So any `@UUID` link or `[[/r 2d6]]` roll expression the model produces is invented.** Regent
renders both as plain characters rather than as live links and roll buttons, deliberately: a
fabricated link points at nothing, and a roll button nobody asked for is worse than the text that
described it. This is not a bug and there is no setting to change it.

## Answers are not validated against the rules

Regent is a writing tool, not a rules engine. It will produce a stat block with the wrong proficiency
bonus or an encounter whose difficulty maths does not survive scrutiny, stated just as confidently as
a correct one. Read what it gives you before it reaches your table.

## Long answers can be cut off

A reply stops when it reaches **Max Output Tokens**. If answers end mid-sentence, raise that setting;
be aware that a larger ceiling means a larger bill on the answers that use it.
