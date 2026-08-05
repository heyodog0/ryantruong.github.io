function createThemeToggle() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark mode');

    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`;

    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;

    const isDarkInitially = document.documentElement.classList.contains('dark-mode');
    button.innerHTML = isDarkInitially ? sunIcon : moonIcon;

    let animating = false;

    // The ripple is a circular window holding a copy of the page in the theme
    // we're moving to, sliding across the live page. Content stays visible on
    // both sides of its edge, and because the only thing animating is a pair of
    // cancelling translations it runs entirely on the compositor.
    //
    // Why translate and not a growing clip or scale:
    //   - Chrome animates clip-path on the main thread (Safari composites it),
    //     re-rasterising the whole covered area every frame. That's the stutter,
    //     and it scales with the window, so it hides on a small one.
    //   - Scaling a circle up needs the copy inside counter-scaled by 1/s, which
    //     is not linear, so it can't be expressed as a keyframe pair — and it
    //     would make Chrome rasterise the copy at up to ~60x early on.
    //   - Translation's inverse is another translation, so `bubble` and `inner`
    //     move by exactly opposite amounts under the same easing and the copy
    //     stays pinned to the viewport to the pixel.
    // The tradeoff is that a circle of fixed radius can't start as a point, so
    // the sweep begins at the button's corner rather than at the button.
    function buildRevealLayer(willBeDark, geom) {
        const bubble = document.createElement('div');
        bubble.className = `theme-reveal ${willBeDark ? 'theme-dark' : 'theme-light'}`;
        bubble.style.width = bubble.style.height = `${geom.radius * 2}px`;
        bubble.style.left = `${geom.left}px`;
        bubble.style.top = `${geom.top}px`;

        // Counter-translated viewport-sized box. Body's classes ride along so
        // page-scoped rules still match inside the copy (.post-page on the note
        // pages); offsetting by the bubble's own position puts it back over the
        // real viewport.
        const inner = document.createElement('div');
        inner.className = `theme-reveal-inner ${document.body.className}`;
        inner.style.left = `${-geom.left}px`;
        inner.style.top = `${-geom.top}px`;
        // Sized from clientWidth/Height, not 100vw/100vh: those include the
        // scrollbar, which would shift the copy's centred content sideways
        // relative to the real page.
        inner.style.width = `${geom.viewW}px`;
        inner.style.height = `${geom.viewH}px`;

        // Reproduce body's layout inline. Inline beats whatever the classes we
        // just copied would set, so this holds on every page template.
        const bodyStyle = getComputedStyle(document.body);
        for (const prop of ['display', 'flexDirection', 'justifyContent', 'alignItems', 'padding']) {
            inner.style[prop] = bodyStyle[prop];
        }

        // The copy is pinned to the viewport but the content it clones starts at
        // the top of the document, so pull it back by however far we've scrolled.
        const scrolled = window.scrollY || document.documentElement.scrollTop;

        // Copy every top-level block rather than one known wrapper — the homepage
        // uses .content and the note pages use .post-wrap.
        for (const child of document.body.children) {
            if (child === button || child.tagName === 'SCRIPT' || child.tagName === 'STYLE') continue;
            if (child.classList.contains('theme-reveal') ||
                child.classList.contains('page-overlay')) continue;
            const copy = child.cloneNode(true);
            // Ids stay: too much of the layout is styled through them
            // (#game-container, #controls' grid areas, #cv-panel's display) and
            // stripping them collapses the copy. They do duplicate the real ones
            // for the half second this is up, but the layer is appended last and
            // getElementById resolves to the first match in document order, so
            // live elements still win every lookup.
            //
            // Plugin-backed boxes become plain spacer divs measured off the live
            // element. Cloning the CV <embed> spawns a second PDF viewer that
            // visibly repaints; deleting it outright collapsed the panel and
            // dragged the download link and the social row up out of place; and
            // blanking its src doesn't work either, since an <embed> with no src
            // represents nothing and gets a zero box. The spacer holds the space
            // open, and holdPluginsAbove() floats the real PDF over the ripple to
            // fill it — which is how it should look anyway, a PDF rendering the
            // same in either theme.
            const livePlugins = child.querySelectorAll('embed, iframe, object');
            copy.querySelectorAll('embed, iframe, object').forEach((el, i) => {
                const live = livePlugins[i];
                if (!live) { el.remove(); return; }
                const box = live.getBoundingClientRect();
                const cs = getComputedStyle(live);
                const spacer = document.createElement('div');
                spacer.style.cssText =
                    `box-sizing:border-box;width:${box.width}px;height:${box.height}px;` +
                    `display:${cs.display === 'inline' ? 'inline-block' : cs.display};` +
                    `vertical-align:${cs.verticalAlign};margin:${cs.margin};` +
                    `border-radius:${cs.borderRadius};`;
                el.replaceWith(spacer);
            });
            if (scrolled) copy.style.transform = `translateY(${-scrolled}px)`;
            inner.appendChild(copy);
        }

        bubble.appendChild(inner);
        document.body.appendChild(bubble);
        return { bubble, inner };
    }

    // Float any on-screen plugin box (the CV's PDF) above the ripple for the
    // duration, so it is neither cloned nor swept over. Returns the undo.
    function holdPluginsAbove() {
        const held = [...document.querySelectorAll('embed, iframe, object')]
            .filter(el => el.offsetParent !== null);
        held.forEach(el => el.classList.add('theme-reveal-hold'));
        return () => held.forEach(el => el.classList.remove('theme-reveal-hold'));
    }

    // Where the bubble starts, how big it is, and how far it travels: it ends
    // centred on the viewport (so a radius of half the diagonal covers every
    // corner) and starts back along the line to the corner furthest from the
    // button, far enough out to be entirely off-screen.
    function rippleGeometry(x, y) {
        // clientWidth/Height so this matches the box the real content lays out
        // in, scrollbar excluded.
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        const radius = Math.ceil(Math.hypot(w, h) / 2) + 2;

        // Head towards whichever corner is furthest from the button.
        const toX = x < w / 2 ? w : 0;
        const toY = y < h / 2 ? h : 0;
        const len = Math.hypot(toX - x, toY - y) || 1;
        const ux = (toX - x) / len, uy = (toY - y) / len;

        const endX = w / 2, endY = h / 2;
        const clearsViewport = (cx, cy) => {
            const nx = Math.min(Math.max(cx, 0), w);
            const ny = Math.min(Math.max(cy, 0), h);
            return Math.hypot(cx - nx, cy - ny) >= radius;
        };
        let travel = radius;
        const limit = radius + Math.hypot(w, h) * 2;
        while (travel < limit && !clearsViewport(endX - ux * travel, endY - uy * travel)) travel += 8;

        const startX = endX - ux * travel, startY = endY - uy * travel;
        return {
            radius,
            viewW: w,
            viewH: h,
            left: startX - radius,
            top: startY - radius,
            dx: ux * travel,
            dy: uy * travel,
        };
    }

    function toggleTheme() {
        if (animating) return;
        animating = true;

        const isDark = document.documentElement.classList.contains('dark-mode');
        const willBeDark = !isDark;

        const rect = button.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Remove page-fade overlay if still active
        const pageFade = document.getElementById('page-fade');
        if (pageFade) pageFade.remove();

        const applyTheme = () => {
            document.documentElement.classList.toggle('dark-mode');
            button.innerHTML = willBeDark ? sunIcon : moonIcon;
            localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            applyTheme();
            animating = false;
            return;
        }

        const geom = rippleGeometry(x, y);
        const releasePlugins = holdPluginsAbove();
        const { bubble, inner } = buildRevealLayer(willBeDark, geom);

        // Same timing on both, so the translations stay exact inverses throughout.
        const timing = { duration: 550, easing: 'cubic-bezier(0.3, 0, 0.4, 1)', fill: 'forwards' };
        inner.animate(
            [{ transform: 'translate(0px, 0px)' },
             { transform: `translate(${-geom.dx}px, ${-geom.dy}px)` }],
            timing
        );
        bubble.animate(
            [{ transform: 'translate(0px, 0px)' },
             { transform: `translate(${geom.dx}px, ${geom.dy}px)` }],
            timing
        ).finished.then(() => {
            // The copy covers the viewport now, so switch the real page to the
            // new theme behind it and drop the copy in the same frame — the two
            // are identical at that point, so nothing visibly changes at the
            // swap. Transitions are suppressed so nothing cross-fades instead.
            document.documentElement.classList.add('no-transitions');
            applyTheme();
            bubble.remove();
            releasePlugins();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                document.documentElement.classList.remove('no-transitions');
                animating = false;
            }));
        });
    }

    button.addEventListener('click', toggleTheme);
    document.body.appendChild(button);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.documentElement.classList.add('dark-mode');
                button.innerHTML = sunIcon;
            } else {
                document.documentElement.classList.remove('dark-mode');
                button.innerHTML = moonIcon;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', createThemeToggle);
