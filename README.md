# Slate — Browser Whiteboard Tool

A no-database, browser-only whiteboard for sketching, diagramming, and quick visual notes. Pure Canvas API — pen, eraser, shapes, text, undo/redo, and PNG export, wrapped in a clean dark UI.

## Features

- **Pen tool** — freehand drawing with adjustable color and stroke size
- **Eraser** — removes strokes without leaving a canvas gap
- **Shape tools** — line, rectangle, circle, and arrow, each with a live drag preview and an optional filled mode
- **Text tool** — click anywhere to drop an inline text input, styled to match the chosen color/size
- **Color picker** — 6 quick-swatch presets plus a full native color picker
- **Adjustable stroke size** via slider (1–40px)
- **Undo / Redo** — full history stack, with `Ctrl+Z` / `Ctrl+Shift+Z` (or `Ctrl+Y`) keyboard shortcuts
- **Clear canvas** with a confirmation prompt
- **Export as PNG** — one click downloads the current board
- **Responsive canvas** — resizes with the window while preserving the current drawing
- **Touch support** — works with touchscreens/tablets, not just mouse

## Tech Stack

- HTML5 `<canvas>` + Canvas 2D API
- CSS3 (Google Fonts: Space Grotesk, dotted-grid background, no framework)
- Vanilla JavaScript (ES6+) — no libraries
- No database, no backend, no build step

## Project Structure

```
whiteboard/
├── index.html          # Toolbar + canvas markup
├── css/
│   └── style.css        # Dark theme, toolbar, canvas grid background
├── js/
│   ├── history.js        # Undo/redo snapshot stack
│   └── app.js              # Drawing engine: tools, shapes, text, export
└── README.md
```
## Setup & Running

1. Download/clone this folder.
2. Open `index.html` directly in a browser, or serve it locally:
   ```bash
   cd whiteboard
   python -m http.server 8000
   ```
3. Visit `http://localhost:8000` (or just open the file) and start drawing.

## How It Works