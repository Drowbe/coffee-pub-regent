// ==================================================================
// ===== REGENT CORE ================================================
// ==================================================================

import { MODULE, REGENT } from './const.js';
import { postConsoleAndNotification } from './api-core.js';
import { RegentAIAPI } from './api-openai.js';

async function playSoundSafe(sound, volume = 0.5) {
    try {
        const { playSound } = await import('./blacksmith-bridge.js');
        if (playSound && (window.COFFEEPUB?.SOUNDPOP02 || sound)) {
            playSound(sound || window.COFFEEPUB?.SOUNDPOP02, volume ?? window.COFFEEPUB?.SOUNDVOLUMESOFT ?? 0.5);
        }
    } catch (_) {}
}

export function generateFormattedDate(format) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours() <= 12 ? now.getHours() : now.getHours() - 12;
    const minutes = now.getMinutes();
    const am_pm = now.getHours() >= 12 ? 'PM' : 'AM';
    const paddedHours = hours < 10 ? `0${hours}` : hours;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${paddedHours}:${paddedMinutes} ${am_pm}`;
    const formattedDate = `${year}-${month}-${day}`;
    if (format === 'time') return formattedTime;
    if (format === 'date') return formattedDate;
    return `${formattedDate} ${formattedTime}`;
}

/**
 * Strip markdown code fences and isolate a `{ ... }` blob so model output still parses when wrapped in ```json.
 */
function extractJsonStringForParse(str) {
    if (str == null || typeof str !== 'string') return str;
    let s = str.trim();
    const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/im;
    const m = s.match(fence);
    if (m) s = m[1].trim();
    if (s.startsWith('{')) return s;
    const objMatch = s.match(/\{[\s\S]*\}/);
    return objMatch ? objMatch[0] : s;
}

export function cleanAndValidateJSON(str) {
    try {
        const extracted = extractJsonStringForParse(str);
        const parsed = JSON.parse(extracted);
        if (typeof parsed !== 'object' || parsed === null) return { isValid: false };
        const plainTextFields = ['journaltype', 'foldername', 'sceneparent', 'scenearea', 'sceneenvironment', 'scenelocation', 'scenetitle', 'prepencounter', 'contextintro'];
        const cardPlainTextFields = ['cardtitle', 'cardimagetitle', 'cardimage', 'carddescriptionprimary', 'carddescriptionsecondary'];
        const listFields = ['prepencounterdetails', 'preprewards', 'prepsetup', 'contextadditionalnarration', 'contextatmosphere', 'contextgmnotes'];
        for (const field of plainTextFields) {
            if (parsed[field]) parsed[field] = parsed[field].replace(/<[^>]*>/g, '').trim();
        }
        for (const field of listFields) {
            if (parsed[field]) {
                let content = parsed[field].replace(/<h[1-6]>.*?<\/h[1-6]>/g, '');
                if (!content.startsWith('<ul>')) content = '<ul>' + content;
                if (!content.endsWith('</ul>')) content = content + '</ul>';
                parsed[field] = content;
            }
        }
        const cleanOneCard = (c) => {
            if (!c || typeof c !== 'object') return c;
            for (const field of cardPlainTextFields) {
                if (c[field]) c[field] = c[field].replace(/<[^>]*>/g, '').trim();
            }
            if (c.cardimage) {
                const match = c.cardimage.match(/src="([^"]*)"/);
                c.cardimage = match ? match[1] : c.cardimage;
                if (c.cardimage === '<img src="" alt="">' || !c.cardimage) c.cardimage = '';
            }
            if (c.carddialogue) {
                if (c.carddialogue === '<h4></h4>' || !c.carddialogue.trim()) c.carddialogue = ' ';
                else c.carddialogue = c.carddialogue.replace(/<h[1-5]>.*?<\/h[1-5]>/g, '').replace(/<(?!\/?(?:h6|b)(?:>|\s[^>]*>))\/?[a-zA-Z][^>]*>/g, '').trim();
            }
            return c;
        };
        const sectionPlainTextFields = ['sectiontitle', 'sectionintro'];
        const cleanOneSection = (sec) => {
            if (!sec || typeof sec !== 'object') return sec;
            for (const field of sectionPlainTextFields) {
                if (sec[field]) sec[field] = sec[field].replace(/<[^>]*>/g, '').trim();
            }
            if (Array.isArray(sec.cards)) sec.cards = sec.cards.map(cleanOneCard);
            return sec;
        };
        if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
            parsed.sections = parsed.sections.map(cleanOneSection);
        } else {
            const rawCards = Array.isArray(parsed.cards) && parsed.cards.length > 0 ? parsed.cards : [{
                cardtitle: parsed.cardtitle, carddescriptionprimary: parsed.carddescriptionprimary, cardimagetitle: parsed.cardimagetitle,
                cardimage: parsed.cardimage, carddescriptionsecondary: parsed.carddescriptionsecondary, carddialogue: parsed.carddialogue
            }];
            parsed.sections = [cleanOneSection({ sectiontitle: parsed.sectiontitle ?? '', sectionintro: parsed.sectionintro ?? '', cards: rawCards.map(cleanOneCard) })];
        }
        return { isValid: true, cleaned: JSON.stringify(parsed, null, 2), parsed };
    } catch (e) {
        return { isValid: false };
    }
}

