// ---- app.js: canvas drawing engine (pen, eraser, shapes, text, undo/redo, export) ----

const canvas = document.getElementById("board");
const ctx = canvas.getContext("dpr" in window ? "2d" : "2d");
const wrap = document.querySelector(".canvas-wrap");
const textLayer = document.getElementById("textInputLayer");

const colorPicker = document.getElementById("colorPicker");
const sizeSlider = document.getElementById("sizeSlider");
const sizeVal = document.getElementById("sizeVal");
const fillShapeCheckbox = document.getElementById("fillShape");
const swatchesEl = document.getElementById("swatches");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");

const SWATCHES = ["#eae6ff", "#a78bfa", "#38e6c5", "#ff8787", "#ffd166", "#4dabf7"];

let currentTool = "pen";
let currentColor = colorPicker.value;
let currentSize = parseInt(sizeSlider.value, 10);
let fillShape = false;

let drawing = false;
let startX = 0, startY = 0;
let snapshotBeforeShape = null; // ImageData taken before a shape drag, for live preview

// ---------- Canvas sizing ----------
function resizeCanvas() {
  const rect = wrap.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Preserve current drawing across resize
  const prevData = canvas.width && canvas.height
    ? ctx.getImageData(0, 0, canvas.width, canvas.height)
    : null;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = "#1a1b22";
  ctx.fillRect(0, 0, rect.width, rect.height);

  if (prevData) ctx.putImageData(prevData, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
saveHistory(true);

// ---------- Toolbar: swatches ----------
SWATCHES.forEach((color, i) => {
  const sw = document.createElement("div");
  sw.className = "swatch" + (i === 0 ? " active" : "");
  sw.style.background = color;
  sw.addEventListener("click", () => {
    currentColor = color;
    colorPicker.value = color;
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
    sw.classList.add("active");
  });
  swatchesEl.appendChild(sw);
});

colorPicker.addEventListener("input", () => {
  currentColor = colorPicker.value;
  document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
});

sizeSlider.addEventListener("input", () => {
  currentSize = parseInt(sizeSlider.value, 10);
  sizeVal.textContent = currentSize;
});

fillShapeCheckbox.addEventListener("change", () => {
  fillShape = fillShapeCheckbox.checked;
});

// ---------- Toolbar: tool selection ----------
document.querySelectorAll(".tool-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentTool = btn.dataset.tool;
    canvas.style.cursor = currentTool === "eraser" ? "cell" : (currentTool === "text" ? "text" : "crosshair");
  });
});

// ---------- Drawing helpers ----------
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const point = e.touches ? e.touches[0] : e;
  return { x: point.clientX - rect.left, y: point.clientY - rect.top };
}

function beginStroke(x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = currentTool === "eraser" ? "#1a1b22" : currentColor;
  ctx.fillStyle = currentColor;
  ctx.lineWidth = currentTool === "eraser" ? currentSize * 2.2 : currentSize;
}

function drawLineTo(x, y) {
  ctx.lineTo(x, y);
  ctx.stroke();
}

function drawShapePreview(x0, y0, x1, y1) {
  ctx.putImageData(snapshotBeforeShape, 0, 0);
  ctx.beginPath();
  ctx.strokeStyle = currentColor;
  ctx.fillStyle = currentColor;
  ctx.lineWidth = currentSize;
  ctx.lineCap = "round";

  if (currentTool === "line") {
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  } else if (currentTool === "rect") {
    const w = x1 - x0, h = y1 - y0;
    fillShape ? ctx.fillRect(x0, y0, w, h) : ctx.strokeRect(x0, y0, w, h);
  } else if (currentTool === "circle") {
    const r = Math.hypot(x1 - x0, y1 - y0);
    ctx.arc(x0, y0, r, 0, Math.PI * 2);
    fillShape ? ctx.fill() : ctx.stroke();
  } else if (currentTool === "arrow") {
    drawArrow(x0, y0, x1, y1);
  }
}

