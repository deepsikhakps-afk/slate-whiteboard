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

1. **Drawing**: mouse/touch events on the `<canvas>` capture pointer position; the pen and eraser tools draw continuous strokes via `lineTo`/`stroke`, while shape tools (line, rect, circle, arrow) redraw a live preview on every `mousemove` by restoring a pre-drag snapshot (`getImageData`) and drawing the shape fresh — so the preview doesn't smear.
2. **Text**: clicking with the text tool overlays a real `<input>` positioned absolutely over the canvas; on blur/Enter, the typed text is rendered onto the canvas with `fillText` and the input is removed.
3. **Undo/Redo**: after every completed action, the canvas is serialized with `toDataURL()` and pushed onto a history stack (capped at 40 states). Undo/redo restores the corresponding snapshot with `drawImage`.
4. **Export**: `canvas.toDataURL("image/png")` is used to trigger a PNG download via a temporary `<a download>` link.
5. **Resizing**: on window resize, the current canvas content is preserved (via `getImageData`/`putImageData`) before the canvas is resized and redrawn, so in-progress work isn't lost.

## Possible Extensions

- Shape selection + move/resize after drawing (not just draw-once)
- Multi-layer support
- Save/load board state to `localStorage` so work persists across reloads
- Real-time collaborative drawing via WebSockets
- Sticky notes / image insertion

## License

Free to use for academic/educational purposes.
