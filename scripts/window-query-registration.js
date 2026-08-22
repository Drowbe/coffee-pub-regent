// ==================================================================
// ===== WINDOW-QUERY PARTIAL REGISTRATION (Regent) =================
// ==================================================================
//
// Every partial the workspace templates reference by name, as
// `{{> partial-name}}` -> file. Foundry's loader takes this shape
// directly, registers each entry under its key, and fetches them all
// concurrently -- the previous hand-rolled version awaited 33 fetches
// one at a time during `ready`. It also caches: `getTemplate()` returns
// early for a name already in `Handlebars.partials`, so a second call
// costs nothing.
//
// A name only belongs here if a template says `{{> name}}`. Templates
// compiled directly (partial-message.hbs, via REGENT.WINDOW_QUERY_MESSAGE)
// are not partials and must not be listed.

import { MODULE } from './const.js';
import { postConsoleAndNotification } from './api-core.js';

const BASE = `modules/${MODULE.ID}/templates`;

/** @type {Record<string, string>} Handlebars partial name -> template path. */
const PARTIALS = Object.fromEntries([
    // Workspaces (window-query.hbs)
    'window-query-workspace-lookup',
    'window-query-workspace-character',
    'window-query-workspace-assistant',
    'window-query-workspace-narrative',
    'window-query-workspace-encounter',

    // Character
    'partial-character-core',
    'partial-character-abilities',
    'partial-character-skills',
    'partial-character-features',
    'partial-character-weapons',
    'partial-character-spells',
    'partial-character-biography',
    'partial-character-guidance',

    // Shared across workspaces
    'partial-global-options',
    'partial-global-fund',
    'partial-global-skillcheckrolls',

    // Lookup / assistant
    'partial-lookup-srdrules',
    'partial-assistant-criteria',

    // Encounter
    'partial-encounter-configuration',
    'partial-encounter-worksheet',
    'partial-encounter-monsters',
    'partial-encounter-party',
    'partial-encounter-npcs',

    // Narrative
    'partial-narrative-image',
    'partial-narrative-settings',
    'partial-narrative-geography',
    'partial-narrative-details',
    'partial-narrative-rewards',
    'partial-narrative-characters',
    'partial-narrative-encounters'
].map((name) => [name, `${BASE}/${name}.hbs`]));

export async function registerWindowQueryPartials() {
    try {
        await foundry.applications.handlebars.loadTemplates(PARTIALS);
        postConsoleAndNotification(MODULE.NAME, 'Window-query partials registered', `${Object.keys(PARTIALS).length} partials`, true, false);
    } catch (error) {
        postConsoleAndNotification(MODULE.NAME, 'Error registering window-query partials', error.message, false, true);
        console.error('Error registering window-query partials:', error);
    }
}
