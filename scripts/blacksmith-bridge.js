// ==================================================================
// ===== BLACKSMITH BRIDGE (no deep imports from scripts/*.js) ======
// ==================================================================
// Runtime access to game.modules.get('coffee-pub-blacksmith')?.api only.
// Regent does not import any URL from the Blacksmith package. See
// documentation/blacksmith-apis.md.

import { MODULE } from './const.js';

/** @returns {import('foundry').Module|null} */
export function getBlacksmithModule() {
    return game.modules.get('coffee-pub-blacksmith') ?? null;
}

/** @returns {object|undefined} */
export function getBlacksmithApi() {
    return getBlacksmithModule()?.api;
}

/**
 * Logging: prefer Blacksmith utils (respects global debug / notifications).
 * Falls back to console if API not ready (should be rare after `ready`).
 */
export function postConsoleAndNotification(strModuleID, message, result = '', blnDebug = false, blnNotification = false) {
    const fn = getBlacksmithApi()?.utils?.postConsoleAndNotification;
    if (typeof fn === 'function') {
        return fn(strModuleID, message, result, blnDebug, blnNotification);
    }
    if (blnNotification) {
        ui.notifications?.warn?.(`${message}${result ? `: ${result}` : ''}`);
    } else if (!blnDebug) {
        console.warn(`[${strModuleID}]`, message, result);
    }
}

export function playSound(sound, volume, loop, broadcast, duration) {
    const fn = getBlacksmithApi()?.utils?.playSound;
    if (typeof fn === 'function') {
        return fn(sound, volume, loop, broadcast, duration);
    }
}

export function trimString(str, maxLength) {
    const fn = getBlacksmithApi()?.utils?.trimString;
    if (typeof fn === 'function') {
        return fn(str, maxLength);
    }
    if (str == null || maxLength == null) return str ?? '';
    const s = String(str);
    return s.length <= maxLength ? s : s.slice(0, maxLength);
}

/** @returns {object|null} HookManager from Blacksmith api, or null */
export function getHookManager() {
    return getBlacksmithApi()?.HookManager ?? null;
}

/**
 * Create journal from Regent narrative JSON via Blacksmith public API only.
 */
export async function createJournalEntryFromBlacksmith(journalData) {
    const api = getBlacksmithApi();
    if (typeof api?.createJournalEntry === 'function') {
        return api.createJournalEntry(journalData);
    }
    const err = new Error(
        'Coffee Pub Blacksmith must expose createJournalEntry on module.api. Update Blacksmith to a release that includes this API.'
    );
    postConsoleAndNotification(MODULE.NAME, err.message, '', false, true);
    throw err;
}