function scrollToBottom() {
    const el = document.querySelector(`#${MODULE.ID}-output`);
    if (el) el.scrollTop = el.scrollHeight;
}

export async function buildQueryCard(question, queryWindow, queryContext = '') {
    if (queryWindow._regentSubmitting) {
        postConsoleAndNotification(MODULE.NAME, 'A Regent request is already in progress.', '', false, false);
        return;
    }
    queryWindow._regentSubmitting = true;
    let requestId = null;

    try {
        const strQuestion = question;
        let strDisplayQuestion = question;
        let strAnswer = "";
        const strQueryContext = queryContext;
        const strDateStamp = generateFormattedDate();
        requestId = `regent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const template = await foundry.applications.handlebars.getTemplate(REGENT.WINDOW_QUERY_MESSAGE);

        if (strQueryContext) strDisplayQuestion = strQueryContext;

        let CARDDATA = {
            strDateStamp, blnProcessing: false, blnToolbar: false,
            strSpeakerIcon: "fa-helmet-battle", strHeaderStlye: "regent-message-header-question",
            strSpeakerName: game.user.name, strMessageIntro: "", strMessageContent: strDisplayQuestion
        };
        queryWindow.displayMessage(template(CARDDATA));
        scrollToBottom();
        await playSoundSafe(window.COFFEEPUB?.SOUNDPOP02, window.COFFEEPUB?.SOUNDVOLUMESOFT);

        CARDDATA = {
            strDateStamp, blnProcessing: true, blnToolbar: false,
            strSpeakerIcon: "fa-crystal-ball", strSpeakerName: "Regent",
            strMessageIntro: "Thinking...", strMessageContent: "", requestId
        };
        queryWindow.displayMessage(template(CARDDATA));
        scrollToBottom();
        await playSoundSafe(window.COFFEEPUB?.SOUNDPOP01, window.COFFEEPUB?.SOUNDVOLUMESOFT);

        const aiResponse = await RegentAIAPI.getAIReplyAsHtml(strQuestion, { useConversationHistory: false });
        queryWindow.removeProcessingMessage(requestId);
        const jsonCheck = cleanAndValidateJSON(aiResponse.content || aiResponse);
        strAnswer = jsonCheck.isValid ? jsonCheck.cleaned : (aiResponse.content || aiResponse);

        const messageId = Date.now();
        CARDDATA = {
            strDateStamp, blnProcessing: false, blnToolbar: true,
            strSpeakerIcon: "fa-crystal-ball", strHeaderStlye: "regent-message-header-answer",
            strSpeakerName: "Regent", strMessageIntro: "", strMessageContent: strAnswer,
            messageId, blnIsJSON: jsonCheck.isValid,
            tokenInfo: aiResponse.usage ? `${aiResponse.usage.total_tokens} Tokens` : null,
            cost: aiResponse.cost ? aiResponse.cost.toFixed(4) : null
        };
        queryWindow.displayMessage(template(CARDDATA));
        scrollToBottom();
        await playSoundSafe(window.COFFEEPUB?.SOUNDNOTIFICATION05, window.COFFEEPUB?.SOUNDVOLUMESOFT);
    } finally {
        queryWindow.removeProcessingMessage(requestId);
        queryWindow._regentSubmitting = false;
    }
}

export async function buildButtonEventRegent(worksheet = 'default') {
    const { BlacksmithWindowQuery } = await import('./window-query.js');
    const queryWindow = new BlacksmithWindowQuery({}, worksheet);
    queryWindow.onFormSubmit = async (inputMessage, queryContext = '') => {
        await buildQueryCard(inputMessage, queryWindow, queryContext);
    };
    queryWindow.formTitle = REGENT.WINDOW_QUERY_TITLE;
    await playSoundSafe(window.COFFEEPUB?.SOUNDNOTIFICATION01, window.COFFEEPUB?.SOUNDVOLUMENORMAL);
    queryWindow.render(true);
    queryWindow.initialize();
}
