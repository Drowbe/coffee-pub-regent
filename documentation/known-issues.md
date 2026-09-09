# Known Issues

**Audience:** anyone running Coffee Pub Regent who has hit something odd.

Defects and rough edges that are known and not yet fixed. If something here is wrong, or you have
hit something that is not, raise it on the repository.

## Unverified in a live world

**Send to Chat, the GM Regent Report whisper, and journal creation from a JSON answer have never
been exercised in a running game.** They were rebuilt onto Blacksmith's Chat Cards API and verified
by static analysis and an offline test harness only. They are expected to work and may not.

If one of them misbehaves, it is more likely a defect that shipped unexercised than a regression
from the Foundry v14 work.

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
