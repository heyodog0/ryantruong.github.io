document.addEventListener('DOMContentLoaded', () => {
    const aboutLink = document.getElementById('about-link');
    const cvLink = document.getElementById('cv-link');
    const gameSection = document.getElementById('game-section');
    const pubsLink = document.getElementById('pubs-link');
    const bioPanel = document.getElementById('bio-panel');
    const pubsPanel = document.getElementById('research-panel');
    const cvPanel = document.getElementById('cv-panel');
    const swapContainer = document.querySelector('.swap-container');
    const contentEl = document.querySelector('.content');
    let currentView = 'game';
    const navEl = document.querySelector('nav');

    // Even gaps alone would leave the middle link off-centre, because the outer
    // labels aren't the same width. Shift the row by half that difference so the
    // middle link lands on the page centre without touching the spacing.
    function alignNav() {
        const first = navEl.firstElementChild.getBoundingClientRect().width;
        const last = navEl.lastElementChild.getBoundingClientRect().width;
        // Set on :root so the Research sub-tabs can share the same optical
        // centre as the nav row above them.
        document.documentElement.style.setProperty(
            '--nav-offset', ((last - first) / 2).toFixed(2) + 'px');
    }

    // Research view holds two sub-views of different heights, so the swap
    // container and the centering variable are re-measured on every switch.
    function sizeResearch() {
        const h = pubsPanel.scrollHeight;
        swapContainer.style.height = h + 'px';
        contentEl.style.setProperty('--pubs-panel-height', h + 'px');
        contentEl.classList.add('view-pubs');
    }

    const tabPubs = document.getElementById('tab-pubs');
    const tabHighlights = document.getElementById('tab-highlights');
    const pubsView = document.getElementById('pubs-view');
    const highlightsView = document.getElementById('highlights-view');

    function showResearchTab(which) {
        const showPubs = which === 'pubs';
        pubsView.classList.toggle('active', showPubs);
        highlightsView.classList.toggle('active', !showPubs);
        tabPubs.classList.toggle('active', showPubs);
        tabHighlights.classList.toggle('active', !showPubs);
        requestAnimationFrame(sizeResearch);
    }

    tabPubs.addEventListener('click', e => { e.preventDefault(); showResearchTab('pubs'); });
    tabHighlights.addEventListener('click', e => { e.preventDefault(); showResearchTab('highlights'); });

    alignNav();
    window.addEventListener('resize', alignNav);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignNav);

    swapContainer.style.height = gameSection.scrollHeight + 'px';

    function showPanel(view) {
        currentView = view;

        gameSection.style.opacity = '0';
        gameSection.style.pointerEvents = 'none';
        gameSection.style.display = '';
        bioPanel.style.opacity = '0';
        bioPanel.style.pointerEvents = 'none';
        pubsPanel.style.opacity = '0';
        pubsPanel.style.pointerEvents = 'none';
        cvPanel.classList.remove('active');
        cvPanel.style.opacity = '0';
        contentEl.classList.remove('view-cv');
        contentEl.classList.remove('view-pubs');

        aboutLink.textContent = 'About';
        pubsLink.textContent = 'Research';
        cvLink.textContent = 'CV';

        if (view === 'game') {
            gameSection.style.opacity = '1';
            gameSection.style.pointerEvents = 'auto';
            swapContainer.style.height = gameSection.scrollHeight + 'px';
        } else if (view === 'about') {
            aboutLink.textContent = 'Back';
            bioPanel.style.opacity = '1';
            bioPanel.style.pointerEvents = 'auto';
            requestAnimationFrame(() => {
                swapContainer.style.height = bioPanel.scrollHeight + 'px';
            });
        } else if (view === 'pubs') {
            pubsLink.textContent = 'Back';
            pubsPanel.style.opacity = '1';
            pubsPanel.style.pointerEvents = 'auto';
            requestAnimationFrame(sizeResearch);
        } else if (view === 'cv') {
            cvLink.textContent = 'Back';
            gameSection.style.display = 'none';
            swapContainer.style.height = 'auto';
            cvPanel.classList.add('active');
            contentEl.classList.add('view-cv');
            requestAnimationFrame(() => {
                cvPanel.style.opacity = '1';
            });
        }

        // A label may have just become "Back", changing its width.
        alignNav();
    }

    aboutLink.addEventListener('click', e => {
        e.preventDefault();
        showPanel(currentView === 'about' ? 'game' : 'about');
    });

    pubsLink.addEventListener('click', e => {
        e.preventDefault();
        showPanel(currentView === 'pubs' ? 'game' : 'pubs');
    });

    cvLink.addEventListener('click', e => {
        e.preventDefault();
        showPanel(currentView === 'cv' ? 'game' : 'cv');
    });

    window.addEventListener('pageshow', e => {
        if (e.persisted) showPanel('game');
    });
});
