// ==================================================================
// ===== REGENT APPLICATION V2 BASE =================================
// ==================================================================
// Regent-owned Application V2 shell (Handlebars zones). Same contract as
// the Coffee Pub shared window template: class names use the
// blacksmith-window-template-* prefix so existing Regent CSS continues
// to match. No imports from other modules.

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class RegentWindowBaseV2 extends HandlebarsApplicationMixin(ApplicationV2) {
    /** Override in subclass: CSS class on the template root. */
    static ROOT_CLASS = 'blacksmith-window-template-root';

    /** Subclass sets: { actionName: staticMethod }. */
    static ACTION_HANDLERS = null;

    static _ref = null;
    static _delegationAttached = false;

    _getRoot() {
        const byId = document.getElementById(this.id);
        if (byId) return byId;
        const rootClass = this.constructor.ROOT_CLASS;
        return document.querySelector(`.${rootClass}`) ?? this.element ?? null;
    }

    async _prepareContext(options = {}) {
        const base = await super._prepareContext?.(options) ?? {};
        const data = await this.getData(options);
        const merged = foundry.utils.mergeObject(base, data);
        if (merged.showOptionBar === undefined) merged.showOptionBar = true;
        if (merged.showHeader === undefined) merged.showHeader = true;
        if (merged.showTools === undefined) merged.showTools = true;
        if (merged.showActionBar === undefined) merged.showActionBar = true;
        return merged;
    }

    _saveScrollPositions() {
        const root = this._getRoot();
        const body = root?.querySelector?.('.blacksmith-window-template-body');
        return { body: body ? body.scrollTop : 0 };
    }

    _restoreScrollPositions(saved) {
        if (!saved) return;
        const root = this._getRoot();
        const body = root?.querySelector?.('.blacksmith-window-template-body');
        if (body != null && saved.body != null) body.scrollTop = saved.body;
    }

    async render(force = false) {
        const scrolls = this._saveScrollPositions();
        const result = await super.render(force);
        requestAnimationFrame(() => {
            this._restoreScrollPositions(scrolls);
            this._applyWindowSizeConstraints();
        });
        return result;
    }

    _applyWindowSizeConstraints() {
        const constraints = this.options?.windowSizeConstraints ?? {};
        const win = this.element?.closest?.('.window') ?? document.getElementById(this.id)?.closest?.('.window');
        if (!win || typeof win.style === 'undefined') return;
        const apply = (key, styleKey) => {
            const v = constraints[key];
            if (v != null && v !== '') win.style[styleKey] = typeof v === 'number' ? `${v}px` : v;
        };
        apply('minWidth', 'minWidth');
        apply('minHeight', 'minHeight');
        apply('maxWidth', 'maxWidth');
        apply('maxHeight', 'maxHeight');
    }

    _attachDelegationOnce() {
        this.constructor._ref = this;
        const Ctor = this.constructor;
        if (Ctor._delegationAttached) return;
        Ctor._delegationAttached = true;
        const handlers = Ctor.ACTION_HANDLERS;
        if (!handlers || typeof handlers !== 'object') return;
        document.addEventListener('click', (e) => {
            const w = Ctor._ref;
            if (!w) return;
            const root = w._getRoot();
            const inRoot = root?.contains?.(e.target);
            const inApp = w.element?.contains?.(e.target);
            if (!inRoot && !inApp) return;
            const btn = e.target.closest?.('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const fn = handlers[action];
            if (typeof fn === 'function') {
                e.preventDefault?.();
                fn(e, btn);
            }
        }, true);
    }

    async _onFirstRender(_context, options) {
        await super._onFirstRender?.(_context, options);
        this._attachDelegationOnce();
    }

    activateListeners(html) {
        super.activateListeners(html);
        this._attachDelegationOnce();
    }
}
