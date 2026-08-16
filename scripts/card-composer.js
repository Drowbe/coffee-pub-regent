// ==================================================================
// ===== CARD COMPOSER ==============================================
// ==================================================================
//
// Turns a model reply into a Blacksmith card composition.
//
// WHAT THE INPUT ACTUALLY IS. The prompt asks for HTML and forbids `<br>`. The
// model half-obeys. A real reply looks like this:
//
//     <h4>Goblin</h4><br><br>*Small humanoid*<br><br>---<br><br>
//     <b>Armor Class</b> 15<br><b>Hit Points</b> 7<br><br>
//     | STR | DEX |<br>|:---:|:---:|<br>| 8 (-1) | 14 (+2) |
//
// Headings and bold arrive as tags; emphasis arrives as `*marks*`; rules and
// tables arrive as markdown; and `<br>` does the work `<p>` was asked to do.
// So this file parses BOTH, and the walk is line-oriented rather than
// element-oriented — because in that reply the line, not the element, is the
// unit of structure. An element-oriented walk collapses the whole stat block
// into a single paragraph, which is exactly what the first version did.
//
// WHY NOT `richtext`. Blacksmith has one part that takes an HTML string, and it
// is documented for HTML that already exists in a Foundry document. That part is
// ENRICHED, not sanitised: it inherits its safety from the fact that a person
// authored the page. Model output has no author. An `<img src=x onerror=...>`
// would go straight through, so the least-vetted content in the suite is exactly
// the content that must not take that route.
//
// So nothing here passes HTML onward. Marks are RECOGNISED here and re-emitted
// as `mark` on an escaped literal — never by forwarding `**` to prose, which
// would let a stray asterisk in model text interleave tags.
//
// ENRICHERS ARE INERT BY CONSTRUCTION. Every scrap of model text leaves inside
// `{ literal }`, so an `@UUID[...]` or `[[/r 2d6]]` the model invents renders as
// visible characters. A model does not know this world's document ids, so
// anything it emits is a guess; a hallucinated link and an unrequested roll
// button are both worse than the text. Revisit if Regent ever feeds real uuids
// to the model — and even then the shape is resolve-and-keep-what-exists.
//
// THE WALK DEGRADES, IT DOES NOT DROP. An element with no mapping contributes
// its text, and a parse failure falls back to the whole reply as plain text.

import { MODULE } from './const.js';
import { postConsoleAndNotification } from './api-core.js';

/** Inline tags that map onto one of prose's two marks. */
const MARKS = { b: 'strong', strong: 'strong', i: 'em', em: 'em' };

const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/**
 * The one place dropping beats degrading. A `<script>` body is source, not
 * prose: surfacing its text would put `alert(1)` in the card as a sentence.
 * Nothing here can execute — no HTML is ever re-emitted — so this is about the
 * card reading correctly, not about safety.
 */
const DROP = new Set(['script', 'style', 'noscript', 'template', 'iframe', 'object', 'embed']);

/**
 * Tags that break the flow of a line. Everything NOT here is inline, so a reply
 * that arrives as a bare sentence with a `<b>` in it stays one paragraph
 * instead of splitting at every tag boundary.
 */
const BLOCKS = new Set([
    'address', 'article', 'aside', 'blockquote', 'div', 'dl', 'dd', 'dt',
    'fieldset', 'figure', 'figcaption', 'footer', 'form', 'header', 'hr',
    'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'tbody',
    'td', 'tfoot', 'th', 'thead', 'tr', 'ul', ...HEADINGS
]);

/**
 * `**bold**` or `*italic*`, whichever comes first.
 *
 * The lookarounds are markdown's flanking rule and they are load-bearing: a
 * delimiter may not open before a space or close after one. Without them
 * "Cost is 5 * 3 gp and 2 * 4 sp" pairs the two multiplication signs and
 * italicises the middle of the sentence — which a D&D reply produces often.
 */
const MARKDOWN_MARK = /(\*\*(?!\s)[^*]*?(?<!\s)\*\*|\*(?!\s)[^*]*?(?<!\s)\*)/;

/** A markdown thematic break: three or more of `-`, `*` or `_`. */
const MARKDOWN_RULE = /^\s*([-*_])\s*(?:\1\s*){2,}$/;

/** A markdown table alignment row: `|:---:|---|`. */
const MARKDOWN_DELIMITER_CELL = /^:?-{2,}:?$/;

/**
 * Collapse the whitespace HTML ignores, so a pretty-printed reply does not
 * arrive with newlines and indentation baked into a literal.
 */
function normaliseText(text) {
    return String(text ?? '').replace(/\s+/g, ' ');
}

