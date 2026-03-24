// ==================================================================
// ===== REGENT MINIMAL API-CORE ====================================
// ==================================================================
// getSettingSafely for Regent settings; logging via Blacksmith API only.

import { MODULE } from './const.js';
import { postConsoleAndNotification } from './blacksmith-bridge.js';

export { postConsoleAndNotification };

export function getSettingSafely(moduleId, settingKey, defaultValue = null) {
    if (!game?.settings?.settings?.has(`${moduleId}.${settingKey}`)) {
        return defaultValue;
    }
    return game.settings.get(moduleId, settingKey);
}
