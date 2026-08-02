# ryanvt.com

Personal site. Static HTML/CSS/JS, no build step, served by GitHub Pages.

## Structure

```
index.html          Homepage. The game plus the About / Research / Notes / CV
                    panels, which swap in place without changing the URL.
about.html          Redirect to / (kept so old links don't 404).

scripts/
  view-swap.js      Panel switching, nav centring, research sub-tabs.
  game.js           The maze game.
  theme.js          Light/dark toggle.
  transitions.js    Page fade-in.

styles/
  main.css          Imports everything below, in order.
  base.css          Page fundamentals, typography, nav.
  theme.css         Colour variables for both themes, toggle button.
  components/
    layout.css      Per-view vertical placement, swap container, social icons.
    game.css        Maze grid and controls.
    panels.css      Shared panel behaviour; About, Notes, CV.
    research.css    Research sub-tabs, publications list, highlights list.
    post.css        Note pages (separate layout — top-aligned for reading).

notes/              One HTML file per note; see notes/README.md.
assets/highlights/  Thumbnails for the Research → Highlights list.
typstcv.typ         CV source. Compile with: typst compile typstcv.typ ryan_cv.pdf
ryan_cv.pdf         Generated CV, embedded in the CV panel.
```

## Working on it

Serve locally (opening `index.html` directly breaks the relative paths):

```
python3 -m http.server 8000
```

Colours come from the CSS variables in `theme.css` — use those rather than
hardcoding, so both light and dark modes stay correct.

After editing `typstcv.typ`, recompile `ryan_cv.pdf` or the site will show a
stale CV.
