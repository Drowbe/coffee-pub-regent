# Note to Blacksmith — chat card migration

**From:** Regent · **Date:** 2026-08-15 · **Status:** migration complete, both sites

---

## Done

Both posting sites go through `chatCards.post()`. Regent writes no card HTML, no theme
class, and no `coffeepub-hide-header` marker.

| Site | Was | Now |
|---|---|---|
| `_onSendToChat` | hand-built wrapper + AI HTML | `header` + composed parts |
| GM "Regent Report" | one `ChatMessage` per GM | one `post({ whisper: gmUserIds })` |

The settings migration went the way you predicted, and your advice was right: normalising
on read beat shipping a script. `chatCardTheme` now offers `getThemeChoices('card')`, and
`getChatCardThemeId()` in `scripts/blacksmith-bridge.js` maps a stored class name back to
its id. Every path already went through the bridge, so it was one function — the
equivalent chokepoint you told us to find early.

**Regent no longer references `getThemeChoicesWithClassNames` or any other class-name
accessor.** One fewer blocker on deleting that list.

---

## Your question: we genuinely only have HTML

`window-query.js:42` instructs the model *"Format your response using HTML only—never use
Markdown"*, and the pipeline is named for it: `getAIReplyAsHtml` → `_formatReplyContent` →
`_cleanupHtmlResponse`. The `_markdownToHtml` at `api-openai.js:453` is a **fallback for a
model that ignores the instruction**, not the canonical form.

So: no, we did not still have the pre-render form. There was never a markdown stage to
keep.

**But that turned out not to license widening `richtext`, and we did not.**

We first assumed the HTML was *constrained* — the prompt names `p`, `h4`, `h5`, `b`,
`ul`/`li`, `table`. **That assumption was wrong, and a real reply disproved it.** Asking
Regent for a goblin returns this:

```
<h4>Goblin</h4><br><br>*Small humanoid (goblinoid), any alignment*<br><br>---<br><br>
<b>Armor Class</b> 15 (leather armor, shield)  <br><b>Hit Points</b> 7 (2d6)<br><br>
| STR | DEX | CON |<br>|:---:|:---:|:---:|<br>| 8 (-1) | 14 (+2) | 10 (+0) |
```

Headings and bold as tags; emphasis as `*marks*`; rules and tables as markdown; and `<br>`
doing the work `<p>` was explicitly forbidden from skipping. **The model half-obeys the
format instruction, and the half it ignores is not random — it is everything markdown does
more conveniently.**

So the composer parses both, and the walk is **line-oriented rather than element-oriented**,
because in that reply the line is the unit of structure. Our first version was
element-oriented and collapsed the entire stat block into a single paragraph. `scripts/card-composer.js`:

| From the model | Becomes |
|---|---|
| `<h4>` … `<h6>` | a `section` part |
| `<p>`, unmapped elements | `paragraph` block |
| `<ul>` / `<ol>` | `list` block |
| `<table>` | `table` block |
| `<blockquote>` | `quote` block |
| `<b>` / `<i>` | literal segments carrying `mark: 'strong'` / `'em'` |
| `*italic*`, `**bold**` | recognised and consumed, re-emitted as `mark` |
| `---`, `***`, `___` | dropped — sections already separate what it separated |
| markdown table, 2 columns | `table` block |
| markdown table, header + one row, 3+ columns | **`tiles`** |

Nothing leaves that file as HTML. Every scrap of model text exits inside `{ literal }`.

**Marks are consumed, never forwarded.** We recognise `**` here and emit `mark` on an
escaped literal rather than passing `**` to prose. Your literal docs make the case: a stray
asterisk in model text would otherwise open a run that closes where it should not. Model
text is *full* of stray asterisks.

**`tiles` earned its keep immediately.** A D&D ability-score row is a header line and a
value line, which is precisely a grid of caption-over-value boxes. Your docs say "parts are
named for their shape, not for what you put in them, and `tiles` — ability scores are one
use". That was the right call and it paid off on the first real reply we tested.

---

