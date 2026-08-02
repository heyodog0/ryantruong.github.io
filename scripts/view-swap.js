/* Swaps the homepage between the game and the About / Research / Notes / CV
   panels. Clicking a view's own nav link again returns to the game. */
document.addEventListener('DOMContentLoaded', () => {
    const el = id => document.getElementById(id);

    const navEl = document.querySelector('nav');
    const contentEl = document.querySelector('.content');
    const swapContainer = document.querySelector('.swap-container');
    const gameSection = el('game-section');

    // One entry per view. `label` is the nav text when the view is closed; the
    // open view's link reads "Back" instead. `bodyClass` re-centres the page
    // for the two tall views. `flows` marks a panel that sits in the document
    // instead of overlaying (only the CV, whose embed drives the page height).
    const VIEWS = {
        about: {
            link: el('about-link'), label: 'About', panel: el('bio-panel'),
        },
        research: {
            link: el('research-link'), label: 'Research', panel: el('research-panel'),
            // sizeResearch decides whether this class is worth applying.
            bodyClass: 'view-research', deferClass: true,
        },
        notes: {
            link: el('notes-link'), label: 'Notes', panel: el('notes-panel'),
        },
        cv: {
            link: el('cv-link'), label: 'CV', panel: el('cv-panel'),
            bodyClass: 'view-cv', flows: true,
        },
    };
    const views = Object.values(VIEWS);

    let currentView = 'game';

    /* ---------- nav centring ---------- */

    // Even gaps would leave the middle link off-centre, because the outer
    // labels aren't the same width. Shift the row by half that difference so
    // the middle link lands on the page centre without touching the spacing.
    function alignNav() {
        // With an even number of links there is no middle item to centre, so
        // the row centres on its own box and no nudge is wanted.
        const offset = navEl.children.length % 2 === 0
            ? 0
            : (navEl.lastElementChild.getBoundingClientRect().width -
               navEl.firstElementChild.getBoundingClientRect().width) / 2;
        // Set on :root so the research sub-tabs can share the same centre.
        document.documentElement.style.setProperty('--nav-offset', offset.toFixed(2) + 'px');
    }

    /* ---------- view switching ---------- */

    // The research panel's height is measured rather than declared, since it
    // changes with the sub-tab and grows as entries are added.
    //
    // Centring the panel moves the header by (h - 390)/2 px versus the default
    // position — 390 being where the two rules in layout.css agree
    // (2 x 290 - 190). For a short panel that works out to a pixel or two,
    // which just reads as the page twitching, so leave it where it is.
    const PULL_BREAK_EVEN = 390;
    const PULL_MIN = 32; // ignore shifts smaller than 16px

    function sizeResearch() {
        const h = VIEWS.research.panel.scrollHeight;
        swapContainer.style.height = h + 'px';
        contentEl.style.setProperty('--research-panel-height', h + 'px');
        contentEl.classList.toggle('view-research', h > PULL_BREAK_EVEN + PULL_MIN);
    }

    function showView(name) {
        currentView = name;

        // Reset everything, then activate the one view that's showing.
        views.forEach(v => {
            v.panel.classList.remove('active');
            v.panel.style.opacity = '';
            v.link.textContent = v.label;
            if (v.bodyClass) contentEl.classList.remove(v.bodyClass);
        });

        const view = VIEWS[name];
        gameSection.classList.toggle('faded', name !== 'game');
        // The CV needs the game out of the flow entirely so it can size itself.
        gameSection.style.display = view && view.flows ? 'none' : '';

        if (!view) {
            swapContainer.style.height = gameSection.scrollHeight + 'px';
            alignNav();
            return;
        }

        view.link.textContent = 'Back';
        view.panel.classList.add('active');
        if (view.bodyClass && !view.deferClass) contentEl.classList.add(view.bodyClass);

        if (view.flows) {
            swapContainer.style.height = 'auto';
            // display can't be transitioned, so fade in on the next frame.
            requestAnimationFrame(() => { view.panel.style.opacity = '1'; });
        } else if (name === 'research') {
            requestAnimationFrame(sizeResearch);
        } else {
            requestAnimationFrame(() => {
                swapContainer.style.height = view.panel.scrollHeight + 'px';
            });
        }

        alignNav(); // a label just became "Back", changing its width
    }

    Object.entries(VIEWS).forEach(([name, view]) => {
        view.link.addEventListener('click', e => {
            e.preventDefault();
            showView(currentView === name ? 'game' : name);
        });
    });

    /* ---------- research sub-tabs ---------- */

    const TABS = {
        highlights: { tab: el('tab-highlights'), view: el('highlights-view') },
        publications: { tab: el('tab-publications'), view: el('publications-view') },
    };

    Object.entries(TABS).forEach(([name, { tab }]) => {
        tab.addEventListener('click', e => {
            e.preventDefault();
            Object.entries(TABS).forEach(([other, t]) => {
                t.tab.classList.toggle('active', other === name);
                t.view.classList.toggle('active', other === name);
            });
            requestAnimationFrame(sizeResearch);
        });
    });

    /* ---------- init ---------- */

    // Highlight thumbnails carry width/height so their box is reserved before
    // they load; this re-measures anyway in case one is ever added without them.
    VIEWS.research.panel.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
            img.addEventListener('load', () => {
                if (currentView === 'research') sizeResearch();
            }, { once: true });
        }
    });

    alignNav();
    window.addEventListener('resize', alignNav);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignNav);

    swapContainer.style.height = gameSection.scrollHeight + 'px';

    window.addEventListener('pageshow', e => {
        if (e.persisted) showView('game');
    });
});
