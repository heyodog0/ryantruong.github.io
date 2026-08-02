# Notes

Each note is a standalone HTML page in this folder, so every note has its own
URL (`/notes/slug.html`) that can be linked, shared, and indexed by search
engines. The Notes panel on the homepage is just the index of them.

## Adding a note

1. Copy `heyodogo.html` to `notes/your-slug.html`. Use a short, descriptive,
   lowercase-with-hyphens slug — it becomes the URL and shouldn't change later.
2. Edit the four marked spots: `<title>`, `<meta name="description">`, the
   `<h1>`, and the date in `.post-meta`.
3. Replace everything between the `WRITE THINGS` comment markers.
4. Add an entry at the **top** of the `<ul class="post-list">` in `index.html`
   (newest first):

```html
<li class="post-item">
    <a class="post-title" href="notes/your-slug.html">Your title</a>
    <p class="post-date">Month D, YYYY</p>
</li>
```

## Details

- Styling lives in `styles/components/post.css`. Notes inherit the site's
  light/dark theme automatically — don't hardcode colors, use the CSS variables.
- Images go in `assets/` and are referenced as `../assets/whatever.png`.
- Long code lines scroll inside their block rather than widening the page.

## Writing in LaTeX or Markdown instead

If you'd rather draft in Markdown or LaTeX, convert to HTML and paste the result
into the `.post-body` div:

```
pandoc note.md -o body.html          # Markdown
pandoc note.tex -o body.html         # LaTeX
```

For math, add KaTeX or MathJax to the individual note that needs it rather than
loading it on every page.