## The argument we think belongs in your docs

You justified `richtext`'s narrow scope as "building an HTML string in JavaScript and
passing it here defeats the system." That reads as a style rule, and a style rule is
exactly the kind of thing a consumer talks themselves past at 11pm.

The real reason is stronger and it is not about style:

> **`richtext` is enriched, not sanitised. It inherits its safety from the fact that a
> person authored the journal page.** Model output has no author. An `<img src=x
> onerror=...>` in a reply goes straight through.

Widening `richtext` would have admitted the *least-vetted content in the suite* through the
one part that assumes vetted content. That isn't a contract getting blurry — it's the
premise being false.

We'd suggest putting that sentence in the `richtext` section. Had it been there, this
question would have answered itself and you'd not have needed to raise it.

The second-order point: **option 1 and option 2 landed in the same place.** Composing from
markdown and composing from HTML both terminate in escaped literals and structured blocks.
The route was cheaper; the destination was identical.

And a warning for the next module you ask: **"do you still have the markdown?" is not the
right question, and neither is "is your HTML constrained?"** We answered the first "no" and
the second "yes", and only the first was true. If a module's content is machine-generated,
the honest answer is that its shape is whatever the model felt like that day, and the
parser has to expect a mixture. Ask instead: *can you enumerate what your content actually
looks like, from real samples rather than from your prompt?*

---

## Enrichers: inert, and no setting

`@UUID[...]` and `[[/r 2d6]]` from the model render as visible characters.

The reasoning is that **the model does not know this world's document ids**, so any uuid it
emits is invented — it renders as a broken link, not a feature. `[[/r 2d6]]` is a roll
button nobody asked for. We considered a setting and rejected it: a GM would need to
understand both enricher syntax and model behaviour to choose, which makes it cost without
benefit.

We get this for free rather than by a check someone can forget — the literals are already
how the escaping works, so inertness is structural.

**The trigger to revisit is a capability, not a preference.** If Regent ever feeds real
uuids to the model, it stops guessing and starts citing, and honouring them becomes
genuine. Even then the shape is probably not "honour everything" — it's Regent resolving
each id and keeping the ones that exist. Trust-but-verify, not trust. Noted in
`card-composer.js`; not built.

---

## Two corrections to your note

**1. Regent has no card CSS to remove.** You expected four rules. There are none — every
rule in `styles/` is scoped to `#coffee-pub-regent-wrapper`.

That has a consequence worth recording: the GM whisper was posting
`regent-message-header-answer` markup into the chat log, **where those rules never
applied**. It has been rendering unstyled for as long as it has existed. Nobody reported
it, presumably because a whisper the GM sees a few times a session reads as plain text
without looking obviously broken. The migration fixes it rather than porting anything.

If your migration guide asks modules to "port your card CSS," it may be worth asking them
to *check the selectors are actually reaching chat first*. We suspect we are not the only
module that styled a chat card inside a window scope.

**2. `blind: true` has no equivalent in `post()`.** The old whisper set it. On a GM-only
whisper it was doing nothing, so we dropped it rather than reaching around the API — but
flagging it in case you'd rather `post()` carried `blind` alongside `whisper` and
`rollMode`.

---

## One thing we'd ask for

`identity` renders `{{name}}` through Handlebars, so it is escaped but **not** on the text
pipeline — which means `{ literal }` stringifies to `[object Object]` there. We hit this
and caught it before shipping.

Your `toAnchor` note says a literal is accepted rather than rejected on linked row labels
precisely because *"once a consumer has a literal, wrapping every untrusted name is the
correct reflex, and the reflex must not be punished."* That reasoning applies unchanged to
`identity.name` — it is one of the most likely places a consumer puts a user-supplied name.

Either accept and unwrap a literal there, or note in the parts table which fields are
Handlebars-escaped rather than pipeline-processed. The current state punishes the reflex
you asked us to build.

---

## Verification

The composer was run against a DOM harness rather than eyeballed: typical replies, bare
inline runs with no `<p>`, unclosed tags, three-column tables, `<script>` bodies,
`&nbsp;`-only paragraphs, deep nesting, headings alone, empty input.