/**
 * Split text on markdown emphasis into literal segments carrying a `mark`.
 *
 * The markers are consumed here rather than forwarded. Prose would honour a
 * `**` we passed through, but then a lone asterisk anywhere in model text could
 * open a run that closes somewhere it should not — the interleaving problem
 * Blacksmith's own docs warn about. Recognising the marker and emitting `mark`
 * on an escaped literal gives the emphasis without ever handing over markup.
 *
 * An inherited mark wins outright: prose has two marks and a literal carries
 * one, so `<b>bold *and italic*</b>` keeps the bold and drops the nesting.
 *
 * @param {string} text
 * @param {string|null} inheritedMark
 * @returns {Array<{literal: string, mark?: string}>}
 */
function markdownSegments(text, inheritedMark = null) {
    if (!text) return [];

    const segments = [];
    let rest = text;
    let match = rest.match(MARKDOWN_MARK);
    while (match) {
        const [token] = match;
        if (match.index > 0) segments.push({ literal: rest.slice(0, match.index) });
        const strong = token.startsWith('**');
        const inner = token.slice(strong ? 2 : 1, strong ? -2 : -1);
        // A marker pair around nothing but spaces is punctuation, not emphasis.
        if (inner.trim()) segments.push({ literal: inner, mark: strong ? 'strong' : 'em' });
        else segments.push({ literal: token });
        rest = rest.slice(match.index + token.length);
        match = rest.match(MARKDOWN_MARK);
    }
    if (rest) segments.push({ literal: rest });

    // An inherited mark overrides rather than suppresses the split: the markers
    // are still consumed, so `<b>Attack. *melee*</b>` renders bold throughout
    // instead of bold with visible asterisks in it.
    return inheritedMark ? segments.map((seg) => ({ literal: seg.literal, mark: inheritedMark })) : segments;
}

/**
 * One element's children as literal segments. `<br>` is NOT handled here — the
 * caller owns line breaks, because only the caller knows whether it is building
 * a line or the inside of one.
 */
function toSegments(node, inheritedMark = null) {
    const segments = [];
    for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            segments.push(...markdownSegments(normaliseText(child.textContent), inheritedMark));
            continue;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) continue;

        const tag = child.tagName.toLowerCase();
        if (DROP.has(tag)) continue;
        if (tag === 'br') {
            segments.push({ literal: ' ' });
            continue;
        }
        // An unmapped inline element still contributes its text; only its
        // styling is lost, which is the degradation this file promises.
        segments.push(...toSegments(child, inheritedMark ?? MARKS[tag] ?? null));
    }
    return segments;
}

/** Whether a segment array carries anything a reader would see. */
function hasText(segments) {
    return Array.isArray(segments) && segments.some((seg) => seg.literal.trim());
}

/** The plain text behind a segment array, for pattern-matching a line. */
function plainOf(segments) {
    return segments.map((seg) => seg.literal).join('').trim();
}

/**
 * A segment array, or null when the element carries no visible text — an empty
 * `<p>` or one holding only `&nbsp;` must not become an empty block.
 */
function textOf(node) {
    const segments = toSegments(node);
    return hasText(segments) ? segments : null;
}

/** The cells of a markdown table line, outer pipes discarded. */
function markdownCells(line) {
    return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((cell) => cell.trim());
}

/** Whether a line is a markdown table row. */
function isTableLine(line) {
    return /^\s*\|.*\|\s*$/.test(line) && line.includes('|', 1);
}

/** Whether a row is the `|:---:|` alignment row rather than data. */
function isDelimiterRow(cells) {
    return cells.length > 0 && cells.every((cell) => MARKDOWN_DELIMITER_CELL.test(cell));
}

/**
 * An HTML `<table>` as table-block rows.
 *
 * A prose table is label/value, so the first cell is the label and any
 * remaining cells join into the value rather than being discarded — a
 * three-column table the model invented still reads.
 */
function tableRows(table) {
    const rows = [];
    for (const tr of table.querySelectorAll('tr')) {
        const cells = Array.from(tr.children).filter((c) => /^t[dh]$/i.test(c.tagName));
        if (!cells.length) continue;
        const label = textOf(cells[0]) ?? [{ literal: '' }];
        const value = cells.slice(1).flatMap((cell, i) => {
            const segments = textOf(cell);
            if (!segments) return [];
            return i === 0 ? segments : [{ literal: ' — ' }, ...segments];
        });
        rows.push([label, value.length ? value : [{ literal: '' }]]);
    }
    return rows;
}

