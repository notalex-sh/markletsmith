<p align="center">
  <img src="markletsmith-logo.png" alt="markletsmith" width="160" />
</p>

<h1 align="center">markletsmith</h1>
<p align="center">bookmarklet forge &mdash; turn JavaScript into drag-and-drop bookmarklets</p>

<p align="center">
  <a href="https://markletsmith.notalex.sh">markletsmith.notalex.sh</a>
</p>

---

## Features

- **Code editor** — full CodeMirror 6 editor with syntax highlighting, bracket matching, search, and folding
- **Minification** — compress your code with Terser before encoding
- **IIFE wrapping** — auto-wrap in `(function(){...})()` to avoid polluting the page scope
- **URI encoding** — encode the output for browser compatibility
- **External scripts & styles** — inject third-party JS/CSS via URL, with optional `!loadOnce` dedup
- **Drag-and-drop output** — generated bookmarklet link you can drag straight to your bookmarks bar
- **Size stats** — see original vs. compressed size and reduction percentage
- **Copy to clipboard** — one-click copy with toast confirmation

## Tech

- [SvelteKit](https://svelte.dev) + TypeScript
- [CodeMirror 6](https://codemirror.net)
- [Terser](https://terser.org) for minification
