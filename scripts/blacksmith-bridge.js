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

// ==================================================================
// ===== CHAT CARDS =================================================
// ==================================================================

/** @returns {object|null} Blacksmith Chat Cards API, or null if unavailable. */
export function getChatCards() {
    return getBlacksmithApi()?.chatCards ?? null;
}

/**
 * The theme id to pass to `chatCards.post({ theme })`.
 *
 * The chokepoint for one migration wrinkle: the `chatCardTheme` setting used to
 * be built from `getThemeChoicesWithClassNames()`, so every world that ran an
 * earlier Regent has a CSS CLASS NAME stored ('theme-default', 'theme-blue')
 * where `post()` now wants an ID ('default', 'blue'). Normalising on read means
 * no migration script and no reason for a caller to know the difference.
 *
 * Resolution order: a stored value that is already a valid id wins; otherwise a
 * stored class name is matched back to its theme; otherwise null, which lets
 * `post()` fall through to the world default rather than pinning a guess.
 *
 * @returns {string|null}
 */
export function getChatCardThemeId() {
    let stored = null;
    try {
        stored = game.settings.get(MODULE.ID, 'chatCardTheme');
    } catch (_) { /* setting not registered yet */ }
    if (!stored) return null;

    const chatCards = getChatCards();
    if (!chatCards?.getThemes) return null;

    const themes = chatCards.getThemes('card') ?? [];
    if (themes.some((t) => t.id === stored)) return stored;

    const byClassName = themes.find((t) => t.className === stored);
    return byClassName ? byClassName.id : null;
}
