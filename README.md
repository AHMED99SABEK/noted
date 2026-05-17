# Noted

A self-contained markdown note-taking app with voice recording, Mermaid diagrams, and PDF export.

Open `index.html` in any modern browser — no server, no build step, no dependencies.

## Features

- **Markdown editor** with live preview (edit/split/preview views)
- **Mermaid diagrams** — render ` ```mermaid ` code blocks as SVG diagrams
- **Voice & video recording** — record directly in the browser, embed recordings in notes, auto-transcribed via Web Speech API
- **PDF export** — renders diagrams as SVGs, strips media with transcripts, clean typography
- **Markdown export** — download any note as a standalone `.md` file
- **Import `.md` files** — drag-and-drop or file picker, auto-extracts title from first H1
- **Image paste** — paste screenshots directly into notes (base64 embedded)
- **Search** — filter notes by title
- **Auto-save** — every keystroke saves to `localStorage`
- **Keyboard shortcuts** — `Ctrl+N` new, `Ctrl+S` save, `Ctrl+P` PDF, `Ctrl+Shift+D` delete
- **Sync scroll** — editor and preview scroll together in split view
- **Dark theme** — minimal, monospace + serif typography
- **Persistent storage** — notes survive page reloads via `localStorage`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New note |
| `Ctrl+S` | Save |
| `Ctrl+P` | Export PDF |
| `Ctrl+Shift+D` | Delete current note |

## License

MIT
