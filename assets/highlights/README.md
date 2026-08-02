# Highlight thumbnails

Images referenced by the Highlights sub-tab in `index.html`:

- `Social_ToM.png` — Using Theory of Mind to Arbitrate between Social and Non-social Learning
- `aigamestore.png` — AI Gamestore

Teaser figures work well. They're displayed at 170px wide in a 16:10 box using
`background-size: contain`, so the whole figure stays visible and any aspect
ratio is fine — nothing gets cropped. A missing file renders as an empty tinted
box rather than a broken image.

To add a highlight, copy an `<li class="hl">` block in `index.html` and point
its `background-image` at the new file.
