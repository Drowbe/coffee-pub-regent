# Coffee Pub Regent

Ask an AI for a rules answer, a character's backstory, an encounter built for your actual party, or a
scene that lands in your journal as a real entry. Optional AI tools for the Coffee Pub suite.

![Latest Release](https://img.shields.io/github/v/release/Drowbe/coffee-pub-regent)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Drowbe/coffee-pub-regent/release.yml?event=push)
![GitHub all releases](https://img.shields.io/github/downloads/Drowbe/coffee-pub-regent/total)
![Foundry v13](https://img.shields.io/badge/foundry-v13-yellow)
![Foundry v14](https://img.shields.io/badge/foundry-v14-green)
![MIT License](https://img.shields.io/badge/license-MIT-blue)

## What it does

- **Answers rules questions** without leaving the table or opening a browser.
- **Works from your actual characters.** Select a token and the Character worksheet fills itself in
  from that sheet, so you get answers about that character rather than a generic one.
- **Builds encounters for your party.** Drag in your players and the monsters you are considering;
  Regent tracks total CR and reasons about the fight your table will actually have.
- **Writes scenes straight into journals.** A narrative answer becomes a real journal entry with
  pages and linked encounters, not a wall of text you reformat by hand.
- **Posts answers to chat** as themed cards the whole table can read.
- **Keeps the GM informed.** When a player consults the Regent, the GM gets a private report of what
  was asked and what was sent.
- **Your choice of provider.** OpenAI or Anthropic, with your own key and your own model.

## Requirements

- **Foundry VTT v13 or v14**
- **D&D 5e** 5.5 or later
- **[Coffee Pub Blacksmith](https://github.com/Drowbe/coffee-pub-blacksmith)** 14.1.0 or later,
  installed and enabled
- **An API key** from [OpenAI](https://platform.openai.com/account/api-keys) or
  [Anthropic](https://console.anthropic.com/settings/keys)

**Regent ships with no API key and cannot work without one.** It calls a commercial service using
your key, and every question spends your own credit. Nothing is billed through Regent, the Coffee Pub
suite, or Foundry.

## Install

In Foundry, go to **Add-on Modules**, **Install Module**, and paste:

```
https://github.com/Drowbe/coffee-pub-regent/releases/latest/download/module.json
```

Then enable **Coffee Pub Regent** in **Configure Settings**, **Module Settings**, and set your
provider and API key under **Regent (AI)**.

## Read more

Everything lives in the [wiki](https://github.com/Drowbe/coffee-pub-regent/wiki):

- **[Getting Started](https://github.com/Drowbe/coffee-pub-regent/wiki/userguide-getting-started)** -- installed to first answer
- **[Settings](https://github.com/Drowbe/coffee-pub-regent/wiki/userguide-settings)** -- every setting, and the three that affect cost
- **[The Worksheets](https://github.com/Drowbe/coffee-pub-regent/wiki/userguide-worksheets)** -- Lookup, Character, Assistant, Encounter, Narrative
- **[Sharing Answers](https://github.com/Drowbe/coffee-pub-regent/wiki/userguide-sharing-answers)** -- chat, clipboard, journals
- **[AI API](https://github.com/Drowbe/coffee-pub-regent/wiki/api-openai)** -- calling Regent's AI from your own module

## A caution

**Regent is a writing tool, not a rules engine.** It will hand you a stat block with the wrong
proficiency bonus, or an encounter whose difficulty maths does not hold up, phrased exactly as
confidently as a correct answer. Read what it gives you before it reaches your table.

## The Coffee Pub suite

Regent is one of fifteen modules. **[Blacksmith](https://github.com/Drowbe/coffee-pub-blacksmith)**
is the hub every other module requires; the rest add combat tools, journals, loot, music, maps and
more. Browse them all from the [Blacksmith wiki](https://github.com/Drowbe/coffee-pub-blacksmith/wiki).

<!-- global:ai-assistance -->
## AI Assistance and the Illusion of Good Code

I started writing Foundry modules for use at my own table back in 2020. There were already a ton of amazing modules out there, but they either didn't quite do what I wanted or didn't deliver the kind of user experience I was looking for.

I've been a design leader for more than 20 years, but I spent the first half of my career as a developer, so building my own modules seemed like a fun way to kill some time. I'm a pretty good designer. I'm a decent developer. But, over time, my hand-written code and hacks got a little messy (and memory-leaky, and a little buggy. Feels good to say it out loud.).

Today, the Coffee Pub suite of modules is developed with AI assistance, primarily Claude and Cursor, for documentation, refactoring, debugging, and other development work. Every change is reviewed and committed by me, and nothing reaches a release that I haven't crawled and run at my own table. I can't seem to give up my IDE. The UX design, architecture, and ideas still come from my own fever dreams and chronic lack of sleep.

Testing and verifying a change means running it in Foundry so I can watch the console, break things, fix them, and hone the experience. The repositories carry a set of tools for testing the things that are difficult to catch through review and manual testing alone. They help ensure styles don't conflict, shared coding and documentation standards stay consistent, and the suite of modules continues to work well as a system without silently breaking.

Those checks are there because AI-assisted development can move very quickly, and without oversight, engagement, and planning, it can also go confidently off the rails and deliver the illusion of good code. The AI helps me build faster. It doesn't decide what gets built, its architecture, or how it should work. You can blame this human for that.

If the idea of AI-assisted development keeps you up at night or just isn't your jam, no worries at all. I get it. You do you.
<!-- /global:ai-assistance -->

## Licence and credits

Released under the **MIT Licence**. See [LICENSE](LICENSE).

Built by **Drowbe** as part of the Coffee Pub suite.
