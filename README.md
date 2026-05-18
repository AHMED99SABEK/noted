# Noted

A self-contained, markdown-based personal note-taking app with voice/video recording, Mermaid diagram rendering, PDF export, and optional cloud sync via Cloudflare Workers + D1.

**Live site:** https://AHMED99SABEK.github.io/noted/  
**Open `index.html`** in any modern browser — no build step, no npm, no server required for local use.

---

## Features

- **Markdown editor** with three views: edit, split (live preview side-by-side), and preview-only
- **Mermaid diagrams** — render ` ```mermaid ` code blocks as SVG diagrams with dark theme
- **Voice & video recording** — record directly in the browser via `MediaRecorder`, embed in notes, auto-transcribe with Web Speech API
- **PDF export** — renders diagrams as SVGs, clean typography, strips media with transcripts
- **Markdown export/import** — download notes as `.md` files, drag-and-drop or pick files to import
- **JSON backup** — export/import all notes as a single JSON file
- **Image paste** — paste screenshots directly into notes (base64 embedded)
- **Search** — filter notes by title with real-time matching
- **Auto-save** — every keystroke saves to `localStorage`
- **Sync scroll** — editor and preview scroll together in split view
- **Dark theme** — minimal design with monospace + serif typography
- **Keyboard shortcuts** — `Ctrl+N`, `Ctrl+S`, `Ctrl+P`, `Ctrl+Shift+D`

---

## Getting Started (Local)

1. Open `index.html` in any modern browser.
2. Start typing — notes are automatically saved to your browser's `localStorage`.
3. Use the gear icon (⚙) to optionally configure server sync.

### Seed Notes

On first load, the app fetches `notes.json` from the same origin. If unavailable, built-in fallback notes for Chapters 6–8 (Creational, Structural & Behavioral Design Patterns) plus a DNS explainer are used.

---

## Server Sync (Optional)

Sync your notes across devices using a Cloudflare Worker + D1 database.

### Setup

1. Deploy the Worker at `server/` to Cloudflare:
   ```
   cd server
   npm run deploy
   ```
2. Set your API key:
   ```
   wrangler secret put API_KEY
   ```
3. Create and migrate the D1 database:
   ```
   npm run db:create
   npm run db:execute
   ```
4. In the app, click the gear icon, enter your Worker URL and API key, then click Save.

### How Sync Works

- **Auto-sync:** Every keystroke triggers a debounced push (2s delay) to the server.
- **Pull on load:** When the app opens, it pulls notes from the server if configured.
- **Conflict resolution:** Last-write-wins by `updated` timestamp — newer data always overwrites older.
- **Bulk upsert:** `PUT /api/notes` sends the entire notes array; the server only overwrites rows with newer timestamps.

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | Health check |
| `GET` | `/api/notes` | Yes | List all notes (id, title, updated) |
| `POST` | `/api/notes` | Yes | Create a note |
| `PUT` | `/api/notes` | Yes | Bulk upsert all notes |
| `GET` | `/api/notes/:id` | Yes | Get a single note |
| `PUT` | `/api/notes/:id` | Yes | Update a single note |
| `DELETE` | `/api/notes/:id` | Yes | Delete a note |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` / `Cmd+N` | New note |
| `Ctrl+S` / `Cmd+S` | Save |
| `Ctrl+P` / `Cmd+P` | Export PDF |
| `Ctrl+Shift+D` / `Cmd+Shift+D` | Delete current note |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML/CSS/JS (single file) |
| Markdown | [marked.js](https://marked.js.org/) v9.1.6 |
| Diagrams | [Mermaid](https://mermaid.js.org/) v11.14.0 |
| Speech | Web Speech API (`SpeechRecognition`) |
| Recording | `MediaRecorder` API |
| Storage (local) | `localStorage` |
| Backend | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite-compatible) |
| Auth | Bearer token (API key) |
| Hosting (frontend) | GitHub Pages |

---

## License

MIT