function drawArrow(x0, y0, x1, y1) {
  const headLen = 10 + currentSize;
  const angle = Math.atan2(y1 - y0, x1 - x0);
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - headLen * Math.cos(angle - Math.PI / 6), y1 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x1 - headLen * Math.cos(angle + Math.PI / 6), y1 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

// ---------- Pointer events ----------
function onPointerDown(e) {
  const { x, y } = getPos(e);
  startX = x; startY = y;

  if (currentTool === "text") {
    openTextInput(x, y);
    return;
  }

  drawing = true;

  if (currentTool === "pen" || currentTool === "eraser") {
    beginStroke(x, y);
  } else {
    snapshotBeforeShape = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

function onPointerMove(e) {
  if (!drawing) return;
  const { x, y } = getPos(e);

  if (currentTool === "pen" || currentTool === "eraser") {
    drawLineTo(x, y);
  } else if (["line", "rect", "circle", "arrow"].includes(currentTool)) {
    drawShapePreview(startX, startY, x, y);
  }
}

function onPointerUp() {
  if (!drawing) return;
  drawing = false;
  saveHistory();
}

canvas.addEventListener("mousedown", onPointerDown);
canvas.addEventListener("mousemove", onPointerMove);
window.addEventListener("mouseup", onPointerUp);

canvas.addEventListener("touchstart", (e) => { e.preventDefault(); onPointerDown(e); }, { passive: false });
canvas.addEventListener("touchmove", (e) => { e.preventDefault(); onPointerMove(e); }, { passive: false });
canvas.addEventListener("touchend", onPointerUp);

// ---------- Text tool ----------
function openTextInput(x, y) {
  const input = document.createElement("input");
  input.type = "text";
  input.style.left = x + "px";
  input.style.top = (y - 12) + "px";
  input.style.fontSize = (14 + currentSize) + "px";
  input.style.color = currentColor;
  textLayer.appendChild(input);
  input.focus();

  function commit() {
    const text = input.value.trim();
    if (text) {
      ctx.fillStyle = currentColor;
      ctx.font = `${14 + currentSize}px 'Space Grotesk', sans-serif`;
      ctx.fillText(text, x, y + (14 + currentSize) * 0.8 - 12);
      saveHistory();
    }
    input.remove();
  }

  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") { input.value = ""; input.blur(); }
  });
}

// ---------- History (undo/redo) ----------
function saveHistory(isInitial = false) {
  const dataUrl = canvas.toDataURL();
  if (isInitial) HistoryStack.reset(dataUrl);
  else HistoryStack.push(dataUrl);
  updateHistoryButtons();
}

function loadFromDataUrl(dataUrl) {
  const img = new Image();
  img.onload = () => {
    const rect = wrap.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, rect.width, rect.height);
  };
  img.src = dataUrl;
}

function updateHistoryButtons() {
  undoBtn.disabled = !HistoryStack.canUndo();
  redoBtn.disabled = !HistoryStack.canRedo();
}

undoBtn.addEventListener("click", () => {
  const prev = HistoryStack.undo();
  if (prev) { loadFromDataUrl(prev); updateHistoryButtons(); }
});

redoBtn.addEventListener("click", () => {
  const next = HistoryStack.redo();
  if (next) { loadFromDataUrl(next); updateHistoryButtons(); }
});

// Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y)
window.addEventListener("keydown", (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  if (e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undoBtn.click(); }
  if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") { e.preventDefault(); redoBtn.click(); }
});

// ---------- Clear ----------
clearBtn.addEventListener("click", () => {
  if (!confirm("Clear the whole board?")) return;
  const rect = wrap.getBoundingClientRect();
  ctx.fillStyle = "#1a1b22";
  ctx.fillRect(0, 0, rect.width, rect.height);
  saveHistory();
});

// ---------- Export ----------
exportBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `slate-drawing-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});