Then a real goblin lookup broke it, the design was reworked line-first, and it was re-run
against the same suite plus markdown tables, thematic rules, and emphasis edge cases.

Bugs that fell out and are fixed: a bare sentence with inline `<b>` split into three
paragraphs; `<script>` body text surfaced as prose; `<br>` contributed nothing at the top
level, so nothing ever broke; and *"Cost is 5 * 3 gp and 2 * 4 sp"* paired the two
multiplication signs into an italic run — markdown's flanking rule, which forbids a
delimiter opening before a space, is what fixes that and it is not optional for D&D text.

Your degrade-don't-drop instruction shaped the design and was the right call. Unmapped
elements contribute their text as a paragraph; a failed parse falls back to the whole reply
as plain text. The one deliberate exception is `script`/`style`/`iframe` and friends, where
the text is source rather than prose — dropping beats degrading only there, and only for
readability, since nothing is ever re-emitted as HTML.

**Not yet verified in a live world.** Everything above is static analysis plus the harness.


---
---

# Reply — after the four-field fix (2026-08-16)

## Both our call sites moved, and you were right about which one mattered

`identity.name` and `tiles` captions and values now pass `{ literal }`.

**`tiles` was the trap, exactly as you said.** Our composer builds a stat block's ability
row from model text, and it was written to the old contract — plain strings, deliberately,
with a comment explaining that a literal would stringify. The moment your change lands that
comment becomes false and the code becomes *wrong in the dangerous direction*: not a
rendering nit, but model-authored text reaching the enricher in the one part we feed
entirely from model output. A hallucinated `@UUID` in a tile caption would have gone live.

Verified with a deliberately hostile fixture — a markdown table whose cells contain
`@UUID[Actor.abc]{Ogre}` and `[[/r 2d6]]` — and both stay inert.

That is the second time in this migration that the fix was *not* the thing originally
reported. We asked about one field. You found four, and the one we had not thought to ask
about is the one our code was already standing on.

## The guard is the part that generalises

> every declared pipeline field must be rendered unescaped ... verified by breaking it
> deliberately

That is the right lesson and it is not really about escaping. The declaration and the
template are in different files, so the invariant spans a boundary no single reader checks
— and the failure mode is *visible* `&lt;strong&gt;` on the most-used part in the library.
A guard that is only asserted, never broken, is a guard nobody knows works.

## One thing your change creates, worth a line in your changelog

**A field joining the pipeline is a breaking change for consumers in the other direction.**

Before: a plain string worked and `{ literal }` stringified. After: both work. So a consumer
who adopts literals on `identity` / `ribbon` / `tiles` becomes **version-dependent on
Blacksmith**, and on an older build renders `[object Object]` — the exact failure your fix
removes, now inverted and pointing at the modules that took your advice fastest.

Nothing you can do retroactively; the ask is one sentence in the migration guidance:
*if you pass literals to a newly pipelined field, require the Blacksmith that pipelined it.*
We have recorded it in our own changelog under **Requires** and will bump the minimum in
`module.json` when that Blacksmith ships — right now it is in your `[Unreleased]`, so there
is no version for us to pin.

## `blind`

Agreed, and your reasoning is better than ours. We dropped it because it was doing nothing;
`rollMode: 'blindroll'` being the supported route and `post()` already passing `rollMode`
means there was never a gap — we just could not see the route from where we stood.

## On the line-oriented rework

Taking the point. Element-oriented was the obvious design, it was wrong, and no amount of
re-reading the code would have shown it — the goblin did. Worth being precise about *why*
it was invisible: our test fixtures were written from the same mental model as the parser,
so they agreed with it. The real reply was the first input not derived from our own
assumptions.

Which is the same failure as trusting the format instruction, one level up: we validated
against what we believed the model produced rather than against what it produced.

**Still not verified in a live world.** Everything since the goblin is the harness plus
static reading. The composer has not posted a card in a running Foundry yet, and that
remains the honest status.
