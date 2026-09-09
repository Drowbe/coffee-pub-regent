# Regent Settings

**Audience:** a GM configuring Coffee Pub Regent.

Every Regent setting, what it does, and which ones are worth changing. They all live in
**Configure Settings**, **Module Settings**, **Coffee Pub Regent**, under **Regent (AI)**.

All settings are **world-scoped**: they apply to the world, not to one user, and only a GM can change
them.

## Provider

| Setting | What it does |
|---|---|
| **AI Provider** | OpenAI or Anthropic (Claude). Decides which key and model are used. |
| **Game System** | The ruleset Regent assumes when answering. Defaults to D&D 5e. |

**Set this first.** The rest of the AI settings are split into a shared group and one group per
provider, and the provider group that does not match your choice is simply ignored.

## Shared

These apply whichever provider you use.

| Setting | Default | What it does |
|---|---|---|
| **Base Prompt** | A short D&D 5e instruction | Sent ahead of every question, as a system message. This is where you change Regent's voice. |
| **Context Length** | 4 | How many previous exchanges are sent with a new question. Higher means Regent remembers more of the conversation and every question costs more. **Requires a reload.** |
| **Max Output Tokens** | 1200 | The ceiling on a single answer. Raise it if answers stop mid-sentence; be aware a bigger ceiling means a bigger bill on the answers that use it. |
| **Temperature** | 1 | How much the model varies its wording. Lower is more predictable and repetitive, higher is more inventive and less reliable. **Requires a reload.** |
| **Macro** | none | An optional macro to open the Regent window. |

**Base Prompt is the one worth your time.** If Regent is too chatty, too terse, or keeps breaking
character for your setting, change it here rather than repeating instructions in every question.

## OpenAI

| Setting | Notes |
|---|---|
| **OpenAI API Key** | From <https://platform.openai.com/account/api-keys> |
| **OpenAI Project ID** | Optional. Only needed for project-scoped keys. |
| **Model** | GPT-4o Mini by default -- the cheapest sensible choice. GPT-4o is better and costs more. |

## Anthropic

| Setting | Notes |
|---|---|
| **Anthropic API Key** | From <https://console.anthropic.com/settings/keys> |
| **Model** | Claude Haiku by default. The Sonnet and Opus models are stronger and cost more. |

**Only the selected provider's key is used.** A key pasted into the other provider's field does
nothing, and this is the most common reason a working key appears to fail.

## Appearance

| Setting | What it does |
|---|---|
| **Chat Card Theme** | The colour theme for Regent answers posted to chat. Themes come from Blacksmith. |

## Narrative defaults

These pre-fill the Narrative worksheet so you are not re-typing the same choices each session.

| Setting | What it does |
|---|---|
| **Remember Narrative Inputs** | Keeps what you typed between sessions |
| **Default Journal Page Title** | The title new narrative journal pages start with |
| **Include Encounter / Treasure / XP** | Whether a generated narrative includes each by default |
| **Encounter Details / Treasure Details** | How much detail to generate for each |

## Campaign defaults

**Realm**, **Region**, **Site** and **Area** describe where your campaign is set, and are included in
prompts so answers fit your world instead of generic fantasy.

Regent prefers Blacksmith's campaign data when it is configured, and falls back to these.

## What Regent stores without asking

Two settings never appear in the interface: the last worksheet you had open, and the window's size
and position. Both exist so the window reopens where you left it.

## Costs

Regent shows the tokens used and the approximate cost under each answer. The settings that move that
number most are **Model**, then **Context Length**, then **Max Output Tokens**.

**A cheap model with a long context can cost more than an expensive model with a short one.** If you
are watching spend, shorten the context before downgrading the model.