export function composePartsFromHtml(html) {
    const source = String(html ?? '').trim();
    if (!source) return [];

    try {
        // A complete document rather than a bare fragment: the reply is a
        // fragment, and how loose markup is hoisted into a body varies between
        // parsers. Spelling out the wrapper makes the walk see the same tree
        // everywhere.
        const doc = new DOMParser().parseFromString(`<html><body>${source}</body></html>`, 'text/html');
        const body = doc?.body;
        if (!body) throw new Error('no body parsed');

        const parts = [];
        let blocks = [];

        const pushBlock = (block) => blocks.push(block);
        const flushProse = () => {
            if (blocks.length) parts.push({ part: 'prose', blocks });
            blocks = [];
        };
        // A part cannot sit inside a prose run, so anything that renders as its
        // own part closes the run first and keeps document order.
        const pushPart = (part) => {
            flushProse();
            parts.push(part);
        };

        // ----- lines -------------------------------------------------------
        // `<br>` closes a line; a block element closes the whole run. Lines are
        // held rather than emitted so a group of them can become one table.
        let lines = [];
        let current = [];

        const endLine = () => {
            if (hasText(current)) lines.push(current);
            current = [];
        };

        const emitTable = (rows) => {
            const data = rows.filter((cells) => !isDelimiterRow(cells));
            if (!data.length) return;

            // A header and exactly one data row across three or more columns is
            // a grid of caption-over-value boxes, which is what `tiles` is. An
            // ability score row is the case that made this worth detecting.
            const width = data[0].length;
            if (data.length === 2 && width >= 3 && data[1].length === width) {
                pushPart({
                    part: 'tiles',
                    // Literal like everything else here. Tile captions and values
                    // are model text, and tiles joined the text pipeline in
                    // Blacksmith 2026-08-16 — so a plain string would now be
                    // enriched and mark-parsed, which is exactly the inertness
                    // this file exists to guarantee.
                    items: data[0].map((label, i) => ({
                        label: { literal: label },
                        value: { literal: data[1][i] ?? '' }
                    }))
                });
                return;
            }

            // Otherwise it is label/value: first cell leads, the rest join.
            pushBlock({
                type: 'table',
                rows: data.map((cells) => [
                    markdownSegments(cells[0] ?? ''),
                    markdownSegments(cells.slice(1).join(' — '))
                ])
            });
        };

        const flushLines = () => {
            endLine();
            let table = [];
            const closeTable = () => {
                if (table.length) emitTable(table);
                table = [];
            };

            for (const line of lines) {
                const plain = plainOf(line);

                if (isTableLine(plain)) {
                    table.push(markdownCells(plain));
                    continue;
                }
                closeTable();

                // A thematic break has no part and needs none: sections and
                // block spacing already separate what it was separating.
                if (MARKDOWN_RULE.test(plain)) continue;

                pushBlock({ type: 'paragraph', text: line });
            }
            closeTable();
            lines = [];
        };

        const flushAll = () => {
            flushLines();
            flushProse();
        };

        // ----- walk --------------------------------------------------------
        for (const node of Array.from(body.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
                current.push(...markdownSegments(normaliseText(node.textContent)));
                continue;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) continue;

            const tag = node.tagName.toLowerCase();
            if (DROP.has(tag)) continue;

            // `<br>` is the paragraph separator this content actually uses,
            // whatever the prompt asked for.
            if (tag === 'br') {
                endLine();
                continue;
            }

            if (!BLOCKS.has(tag)) {
                current.push(...toSegments(node, MARKS[tag] ?? null));
                continue;
            }

            flushLines();

            if (HEADINGS.has(tag)) {
                const label = normaliseText(node.textContent).trim();
                if (!label) continue;
                pushPart({ part: 'section', icon: 'fa-solid fa-angles-right', label: { literal: label } });
                continue;
            }

            if (tag === 'ul' || tag === 'ol') {
                const items = Array.from(node.querySelectorAll(':scope > li'))
                    .map((li) => textOf(li))
                    .filter(Boolean);
                if (items.length) pushBlock({ type: 'list', items, ordered: tag === 'ol' });
                continue;
            }

            if (tag === 'table') {
                const rows = tableRows(node);
                if (rows.length) pushBlock({ type: 'table', rows });
                continue;
            }

            if (tag === 'blockquote') {
                const text = textOf(node);
                if (text) pushBlock({ type: 'quote', text });
                continue;
            }

            if (tag === 'hr') continue;

            // `p` and everything without a mapping land here together: an
            // unrecognised wrapper contributes its text rather than vanishing.
            const text = textOf(node);
            if (text) pushBlock({ type: 'paragraph', text });
        }

        flushAll();
        if (parts.length) return parts;
        // Parsed cleanly but yielded nothing worth showing — fall through.
    } catch (error) {
        postConsoleAndNotification(MODULE.NAME, 'Card composer: could not parse AI reply, falling back to plain text.', error?.message ?? error, false, false);
    }

    // Last resort. Tags are stripped by hand here because the parser is what
    // failed, so its textContent is not available to ask. A reply that reads
    // plainly beats one that does not appear.
    const stripped = normaliseText(source.replace(/<[^>]*>/g, ' ')).trim();
    return [{ part: 'prose', blocks: [{ type: 'paragraph', text: [{ literal: stripped || source }] }] }];
}
