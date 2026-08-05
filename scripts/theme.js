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

    // The ripple keyframes are generated per click rather than living in
    // theme.css with var(--ripple-x/y) placeholders. Two reasons:
    //   - custom properties have to inherit all the way down the
    //     ::view-transition pseudo tree to reach the animating pseudo-element;
    //     where that doesn't happen the var() falls back and the circle starts
    //     from the middle of the page instead of the button.
    //   - the end radius has to reach the viewport corner furthest from the
    //     button. 100vmax isn't enough — from the top-right of a 1000x700
    //     window the far corner is 1165px away — so the last wedge of the page
    //     never got revealed and snapped instead.
    const rippleStyle = document.createElement('style');
    document.head.appendChild(rippleStyle);

    function setRippleOrigin(x, y) {
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );
        rippleStyle.textContent = `@keyframes ripple-reveal {
            from { clip-path: circle(0px at ${x}px ${y}px); }
            to   { clip-path: circle(${Math.ceil(radius)}px at ${x}px ${y}px); }
        }`;
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

        setRippleOrigin(x, y);

        const applyTheme = () => {
            document.documentElement.classList.toggle('dark-mode');
            button.innerHTML = willBeDark ? sunIcon : moonIcon;
            localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
        };

        if (document.startViewTransition) {
            const transition = document.startViewTransition(applyTheme);
            transition.finished.then(() => { animating = false; });
        } else {
            applyTheme();
            animating = false;
        }
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
