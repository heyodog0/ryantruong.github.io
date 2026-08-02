document.addEventListener('DOMContentLoaded', () => {
    function fadeInOverlay() {
        // Remove any leftover overlays from before navigation
        document.querySelectorAll('.page-overlay').forEach(el => el.remove());

        const o = document.createElement('div');
        o.className = 'page-overlay';
        o.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 9998;
            background: var(--bg-color);
            opacity: 1;
            pointer-events: none;
            transition: none;
        `;
        document.body.appendChild(o);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                o.style.transition = 'opacity 0.2s ease';
                o.style.opacity = '0';
                o.addEventListener('transitionend', () => o.remove(), { once: true });
            });
        });
    }

    // Fade in on initial load
    fadeInOverlay();

    // Fade in again when restored from back-forward cache
    window.addEventListener('pageshow', e => {
        if (e.persisted) fadeInOverlay();
    });

});
