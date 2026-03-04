# Coffee Pub Regent

Optional AI tools for the Coffee Pub ecosystem. **Consult the Regent** and worksheets (Lookup, Character, Assistant, Encounter, Narrative) powered by OpenAI. Requires **Coffee Pub Blacksmith**.

## About

Coffee Pub Regent adds AI-powered tools to Foundry VTT via the Blacksmith Utilities toolbar: ask the Regent questions, look up SRD content, build characters, get assistant feedback, design encounters, and generate narrative content. All AI features live in this optional module; Blacksmith provides the shared UI and integration. Supports Foundry v13 and D&D 5e 5.5+.

## Download & Installation

**Requires:** [Coffee Pub Blacksmith](https://github.com/Drowbe/coffee-pub-blacksmith/releases/latest/download/module.json) — install and enable it first.

### Install from Foundry (recommended)

1. In Foundry, go to **Add-on Modules** → **Install Module**.
2. Click **Install Module** and paste this manifest URL:
   ```
   https://github.com/Drowbe/coffee-pub-regent/releases/latest/download/module.json
   ```
3. Install, then enable **Coffee Pub Regent** in **Configure Settings → Module Settings**.

### Manual install

1. Download the latest release: [coffee-pub-regent.zip](https://github.com/Drowbe/coffee-pub-regent/releases/latest/download/coffee-pub-regent.zip).
2. Extract the `coffee-pub-regent` folder into your Foundry **Data/modules/** directory (alongside `coffee-pub-blacksmith`).
3. Enable **Coffee Pub Regent** in **Configure Settings → Module Settings**.

## Configuration

Configure your OpenAI API key and model in **Configure Settings → Module Settings → Coffee Pub Regent → Regent (AI)**. Without an API key, the Regent window will open but queries will fail until the key is set.

## Toolbar

When Regent is enabled, it registers six tools on the Blacksmith Utilities toolbar: Consult the Regent, Lookup, Character, Assistant, Encounter, Narrative. GM-only worksheets (Assistant, Encounter, Narrative) appear only for GMs.
