# Getting Started with Regent

**Audience:** a GM installing Coffee Pub Regent for the first time.

Regent adds an AI assistant to Foundry. This guide takes you from installed to first answer.

## Before you start

You need three things:

1. **Coffee Pub Blacksmith**, installed and enabled. Regent will not load without it.
2. **Foundry v13 or v14**, running **D&D 5e** 5.5 or later.
3. **An API key** from either OpenAI or Anthropic.

**The key is the part people miss.** Regent ships without one and cannot work without one. It talks
to a commercial service using your key, and every question you ask spends your own credit. Nothing is
billed through Regent or Foundry.

If you have no key, get one first:

- **OpenAI:** <https://platform.openai.com/account/api-keys>
- **Anthropic:** <https://console.anthropic.com/settings/keys>

Either works. You do not need both.

## Install

1. In Foundry, go to **Add-on Modules**, then **Install Module**.
2. Paste this manifest URL:
   `https://github.com/Drowbe/coffee-pub-regent/releases/latest/download/module.json`
3. Install, then enable **Coffee Pub Regent** in **Configure Settings**, **Module Settings**.

## Set your key

Go to **Configure Settings**, **Module Settings**, **Coffee Pub Regent**, **Regent (AI)**.

1. Set **AI Provider** to OpenAI or Anthropic.
2. Paste your key into the matching field -- **OpenAI API Key** or **Anthropic API Key**. Filling in
   the wrong one is the single most common reason a first question fails.
3. Leave everything else alone for now. The defaults are sensible, and
   [userguide-settings](userguide-settings.md) explains the rest when you want it.

## Ask your first question

Open Regent from the **Blacksmith Utilities toolbar** -- the crystal ball icon. It is also in the
Blacksmith menubar.

The window opens on a chat-style workspace. Type a question into the box at the bottom and submit.
Try something small first, so a mistake costs almost nothing:

> What does the Help action do?

You will see your question, then a **Thinking...** marker, then the answer. The footer of each answer
shows the tokens used and the approximate cost of that exchange.

**If nothing comes back**, the answer is almost always the key: wrong provider selected, key pasted
into the other provider's field, or a key with no credit on the account.

## What to do with an answer

Three buttons sit under every answer:

| Button | Does |
|---|---|
| **Create journal** | Turns a structured answer into a journal entry |
| **Copy** | Copies the answer to your clipboard |
| **Send to Chat** | Posts the answer to the chat log for the table to read |

[userguide-sharing-answers](userguide-sharing-answers.md) covers these properly, including why
Create journal only makes sense for some answers.

## Then explore the worksheets

The chat box is the simplest way in. The five worksheets down the side are the reason to keep Regent:
they build a much more detailed prompt than you would type by hand, from your actual party, tokens
and campaign. [userguide-worksheets](userguide-worksheets.md) walks through each one.

## A word of warning

**Regent is a writing tool, not a rules engine.** It will hand you a stat block with the wrong
proficiency bonus or an encounter whose difficulty maths does not hold up, phrased exactly as
confidently as a correct answer. Read what it gives you before it reaches your table.
