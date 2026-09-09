# Coffee Pub Regent

**Audience:** anyone using or building on Coffee Pub Regent.

Regent puts a large language model behind your GM screen. Ask it a rules question, hand it a
character sheet and ask what to do next, or have it draft an encounter or a scene and drop the
result straight into a journal entry.

Regent is optional, and it requires [Coffee Pub Blacksmith](https://github.com/Drowbe/coffee-pub-blacksmith).
Blacksmith supplies the window frame, the toolbar, the chat cards and the campaign context; Regent
supplies the AI.

## Start here

| If you want to | Read |
|---|---|
| Install it and ask a first question | [userguide-getting-started](userguides/userguide-getting-started.md) |
| Choose a provider and set an API key | [userguide-settings](userguides/userguide-settings.md) |
| Understand the five worksheets | [userguide-worksheets](userguides/userguide-worksheets.md) |
| Post an answer to chat, or turn one into a journal | [userguide-sharing-answers](userguides/userguide-sharing-answers.md) |
| Call Regent's AI from your own module | [api-openai](api/api-openai.md) |
| Change Regent, or understand why it is built this way | [architecture-regent](architecture/architecture-regent.md) |

## What it costs

Regent talks to a commercial API using **your** key, and every question spends your own credit. It
ships with no key and cannot work without one. Nothing is billed through Regent, the Coffee Pub
suite, or Foundry.

## Requirements

- Foundry VTT **v13 or v14**
- **D&D 5e** 5.5 or later
- **Coffee Pub Blacksmith** 14.1.0 or later
- An API key from **OpenAI** or **Anthropic**
